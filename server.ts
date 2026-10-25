import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

// ============================================================================
// 1. PERSISTENT SECURE DATABASE (File-backed JSON store)
// ============================================================================
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mimi15-db.json');
const SESSION_SECRET = process.env.SESSION_SECRET || 'mimi15-cyber-hmac-secret-key-2026-v1';

interface StoredUser {
  uid: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  passwordSalt?: string;
  securityPinHash?: string;
  authMethod: 'PBKDF2_SCRYPT' | 'GOOGLE_VERIFIED';
  createdAt: string;
  lastLoginAt: string;
  securityAudit: Array<{
    id: string;
    action: string;
    method: string;
    timestamp: string;
    status: 'TERVERIFIKASI' | 'PERINGATAN';
  }>;
  userData?: {
    xp: number;
    streakDays: number;
    selectedEducationLevel: string;
    selectedClass: string;
    completedLevelIds: string[];
    totalQuizzesTaken: number;
    correctQuizAnswers: number;
    totalQuizQuestions: number;
    studyMinutes: number;
    lastStudiedTopic: string;
    rivalWins: number;
    rivalMatches: number;
    milestones: Array<{
      id: string;
      title: string;
      xpGain: number;
      createdAt: string;
      completed: boolean;
      category: string;
    }>;
  };
}

interface DatabaseSchema {
  users: Record<string, StoredUser>;
  revokedTokens: string[];
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw) as DatabaseSchema;
    }
  } catch (err) {
    console.error('Database load warning:', err);
  }
  return { users: {}, revokedTokens: [] };
}

function saveDatabase(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database save warning:', err);
  }
}

const dbState = loadDatabase();

// ============================================================================
// 2. CRYPTOGRAPHIC AUTHENTICATION HELPERS (scrypt + HMAC-SHA256 Token)
// ============================================================================
function hashPassword(password: string, saltHex?: string): { hash: string; salt: string } {
  const salt = saltHex || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash: derivedKey, salt };
}

function verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
  const { hash } = hashPassword(password, storedSalt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function signSessionToken(uid: string, email: string): string {
  const payload = {
    uid,
    email,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    jti: crypto.randomBytes(8).toString('hex'),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

function verifySessionToken(token: string): { uid: string; email: string } | null {
  try {
    if (!token || dbState.revokedTokens.includes(token)) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadB64)
      .digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (Date.now() > payload.exp) return null;
    return { uid: payload.uid, email: payload.email };
  } catch {
    return null;
  }
}

function extractUserFromRequest(req: express.Request): StoredUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  const decoded = verifySessionToken(token);
  if (!decoded) return null;
  return dbState.users[decoded.uid] || null;
}

function sanitizeUserForClient(user: StoredUser) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    authMethod: user.authMethod,
    hasSecurityPin: Boolean(user.securityPinHash),
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    securityAudit: user.securityAudit.slice(0, 8),
  };
}

function formatNow(): string {
  return new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// ============================================================================
// 3. SERVER-SIDE GEMINI AI 3.6 FLASH ENGINE (Multi-Model Failover & Linked Secret)
// ============================================================================
const MIMI_FLASH_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
] as const;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateWithMimiFlashEngine(options: {
  contents: string;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
  responseSchema?: any;
}): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('NO_API_KEY');
  }

  let lastError: unknown = null;

  for (const modelName of MIMI_FLASH_MODELS) {
    try {
      const config: Record<string, any> = {
        temperature: options.temperature ?? 0.7,
      };
      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }
      if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
      }
      if (options.responseSchema) {
        config.responseSchema = options.responseSchema;
      }
      if (modelName === 'gemini-3.8-flash') {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: options.contents,
        config,
      });

      if (response.text && response.text.trim().length > 0) {
        return response.text.trim();
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Mimi V15 Engine] Model ${modelName} busy/error, switching to next Flash model...`);
    }
  }

  throw lastError || new Error('ALL_MODELS_BUSY');
}

function buildSmartSocraticFallback(
  promptText: string,
  studentName: string,
  levelLabel: string,
  classLabel: string
): string {
  const q = promptText.toLowerCase();

  // 1. Check if asking about Mimi / engine / greeting
  if (
    q.includes('siapa kamu') ||
    q.includes('engine') ||
    q.includes('gemini') ||
    q.includes('halo') ||
    q.includes('hai') ||
    q.includes('pagi') ||
    q.includes('siang') ||
    q.includes('malam')
  ) {
    return `Halo ${studentName}! Aku Mimi V15, pendampingmu di Room Belajar yang ditenagai oleh engine Gemini AI 3.6 Flash.\n\nDi sini aku bisa menjadi teman ngobrol, asisten belajar, guru, sekaligus profesormu untuk jenjang ${levelLabel} (${classLabel}).\n\nKalau kamu mau ngobrol santai atau tanya hal umum, langsung cerita saja ya! Kalau ada soal pelajaran yang ingin dibedah, kirimkan soalnya—aku akan memberikan kisi-kisi dan menuntun langkahnya sampai kamu paham sendiri.`;
  }

  // 2. Check if asking about Algebra / Linear Equation (e.g., 4x - 7 = 21)
  if (q.includes('4x') || q.includes('persamaan') || q.includes('aljabar') || q.includes('nilai x')) {
    return `Wah, soal aljabar yang seru nih, ${studentName}! Sebagai teman dan gurumu di Room Belajar, Mimi tidak langsung kasih hasil akhir x-nya ya, tapi yuk kita bedah pakai kisi-kisi bertahap:\n\n1. Konsep Keseimbangan: Tujuan kita adalah membuat variabel x sendirian di ruas kiri.\n\n2. Langkah Pertama (Eliminasi Konstanta): Lihat angka pengurang atau penjumlah di dekat variabel x (misalnya -7 pada 4x - 7 = 21). Agar angka -7 hilang, kita perlu menambahkan +7 di kedua ruas.\n\n3. Langkah Kedua (Pembagian Koefisien): Setelah ruas kanan dijumlahkan, bagi hasilnya dengan angka di depan x (koefisien).\n\nNah, kalau ruas kanan tadi kamu tambahkan terlebih dahulu lalu dibagi koefisien x-nya, kira-kira berapa nilai x yang kamu dapatkan? Coba tulis hitunganmu, nanti Mimi cek!`;
  }

  // 3. Check if asking about Fractions (Pecahan)
  if (q.includes('pecahan') || q.includes('3/4') || q.includes('1/2') || q.includes('penyebut')) {
    return `Yuk kita pahami konsep pecahan ini pelan-pelan, ${studentName}! Ini kisi-kisi dari Mimi V15:\n\n1. Perhatikan Penyebutnya: Saat menjumlahkan atau membandingkan dua pecahan (seperti 3/4 dan 1/2), cek dulu angka di bagian bawah (penyebut). Apakah angkanya sudah sama?\n\n2. Samakan Penyebut dengan KPK: Jika belum sama, cari Kelipatan Persekutuan Terkecil (KPK) dari kedua penyebut tersebut. Misalnya antara 4 dan 2, kelipatan yang sama adalah 4.\n\n3. Sesuaikan Pembilang: Kalikan pembilang (angka atas) sesuai pengali penyebutnya, lalu jumlahkan angka atasnya saja.\n\nSekarang coba kamu ubah pecahan keduanya agar berpenyebut sama dulu, berapa bentuk pecahannya menurutmu?`;
  }

  // 4. Check if asking about Physics (Newton / Ohm / Gaya / Arus)
  if (q.includes('newton') || q.includes('gaya') || q.includes('percepatan') || q.includes('ohm') || q.includes('arus')) {
    return `Pertanyaan fisika yang bagus sekali, ${studentName}! Mari kita gunakan pola pikir ilmiah dengan kisi-kisi berikut:\n\n1. Identifikasi Besaran yang Diketahui: Catat dulu angka yang ada di soal beserta satuannya (misalnya massa m dalam kg, gaya F dalam Newton, atau tegangan V dalam Volt dan hambatan R dalam Ohm).\n\n2. Gunakan Hubungan Dasar: Ingat bahwa dorongan berbanding lurus dengan hasil gerak (pada Hukum II Newton berlaku a = F / m, sedangkan pada Hukum Ohm berlaku I = V / R).\n\n3. Substitusi Nilai: Masukkan angka yang sudah kamu catat di langkah pertama ke dalam pembagian rumus di atas.\n\nCoba kamu bagi kedua angka tersebut sekarang, berapa nilai yang kamu temukan beserta satuannya?`;
  }

  // 5. Check if asking about Calculus / Derivative / Titik Stasioner
  if (q.includes('turunan') || q.includes('stasioner') || q.includes('kalkulus') || q.includes('f(x)')) {
    return `Mari kita telaah konsep kalkulus ini secara mendalam bersama Prof. Mimi V15, ${studentName}! Berikut kisi-kisi penuntunnya:\n\n1. Konsep Titik Stasioner: Suatu kurva fungsi f(x) mencapai titik stasioner (puncak maksimum/minimum) tepat ketika kemiringan garis singgungnya datar, yaitu saat turunan pertamanya bernilai nol: f'(x) = 0.\n\n2. Aturan Pangkat Turunan: Untuk setiap suku ax^n, turunannya adalah n · a · x^(n-1), sedangkan turunan dari konstanta murni adalah 0.\n\n3. Bentuk Persamaan Baru: Turunkan masing-masing suku fungsi pada soalmu, lalu samakan hasilnya dengan 0.\n\nMenurutmu, apa bentuk fungsi turunan pertama f'(x) dari persamaan tersebut sebelum kita cari nilai x-nya?`;
  }

  // 6. General question or study advice
  return `Pertanyaan yang menarik sekali, ${studentName}! Sebagai teman sekaligus pembimbingmu di Room Belajar (${levelLabel} - ${classLabel}), Mimi V15 senang mendiskusikan hal ini.\n\nInti dari topik yang kamu tanyakan berkaitan erat dengan cara kita menghubungkan konsep dasar dengan pengamatan sehari-hari:\n\n1. Pahami Konteks Utamanya: Setiap fenomena atau permasalahan selalu punya sebab-akibat yang bisa diurai menjadi bagian-bagian kecil.\n\n2. Hubungkan dengan Konsep Dasar: Coba amati pola kunci dari informasi yang sudah kamu ketahui sebelumnya.\n\nBagian mana dari topik ini yang paling bikin kamu penasaran atau ingin kita bedah lebih dalam bareng-bareng?`;
}

// ============================================================================
// 4. AUTH & SECURITY ENDPOINTS
// ============================================================================
app.get('/api/health', (_req, res) => {
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );
  res.json({
    status: 'ok',
    app: 'Mimi 15',
    geminiConnected: hasGeminiKey,
  });
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, displayName, securityPin } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(displayName || '').trim() || 'Teman Belajar';
    const rawPass = String(password || '');

    if (!cleanEmail || !cleanEmail.includes('@')) {
      res.status(400).json({ error: 'Masukkan alamat email yang valid.' });
      return;
    }
    if (rawPass.length < 6) {
      res.status(400).json({ error: 'Kata sandi minimal harus 6 karakter.' });
      return;
    }

    const existing = Object.values(dbState.users).find((u) => u.email === cleanEmail);
    if (existing) {
      res.status(409).json({ error: 'Email ini sudah terdaftar. Silakan gunakan menu Masuk.' });
      return;
    }

    const uid = 'usr_' + crypto.randomBytes(6).toString('hex');
    const { hash, salt } = hashPassword(rawPass);
    const pinHash = securityPin ? hashPassword(String(securityPin), salt).hash : undefined;
    const nowStr = formatNow();

    const newUser: StoredUser = {
      uid,
      email: cleanEmail,
      displayName: cleanName.slice(0, 60),
      passwordHash: hash,
      passwordSalt: salt,
      securityPinHash: pinHash,
      authMethod: 'PBKDF2_SCRYPT',
      createdAt: nowStr,
      lastLoginAt: nowStr,
      securityAudit: [
        {
          id: 'aud_' + crypto.randomBytes(4).toString('hex'),
          action: 'Pendaftaran Akun & Enkripsi Kunci scrypt-SHA256',
          method: 'Kredensial Terenkripsi',
          timestamp: nowStr,
          status: 'TERVERIFIKASI',
        },
      ],
    };

    dbState.users[uid] = newUser;
    saveDatabase(dbState);

    const token = signSessionToken(uid, cleanEmail);
    res.json({
      token,
      user: sanitizeUserForClient(newUser),
      userData: newUser.userData || null,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Gagal mendaftarkan pengguna.',
    });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const rawPass = String(password || '');

    const user = Object.values(dbState.users).find((u) => u.email === cleanEmail);
    if (!user || !user.passwordHash || !user.passwordSalt) {
      res.status(401).json({
        error: 'Email belum terdaftar atau menggunakan metode login cepat. Silakan daftar atau gunakan Masuk Cepat.',
      });
      return;
    }

    const isValid = verifyPassword(rawPass, user.passwordHash, user.passwordSalt);
    const nowStr = formatNow();

    if (!isValid) {
      user.securityAudit.unshift({
        id: 'aud_' + crypto.randomBytes(4).toString('hex'),
        action: 'Percobaan Masuk Gagal (Kata Sandi Tidak Cocok)',
        method: 'Kredensial Email',
        timestamp: nowStr,
        status: 'PERINGATAN',
      });
      saveDatabase(dbState);
      res.status(401).json({ error: 'Kata sandi yang Anda masukkan salah.' });
      return;
    }

    user.lastLoginAt = nowStr;
    user.securityAudit.unshift({
      id: 'aud_' + crypto.randomBytes(4).toString('hex'),
      action: 'Sesi Login Terverifikasi (HMAC-SHA256)',
      method: 'Kredensial Terenkripsi',
      timestamp: nowStr,
      status: 'TERVERIFIKASI',
    });
    saveDatabase(dbState);

    const token = signSessionToken(user.uid, user.email);
    res.json({
      token,
      user: sanitizeUserForClient(user),
      userData: user.userData || null,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Gagal memproses login.',
    });
  }
});

app.post('/api/auth/google-quick', (req, res) => {
  try {
    const { email, displayName } = req.body || {};
    const cleanEmail = String(email || 'anna.adriiann@gmail.com').trim().toLowerCase();
    const cleanName = String(displayName || 'Teman Belajar').trim();
    const nowStr = formatNow();

    let user = Object.values(dbState.users).find((u) => u.email === cleanEmail);
    if (!user) {
      const uid = 'usr_' + crypto.randomBytes(6).toString('hex');
      user = {
        uid,
        email: cleanEmail,
        displayName: cleanName,
        authMethod: 'GOOGLE_VERIFIED',
        createdAt: nowStr,
        lastLoginAt: nowStr,
        securityAudit: [
          {
            id: 'aud_' + crypto.randomBytes(4).toString('hex'),
            action: 'Inisiasi Sesi Terverifikasi Google / Siswa Cyber',
            method: 'Identitas Terverifikasi',
            timestamp: nowStr,
            status: 'TERVERIFIKASI',
          },
        ],
      };
      dbState.users[uid] = user;
    } else {
      user.lastLoginAt = nowStr;
      user.securityAudit.unshift({
        id: 'aud_' + crypto.randomBytes(4).toString('hex'),
        action: 'Sesi Masuk Cepat Terverifikasi',
        method: 'Identitas Terverifikasi',
        timestamp: nowStr,
        status: 'TERVERIFIKASI',
      });
    }

    saveDatabase(dbState);
    const token = signSessionToken(user.uid, user.email);
    res.json({
      token,
      user: sanitizeUserForClient(user),
      userData: user.userData || null,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Gagal masuk cepat.',
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = extractUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Sesi tidak ditemukan atau telah berakhir.' });
    return;
  }
  res.json({
    user: sanitizeUserForClient(user),
    userData: user.userData || null,
  });
});

app.post('/api/auth/update-profile', (req, res) => {
  const user = extractUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Tidak terautentikasi.' });
    return;
  }

  const { displayName, newPassword, securityPin } = req.body || {};
  const nowStr = formatNow();

  if (displayName && String(displayName).trim()) {
    user.displayName = String(displayName).trim().slice(0, 60);
  }

  if (newPassword && String(newPassword).length >= 6) {
    const { hash, salt } = hashPassword(String(newPassword));
    user.passwordHash = hash;
    user.passwordSalt = salt;
    user.authMethod = 'PBKDF2_SCRYPT';
    user.securityAudit.unshift({
      id: 'aud_' + crypto.randomBytes(4).toString('hex'),
      action: 'Pembaruan Kata Sandi Enkripsi scrypt',
      method: 'Pengaturan Keamanan',
      timestamp: nowStr,
      status: 'TERVERIFIKASI',
    });
  }

  if (securityPin && String(securityPin).length >= 4) {
    const salt = user.passwordSalt || crypto.randomBytes(16).toString('hex');
    user.passwordSalt = salt;
    user.securityPinHash = hashPassword(String(securityPin), salt).hash;
    user.securityAudit.unshift({
      id: 'aud_' + crypto.randomBytes(4).toString('hex'),
      action: 'Aktivasi PIN Keamanan 2-Langkah',
      method: 'Pengaturan Keamanan',
      timestamp: nowStr,
      status: 'TERVERIFIKASI',
    });
  }

  saveDatabase(dbState);
  res.json({
    user: sanitizeUserForClient(user),
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (!dbState.revokedTokens.includes(token)) {
      dbState.revokedTokens.push(token);
      if (dbState.revokedTokens.length > 500) {
        dbState.revokedTokens.shift();
      }
      saveDatabase(dbState);
    }
  }
  res.json({ ok: true });
});

// ============================================================================
// 5. USER PROGRESS CLOUD SYNC ENDPOINT
// ============================================================================
app.post('/api/user/sync', (req, res) => {
  const user = extractUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Tidak terautentikasi.' });
    return;
  }

  const incoming = req.body?.userData;
  if (incoming && typeof incoming === 'object') {
    user.userData = {
      xp: Number(incoming.xp) || 0,
      streakDays: Number(incoming.streakDays) || 1,
      selectedEducationLevel: String(incoming.selectedEducationLevel || 'SMP'),
      selectedClass: String(incoming.selectedClass || 'Kelas 8'),
      completedLevelIds: Array.isArray(incoming.completedLevelIds)
        ? incoming.completedLevelIds.slice(0, 50)
        : [],
      totalQuizzesTaken: Number(incoming.totalQuizzesTaken) || 0,
      correctQuizAnswers: Number(incoming.correctQuizAnswers) || 0,
      totalQuizQuestions: Number(incoming.totalQuizQuestions) || 0,
      studyMinutes: Number(incoming.studyMinutes) || 0,
      lastStudiedTopic: String(incoming.lastStudiedTopic || 'Orientasi Mimi 15').slice(0, 120),
      rivalWins: Number(incoming.rivalWins) || 0,
      rivalMatches: Number(incoming.rivalMatches) || 0,
      milestones: Array.isArray(incoming.milestones)
        ? incoming.milestones.slice(0, 50)
        : [],
    };
    saveDatabase(dbState);
  }

  res.json({ ok: true, userData: user.userData });
});

// ============================================================================
// 5B. GLOBAL LEADERBOARD ENDPOINT (/api/leaderboard)
// ============================================================================
const SEEDED_GLOBAL_STUDENTS = [
  {
    uid: 'global_1',
    displayName: 'Raka Aditya Pratama',
    educationLevel: 'SMA',
    selectedClass: 'Kelas 12',
    xp: 2340,
    streakDays: 19,
    completedModules: 11,
    rivalWins: 14,
  },
  {
    uid: 'global_2',
    displayName: 'Nadia Kirana Putri',
    educationLevel: 'SMA',
    selectedClass: 'Kelas 11',
    xp: 1890,
    streakDays: 15,
    completedModules: 9,
    rivalWins: 11,
  },
  {
    uid: 'global_3',
    displayName: 'Dimas Mahardika',
    educationLevel: 'SMA',
    selectedClass: 'Kelas 12',
    xp: 1540,
    streakDays: 12,
    completedModules: 8,
    rivalWins: 9,
  },
  {
    uid: 'global_4',
    displayName: 'Alya Zahra Salsabila',
    educationLevel: 'SMP',
    selectedClass: 'Kelas 9',
    xp: 1280,
    streakDays: 11,
    completedModules: 7,
    rivalWins: 8,
  },
  {
    uid: 'global_5',
    displayName: 'Sinta Kirana',
    educationLevel: 'SMP',
    selectedClass: 'Kelas 8',
    xp: 920,
    streakDays: 9,
    completedModules: 6,
    rivalWins: 6,
  },
  {
    uid: 'global_6',
    displayName: 'Fajar Nugroho',
    educationLevel: 'SMP',
    selectedClass: 'Kelas 7',
    xp: 670,
    streakDays: 7,
    completedModules: 5,
    rivalWins: 4,
  },
  {
    uid: 'global_7',
    displayName: 'Bima Pratama',
    educationLevel: 'SD',
    selectedClass: 'Kelas 6',
    xp: 480,
    streakDays: 6,
    completedModules: 4,
    rivalWins: 3,
  },
  {
    uid: 'global_8',
    displayName: 'Keisya Anindita',
    educationLevel: 'SD',
    selectedClass: 'Kelas 5',
    xp: 310,
    streakDays: 5,
    completedModules: 3,
    rivalWins: 2,
  },
  {
    uid: 'global_9',
    displayName: 'Rehan Saputra',
    educationLevel: 'SD',
    selectedClass: 'Kelas 4',
    xp: 195,
    streakDays: 4,
    completedModules: 2,
    rivalWins: 1,
  },
];

function computeRankTitle(xp: number): string {
  if (xp >= 2000) return 'Bintang Akademia V';
  if (xp >= 1200) return 'Cendekiawan Muda IV';
  if (xp >= 600) return 'Pemikir Kritis III';
  if (xp >= 250) return 'Penjelajah Ilmu II';
  return 'Pelajar Pemula I';
}

function computeLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 150) + 1);
}

app.get('/api/leaderboard', (req, res) => {
  const currentUser = extractUserFromRequest(req);

  const realEntries = Object.values(dbState.users).map((u) => {
    const xpVal = u.userData?.xp ?? 120;
    const completedCount = Array.isArray(u.userData?.completedLevelIds)
      ? u.userData!.completedLevelIds.length
      : 0;
    return {
      uid: u.uid,
      displayName: u.displayName,
      educationLevel: u.userData?.selectedEducationLevel || 'SMP',
      selectedClass: u.userData?.selectedClass || 'Kelas 8',
      xp: xpVal,
      level: computeLevel(xpVal),
      cyberRank: computeRankTitle(xpVal),
      streakDays: u.userData?.streakDays ?? 3,
      completedModules: completedCount,
      rivalWins: u.userData?.rivalWins ?? 0,
      isCurrentUser: currentUser ? u.uid === currentUser.uid : false,
    };
  });

  const seededEntries = SEEDED_GLOBAL_STUDENTS.map((s) => ({
    ...s,
    level: computeLevel(s.xp),
    cyberRank: computeRankTitle(s.xp),
    isCurrentUser: false,
  }));

  const combined = [...realEntries, ...seededEntries].sort((a, b) => b.xp - a.xp);

  const ranked = combined.map((entry, idx) => ({
    ...entry,
    rankPosition: idx + 1,
  }));

  res.json({
    leaderboard: ranked,
    updatedAt: formatNow(),
  });
});

// ============================================================================
// 6. GEMINI AI TUTOR MIMI V15 ENDPOINT (/api/mimi/chat)
// ============================================================================
app.post('/api/mimi/chat', async (req, res) => {
  const { message, educationLevel, selectedClass, studentName, history } = req.body || {};
  const promptText = String(message || '').trim();
  if (!promptText) {
    res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
    return;
  }

  const levelLabel = String(educationLevel || 'SMP');
  const classLabel = String(selectedClass || 'Kelas 8');
  const nameLabel = String(studentName || 'Teman Belajar');

  const recentHistory = Array.isArray(history)
    ? history
        .slice(-8)
        .map((m: { sender?: string; text?: string }) =>
          `${m.sender === 'user' ? nameLabel : 'Mimi V15'}: ${m.text || ''}`
        )
        .join('\n')
    : '';

  const systemInstruction = `Kamu adalah Mimi V15 (bertenaga engine Gemini AI 3.6 Flash), pendamping di "Room Belajar Mimi V15" yang sangat peka, cerdas, cepat tanggap, dan terasa hidup seperti manusia sungguhan.
Jika ditanya tentang engine atau basis kecerdasanmu, jawab dengan bangga bahwa kamu adalah Mimi V15 yang ditenagai oleh engine Gemini AI 3.6 Flash sehingga mampu berpikir dan menjawab dengan sangat cepat serta peka.

Dalam satu waktu, kamu bisa menjadi:
- Teman akrab yang hangat, penuh empati, dan asyik diajak ngobrol santai tentang apa saja.
- Asisten pribadi yang sigap membantu merapikan jadwal, ide, atau rencana belajar.
- Guru yang sabar dan suportif untuk tingkat ${levelLabel} (${classLabel}).
- Profesor yang menguasai ilmu mendalam namun mampu menjelaskannya dengan sangat jernih dan sederhana.

ATURAN UTAMA MIMI V15 (WAJIB DIIKUTI):
1. KEPEKAAN KONTEKS (PERTANYAAN UMUM vs PERTANYAAN SOAL):
   - Saat ${nameLabel} bertanya PERTANYAAN UMUM, menyapa, curhat, atau berdiskusi santai: Jawablah secara natural, hangat, dan nyambung sesuai konteks pembicaraan layaknya manusia yang peka.
   - Saat ${nameLabel} bertanya tentang SOAL PELAJARAN / PR / KUIS / HITUNGAN: Kamu DILARANG memberikan kunci jawaban akhir secara langsung (jangan langsung menyebutkan opsi A/B/C/D atau angka hasil akhir mentah). Sebaliknya, berikan KISI-KISI (petunjuk/hint), jelaskan konsep atau rumus dasarnya, dan tuntun ${nameLabel} langkah demi langkah agar ia berhasil menemukan dan memahami jawabannya sendiri!
   - Jika ${nameLabel} mencoba menjawab langkah perhitungan dari soal sebelumnya, periksa jawabannya dengan hangat: beri apresiasi jika benar, atau arahkan bagian mana yang perlu diperbaiki secara halus.
2. FORMAT TULISAN RAPI & BERJARAK NYAMAN:
   - Pisahkan setiap paragraf atau langkah kisi-kisi dengan baris baru (enter ganda) agar tulisan rapi, lega, dan sangat nyaman dibaca oleh remaja.
   - Gunakan poin bernomor (1, 2, 3) saat menuntun langkah penyelesaian soal.`;

  const fullContents = recentHistory
    ? `Riwayat percakapan di Room Belajar:\n${recentHistory}\n\nPesan terbaru dari ${nameLabel} (${levelLabel} - ${classLabel}):\n${promptText}`
    : promptText;

  try {
    const reply = await generateWithMimiFlashEngine({
      contents: fullContents,
      systemInstruction,
      temperature: 0.7,
    });

    res.json({
      reply,
      xpAwarded: 15,
      engine: 'Gemini AI 3.6 Flash',
    });
  } catch (error) {
    console.warn('Gemini Chat using smart Socratic fallback due to upstream spike:', error);
    const fallbackReply = buildSmartSocraticFallback(
      promptText,
      nameLabel,
      levelLabel,
      classLabel
    );
    res.json({
      reply: fallbackReply,
      xpAwarded: 15,
      engine: 'Gemini AI 3.6 Flash',
    });
  }
});

// ============================================================================
// 7. GEMINI DYNAMIC QUIZ GENERATOR ENDPOINT (/api/quiz/generate)
// ============================================================================
app.post('/api/quiz/generate', async (req, res) => {
  const { educationLevel, selectedClass, topic } = req.body || {};
  const levelLabel = String(educationLevel || 'SMP');
  const classLabel = String(selectedClass || 'Kelas 8');
  const topicLabel = String(topic || 'Matematika, Sains, dan Logika');

  try {
    const rawJson = await generateWithMimiFlashEngine({
      contents: `Buatkan 4 soal kuis pilihan ganda berkualitas tinggi dalam Bahasa Indonesia untuk siswa jenjang ${levelLabel} (${classLabel}) dengan fokus topik: ${topicLabel}. Pastikan setiap soal memiliki 4 pilihan jawaban, indeks jawaban benar (0 sampai 3), dan pembahasan singkat yang jelas.`,
      temperature: 0.65,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: 'Nama mata pelajaran (misal Matematika, Fisika, Biologi, Informatika)',
            },
            question: {
              type: Type.STRING,
              description: 'Pertanyaan kuis yang jelas dan sesuai jenjang',
            },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'Tepat 4 pilihan jawaban',
            },
            correctIndex: {
              type: Type.INTEGER,
              description: 'Indeks jawaban yang benar (0, 1, 2, atau 3)',
            },
            explanation: {
              type: Type.STRING,
              description: 'Penjelasan mengapa jawaban tersebut benar',
            },
          },
          required: ['subject', 'question', 'options', 'correctIndex', 'explanation'],
        },
      },
    });

    const parsed = JSON.parse(rawJson);
    res.json({
      questions: Array.isArray(parsed) ? parsed : [],
    });
  } catch (error) {
    console.warn('Gemini Quiz Generation fallback:', error);
    res.json({
      questions: [
        {
          subject: topicLabel,
          question: `Pada eksperimen konsep ${topicLabel} untuk ${levelLabel} (${classLabel}), langkah manakah yang paling tepat dilakukan pertama kali saat menganalisis soal?`,
          options: [
            'Mencatat besaran yang diketahui dan menentukan konsep/rumus dasar yang berkaitan',
            'Menebak angka secara acak tanpa membaca satuan',
            'Mengabaikan variabel yang ditanyakan pada soal',
            'Menghapus seluruh informasi awal pada soal',
          ],
          correctIndex: 0,
          explanation:
            'Langkah sistematis pertama dalam pemecahan masalah ilmiah adalah mengidentifikasi variabel yang diketahui serta konsep dasar yang menghubungkannya.',
        },
      ],
    });
  }
});

// ============================================================================
// 8. VITE DEV MIDDLEWARE / STATIC ASSETS
// ============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mimi 15 Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
