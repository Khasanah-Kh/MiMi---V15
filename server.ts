import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

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
// 3. SERVER-SIDE GEMINI CLIENT INITIALIZATION (Linked to Secret GEMINI_API_KEY)
// ============================================================================
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi di panel Settings > Secrets.');
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
    const cleanName = String(displayName || '').trim() || 'Siswa Cyber';
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
    const cleanName = String(displayName || 'Siswa Cyber').trim();
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
  if (xp >= 2000) return 'Grandmaster Mimi 15';
  if (xp >= 1200) return 'Komandan Kuantum IV';
  if (xp >= 600) return 'Arsitek Algoritma III';
  if (xp >= 250) return 'Eksplorer Logika II';
  return 'Kadet Siber I';
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
// 6. GEMINI AI TUTOR MIMI ENDPOINT (/api/mimi/chat)
// ============================================================================
app.post('/api/mimi/chat', async (req, res) => {
  try {
    const { message, educationLevel, selectedClass, studentName, history } = req.body || {};
    const promptText = String(message || '').trim();
    if (!promptText) {
      res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
      return;
    }

    const ai = getGeminiClient();
    const levelLabel = String(educationLevel || 'SMP');
    const classLabel = String(selectedClass || 'Kelas 8');
    const nameLabel = String(studentName || 'Siswa Cyber');

    const recentHistory = Array.isArray(history)
      ? history
          .slice(-6)
          .map((m: { sender?: string; text?: string }) =>
            `${m.sender === 'user' ? 'Siswa' : 'Mimi'}: ${m.text || ''}`
          )
          .join('\n')
      : '';

    const systemInstruction = `Kamu adalah Mimi, AI Tutor Siber yang ramah, cerdas, dan suportif di aplikasi pendidikan "Mimi 15".
Kamu sedang membimbing siswa bernama ${nameLabel} yang berada di jenjang ${levelLabel} (${classLabel}).
Aturan gaya bahasa & pedagogi:
1. Gunakan Bahasa Indonesia yang jelas, hangat, terstruktur, dan sesuai tingkat pemahaman siswa ${levelLabel} (${classLabel}).
2. Untuk jenjang SD: gunakan analogi konkret sehari-hari dan langkah sederhana yang menyenangkan.
3. Untuk jenjang SMP: jelaskan konsep inti, rumus secara bertahap, serta contoh penerapan praktis.
4. Untuk jenjang SMA: berikan penjelasan analitis yang presisi, penurunan konsep/rumus yang rapi, dan kaitan ilmiah atau teknologi modern.
5. Jangan pernah terlalu panjang (maksimal 3-4 paragraf ringkas atau poin-poin terstruktur), dan akhiri dengan 1 pertanyaan pemantik singkat untuk menguji pemahaman siswa.`;

    const fullContents = recentHistory
      ? `Riwayat percakapan sebelumnya:\n${recentHistory}\n\nPertanyaan terbaru dari ${nameLabel} (${levelLabel} - ${classLabel}):\n${promptText}`
      : promptText;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Halo! Mimi siap membantu menjelaskan materi ini. Coba ulangi pertanyaanmu ya!';
    res.json({
      reply,
      xpAwarded: 15,
    });
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    const errMessage = error instanceof Error ? error.message : 'Gagal menghubungi layanan Gemini AI.';
    res.status(500).json({
      error: errMessage,
    });
  }
});

// ============================================================================
// 7. GEMINI DYNAMIC QUIZ GENERATOR ENDPOINT (/api/quiz/generate)
// ============================================================================
app.post('/api/quiz/generate', async (req, res) => {
  try {
    const { educationLevel, selectedClass, topic } = req.body || {};
    const levelLabel = String(educationLevel || 'SMP');
    const classLabel = String(selectedClass || 'Kelas 8');
    const topicLabel = String(topic || 'Matematika, Sains, dan Literasi Siber');

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Buatkan 4 soal kuis pilihan ganda berkualitas tinggi dalam Bahasa Indonesia untuk siswa jenjang ${levelLabel} (${classLabel}) dengan fokus topik: ${topicLabel}. Pastikan setiap soal memiliki 4 pilihan jawaban, indeks jawaban benar (0 sampai 3), dan pembahasan singkat yang jelas.`,
      config: {
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
      },
    });

    const rawJson = (response.text || '[]').trim();
    const parsed = JSON.parse(rawJson);

    res.json({
      questions: Array.isArray(parsed) ? parsed : [],
    });
  } catch (error) {
    console.error('Gemini Quiz Generation Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Gagal membuat soal kuis AI.',
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
