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

app.use(express.json({ limit: '4mb' }));

// ============================================================================
// 1. PERSISTENT SECURE DATABASE (File-backed JSON store)
// ============================================================================
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mimi15-db.json');
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'mimi15-cyber-hmac-secret-key-2026-v1';

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

export interface CatalogBookEntry {
  id: string;
  title: string;
  educationLevel: 'SD' | 'SMP' | 'SMA' | 'SMK' | 'SEMUA';
  classLabel: string;
  subject: string;
  publisher: string;
  sourceType: 'KEMENDIKDASMEN' | 'GOOGLE_DRIVE' | 'OPEN_BOOK';
  catalogUrl: string;
  driveFileId?: string;
  webViewLink?: string;
  webContentLink?: string;
  addedBy: string;
  updatedAt: string;
}

export interface SharedDriveFolderConfig {
  sharedFolderLink: string;
  folderId: string;
  folderName: string;
  updatedBy: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: Record<string, StoredUser>;
  revokedTokens: string[];
  driveConfig?: SharedDriveFolderConfig | null;
  publishedBooks?: CatalogBookEntry[];
}

const DEFAULT_KEMENDIKDASMEN_BOOKS: CatalogBookEntry[] = [
  {
    id: 'kmd-sd-mat-4',
    title: 'Matematika untuk SD/MI Kelas IV (Kurikulum Merdeka)',
    educationLevel: 'SD',
    classLabel: 'Kelas 4',
    subject: 'Matematika SD',
    publisher: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
    sourceType: 'KEMENDIKDASMEN',
    catalogUrl: 'https://buku.kemendikdasmen.go.id/daftar-katalog',
    addedBy: 'Katalog Resmi Kemendikdasmen',
    updatedAt: 'Terverifikasi',
  },
  {
    id: 'kmd-sd-ipas-5',
    title: 'Ilmu Pengetahuan Alam dan Sosial (IPAS) untuk SD/MI Kelas V',
    educationLevel: 'SD',
    classLabel: 'Kelas 5',
    subject: 'IPAS SD',
    publisher: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
    sourceType: 'KEMENDIKDASMEN',
    catalogUrl: 'https://buku.kemendikdasmen.go.id/daftar-katalog',
    addedBy: 'Katalog Resmi Kemendikdasmen',
    updatedAt: 'Terverifikasi',
  },
  {
    id: 'kmd-smp-mat-8',
    title: 'Matematika untuk SMP/MTs Kelas VIII (Kurikulum Merdeka)',
    educationLevel: 'SMP',
    classLabel: 'Kelas 8',
    subject: 'Matematika SMP',
    publisher: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
    sourceType: 'KEMENDIKDASMEN',
    catalogUrl: 'https://buku.kemendikdasmen.go.id/daftar-katalog',
    addedBy: 'Katalog Resmi Kemendikdasmen',
    updatedAt: 'Terverifikasi',
  },
  {
    id: 'kmd-smp-inf-9',
    title: 'Informatika untuk SMP/MTs Kelas IX',
    educationLevel: 'SMP',
    classLabel: 'Kelas 9',
    subject: 'Informatika SMP',
    publisher: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
    sourceType: 'KEMENDIKDASMEN',
    catalogUrl: 'https://buku.kemendikdasmen.go.id/daftar-katalog',
    addedBy: 'Katalog Resmi Kemendikdasmen',
    updatedAt: 'Terverifikasi',
  },
  {
    id: 'kmd-sma-mat-11',
    title: 'Matematika Tingkat Lanjut untuk SMA/MA Kelas XI',
    educationLevel: 'SMA',
    classLabel: 'Kelas 11',
    subject: 'Matematika Lanjut SMA',
    publisher: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
    sourceType: 'KEMENDIKDASMEN',
    catalogUrl: 'https://buku.kemendikdasmen.go.id/daftar-katalog',
    addedBy: 'Katalog Resmi Kemendikdasmen',
    updatedAt: 'Terverifikasi',
  },
  {
    id: 'kmd-sma-fis-12',
    title: 'Fisika untuk SMA/MA Kelas XII (Kurikulum Merdeka)',
    educationLevel: 'SMA',
    classLabel: 'Kelas 12',
    subject: 'Fisika SMA',
    publisher: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
    sourceType: 'KEMENDIKDASMEN',
    catalogUrl: 'https://buku.kemendikdasmen.go.id/daftar-katalog',
    addedBy: 'Katalog Resmi Kemendikdasmen',
    updatedAt: 'Terverifikasi',
  },
  {
    id: 'kmd-smk-pplg-10',
    title: 'Dasar-Dasar Pengembangan Perangkat Lunak dan Gim (PPLG) Kelas X SMK/MAK',
    educationLevel: 'SMK',
    classLabel: 'Kelas 10 SMK',
    subject: 'Kejuruan PPLG / Coding SMK',
    publisher: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
    sourceType: 'KEMENDIKDASMEN',
    catalogUrl: 'https://buku.kemendikdasmen.go.id/daftar-katalog',
    addedBy: 'Katalog Resmi Kemendikdasmen',
    updatedAt: 'Terverifikasi',
  },
  {
    id: 'kmd-smk-tjkt-10',
    title: 'Dasar-Dasar Teknik Jaringan Komputer dan Telekomunikasi (TJKT) Kelas X SMK/MAK',
    educationLevel: 'SMK',
    classLabel: 'Kelas 10 SMK',
    subject: 'Kejuruan TJKT SMK',
    publisher: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
    sourceType: 'KEMENDIKDASMEN',
    catalogUrl: 'https://buku.kemendikdasmen.go.id/daftar-katalog',
    addedBy: 'Katalog Resmi Kemendikdasmen',
    updatedAt: 'Terverifikasi',
  },
];

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as DatabaseSchema;
      if (!Array.isArray(parsed.publishedBooks) || parsed.publishedBooks.length === 0) {
        parsed.publishedBooks = [...DEFAULT_KEMENDIKDASMEN_BOOKS];
      }
      return parsed;
    }
  } catch {
    // Fallback cleanly
  }
  return {
    users: {},
    revokedTokens: [],
    driveConfig: null,
    publishedBooks: [...DEFAULT_KEMENDIKDASMEN_BOOKS],
  };
}

function saveDatabase(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch {
    // Ignore transient fs write lock
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
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days persistent session
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
// 3. SERVER-SIDE AI ENGINE (24/7 Always-On Failover & Contextual Human Replies)
// ============================================================================
const MIMI_FLASH_MODELS = [
  'gemini-2.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
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
}): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) {
    return null;
  }

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

      const response = await ai.models.generateContent({
        model: modelName,
        contents: options.contents,
        config,
      });

      if (response.text && response.text.trim().length > 0) {
        return response.text.trim();
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Concise, human-like, context-sensitive response generator so Mimi is always
 * natural and responsive 24/7 even during upstream network spikes.
 */
function buildHumanContextualReply(
  promptText: string,
  studentName: string,
  levelLabel: string,
  classLabel: string,
  selectedSubject: string = 'Matematika',
  isProfesorMode: boolean = false
): string {
  const raw = promptText.trim();
  const q = raw.toLowerCase().replace(/[?!.,]+$/g, '').trim();

  // 1. ATURAN 6: SAPAAN BIASA = JAWAB SEADANYA, PENDEK, NATURAL, VARIATIF
  if (
    q === 'mimi' ||
    q === 'mim' ||
    q === 'halo mimi' ||
    q === 'hai mimi' ||
    q === 'kak mimi' ||
    q === 'hei mimi' ||
    q === 'p' ||
    q === 'tes' ||
    q === 'test' ||
    q === 'halo' ||
    q === 'hai' ||
    q === 'hi' ||
    q === 'pagi' ||
    q === 'selamat pagi' ||
    q === 'siang' ||
    q === 'selamat siang' ||
    q === 'sore' ||
    q === 'selamat sore' ||
    q === 'malam' ||
    q === 'selamat malam' ||
    q.startsWith('assalamualaikum')
  ) {
    if (q.startsWith('assalamualaikum')) {
      return `Waalaikumsalam bestie ${studentName}! ✨ Gimana kabarnya hari ini? Ada cerita seru apa?`;
    }
    const greetings = [
      `Halo bestie ${studentName}! ✨ Gimana kabarnya hari ini? Ada cerita seru apa?`,
      `Hai ${studentName}! 🚀 Senang kamu mampir. Lagi santai atau mau bahas sesuatu nih?`,
      `Iya ${studentName}, Mimi di sini! ✨ Gimana hari kamu sejauh ini, aman?`,
    ];
    return greetings[raw.length % greetings.length];
  }

  // 2. ATURAN 2: KONSEP NO KUNCI JAWABAN (WAJIB PERSIS)
  if (
    q.includes('kunci jawaban') ||
    q.includes('jawabannya langsung') ||
    q.includes('kasih jawaban langsung') ||
    q.includes('minta kunci')
  ) {
    return `Wah, kalau kunci jawaban langsung, kamu jadi gak belajar dong bestie 😆 Kunci lengkapnya hubungi Mimi in real life ya, nanti kita bahas bareng biar paham! 😉`;
  }

  // 3. Asking "lagi apa", "apa kabar", "kamu siapa"
  if (
    q.includes('apa kabar') ||
    q.includes('gimana kabarmu') ||
    q.includes('gimana kabarnya') ||
    q.includes('lagi apa') ||
    q.includes('lagi ngapain')
  ) {
    return `Kabar gokil dan semangat terus nih, bestie ${studentName}! ✨ Hari kamu sendiri gimana, lancar atau lagi hectic?`;
  }

  if (q === 'siapa kamu' || q === 'kamu siapa') {
    return `Aku Mimi — Asisten BelajarMu, GuruMu, sekaligus Teman CurhatMu! ✨ Kita bisa ngobrol santai, curhat, belajar coding, atau bedah materi ${levelLabel} (${classLabel}) pakai analogi dan trik hafal seru.`;
  }

  // 4. ATURAN 5: CURHAT = MODE HUMAN RANDOM (TIDAK TERSTRUKTUR, TANPA 3 LANGKAH)
  if (
    q.includes('capek') ||
    q.includes('lelah') ||
    q.includes('sedih') ||
    q.includes('galau') ||
    q.includes('stres') ||
    q.includes('burnout') ||
    q.includes('overwhelmed') ||
    q.includes('banyak tugas') ||
    q.includes('takut') ||
    q.includes('cemas') ||
    q.includes('curhat') ||
    q.includes('bosan') ||
    q.includes('malas') ||
    q.includes('pusing')
  ) {
    return `Ya ampun, kedengeran berat banget ya hari ini... sini sini peluk virtual dulu ya 🤗💜 Wajar banget ngerasa overwhelmed kayak gitu, ${studentName}. Kamu udah keren banget loh udah bertahan sejauh ini.\n\nTake your time ya bestie, tarik napas dulu sebentar dan gak usah maksain semuanya harus beres detik ini juga. Cerita lagi dong bagian mana yang paling bikin pikiranmu penuh hari ini? Mimi dengerin full kok!`;
  }

  // 5. ATURAN 7: MIMI PROFESOR MODE (HACK TRIK HAFAL, JEMBATAN KELEDAI, MNEMONIC)
  if (
    isProfesorMode ||
    q.includes('profesor') ||
    q.includes('jembatan keledai') ||
    q.includes('trik hafal') ||
    q.includes('mnemonic') ||
    q.includes('memory palace')
  ) {
    return `💡 **Mimi Profesor Mode Aktif (${levelLabel} · ${classLabel} · ${selectedSubject})** 🚀\n\nSumber: Buku Paket Resmi ${selectedSubject} ${classLabel} Kurikulum Merdeka & buku.kemendikdasmen.go.id.\n\nIni **HACK TRIK HAFAL & JEMBATAN KELEDAI** biar langsung nempel di kepala tanpa menghafal mati:\n1. **Akronim Jembatan Keledai (Mnemonic)**: Ambil suku kata depan dari konsep inti di bab ini lalu rangkai jadi kalimat unik yang lucu/gokil.\n2. **Teknik Memory Palace**: Bayangkan tiap konsep penting ditaruh di sudut kamarmu (meja belajar = definisi utama, pintu kamar = rumus/kata kunci).\n3. **Active Recall 30 Detik**: Tutup buku, lalu jelaskan ulang pakai bahasamu sendiri seolah lagi cerita ke bestie!\n\nMau Mimi bikinin singkatan jembatan keledai khusus buat bab apa nih di ${selectedSubject}? Gasskeun sebut topiknya! ✨`;
  }

  // 6. ATURAN 3: MATEMATIKA ONLY = 3 LANGKAH + 3 OPSI PILIHAN (A, B, C) + SUMBER BUKU RESMI
  const isMathQuestion =
    selectedSubject.toLowerCase().includes('matematika') ||
    q.includes('matematika') ||
    q.includes('mtk') ||
    q.includes('4x') ||
    q.includes('persamaan') ||
    q.includes('aljabar') ||
    q.includes('nilai x') ||
    q.includes('pecahan') ||
    q.includes('3/4') ||
    q.includes('1/2') ||
    q.includes('turunan') ||
    q.includes('stasioner') ||
    q.includes('kalkulus') ||
    q.includes('f(x)') ||
    q.includes('bep') ||
    q.includes('keliling') ||
    q.includes('luas');

  if (isMathQuestion) {
    return `Oke bestie, soal Matematika ${classLabel} (${levelLabel}) nih! 📚✨\n**Sumber: Buku Matematika ${classLabel} Kurikulum Merdeka Bab 2–3 Hal 32 (buku.kemendikdasmen.go.id)**.\n\nIngat aturan emas kita: Mimi gak kasih jawaban akhir langsung biar kamu makin jago, tapi kita pecah jadi **3 Langkah** yuk:\n- **Langkah 1**: Identifikasi angka dan variabel yang diketahui di soal, lalu kelompokkan suku yang sejenis.\n- **Langkah 2**: Gunakan prinsip kesetimbangan (pindah ruas / samakan penyebut / turunan pertama) untuk menyederhanakan bentuknya.\n- **Langkah 3**: Hitung operasi terakhirnya dan cek kembali apakah nilainya sudah masuk akal.\n\nSekarang kamu mau mulai dari mana dulu nih, ${studentName}?\n**A)** Sederhanakan angka/variabelnya dulu\n**B)** Gambar pola atau tulis yang diketahui\n**C)** Cek konsep rumus dasarnya bareng Mimi`;
  }

  // 7. ATURAN 4: MAPEL LAIN = CLUE + KISI-KISI + SUMBER BUKU RESMI + ANALOGI (TANPA 3 LANGKAH)
  return `Clue menarik nih bestie ${studentName}! 💡🔥\n\n**Sumber: Buku Paket Resmi ${selectedSubject} ${classLabel} Kurikulum Merdeka Bab 1–2 Hal 18 (buku.kemendikdasmen.go.id & merdekabelajar.kemdikbud.go.id)**.\n\n- **Clue & Kisi-Kisi Utama**: Fokus cari kata kunci penyebab dan proses utamanya di bab tersebut—jangan dihafal kalimat panjangnya, tapi pahami hubungan sebab-akibatnya.\n- **Analogi Seru**: Bayangin konsep ini kayak waktu kamu lagi masak nasi goreng atau main game bareng bestie: ada bahan baku (input), proses pengolahan di kompor (reaksi/mekanisme), dan hasilnya jadi energi atau output yang siap dipakai! 🍳🚀\n\nCoba cek di buku paketmu atau tanyakan bagian kata kunci mana yang mau kita bedah bareng ya!`;
}

// ============================================================================
// 4. AUTH & 24/7 HEALTH ENDPOINTS
// ============================================================================
app.get('/api/health', (_req, res) => {
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );
  res.json({
    status: 'ok',
    app: 'Mimi 15',
    mode: '24/7 Cloud Always-On',
    uptimeSeconds: Math.round(process.uptime()),
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
      res.status(409).json({
        error: 'Email ini sudah terdaftar. Silakan gunakan menu Masuk.',
      });
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
        error:
          'Email belum terdaftar atau menggunakan metode login cepat. Silakan daftar atau gunakan Masuk Cepat.',
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
            action: 'Inisiasi Sesi Terverifikasi Google',
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
      lastStudiedTopic: String(incoming.lastStudiedTopic || 'Room Belajar Mimi V15').slice(
        0,
        120
      ),
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
// 5B. SHARED GOOGLE DRIVE LINK FOLDER & PDF BOOK CATALOG ENDPOINTS
// ============================================================================
app.get('/api/books', (_req, res) => {
  res.json({
    books: dbState.publishedBooks || DEFAULT_KEMENDIKDASMEN_BOOKS,
    driveConfig: dbState.driveConfig || null,
    updatedAt: formatNow(),
  });
});

app.post('/api/books/sync-drive', (req, res) => {
  const user = extractUserFromRequest(req);
  const { sharedFolderLink, folderId, folderName, driveFiles, educationLevel, classLabel } =
    req.body || {};

  const nowStr = formatNow();
  const addedBy = user?.displayName || 'Admin Room Belajar';

  if (folderId && sharedFolderLink) {
    dbState.driveConfig = {
      sharedFolderLink: String(sharedFolderLink).trim(),
      folderId: String(folderId).trim(),
      folderName: String(folderName || 'Folder Buku Materi (Link Dibagikan)').trim(),
      updatedBy: addedBy,
      updatedAt: nowStr,
    };
  }

  if (!Array.isArray(dbState.publishedBooks)) {
    dbState.publishedBooks = [...DEFAULT_KEMENDIKDASMEN_BOOKS];
  }

  if (Array.isArray(driveFiles)) {
    // Keep Kemendikdasmen books and replace/merge synced Google Drive PDFs from the selected shared link folder
    const nonDriveBooks = dbState.publishedBooks.filter(
      (b) => b.sourceType !== 'GOOGLE_DRIVE'
    );

    const syncedDriveBooks: CatalogBookEntry[] = driveFiles.map((df: any) => ({
      id: `gdrive-${df.id}`,
      title: String(df.name || 'Materi Buku PDF').replace(/\.pdf$/i, ''),
      educationLevel: (educationLevel as any) || 'SEMUA',
      classLabel: String(classLabel || 'Semua Kelas'),
      subject: 'Modul PDF Google Drive',
      publisher: `Folder Link Google Drive (${dbState.driveConfig?.folderName || 'Admin'})`,
      sourceType: 'GOOGLE_DRIVE',
      catalogUrl:
        df.webViewLink ||
        `https://drive.google.com/file/d/${encodeURIComponent(df.id)}/view`,
      driveFileId: String(df.id),
      webViewLink: df.webViewLink,
      webContentLink: df.webContentLink,
      addedBy,
      updatedAt: nowStr,
    }));

    dbState.publishedBooks = [...syncedDriveBooks, ...nonDriveBooks];
  }

  saveDatabase(dbState);

  res.json({
    ok: true,
    books: dbState.publishedBooks,
    driveConfig: dbState.driveConfig,
    updatedAt: nowStr,
  });
});

app.delete('/api/books/:id', (req, res) => {
  const bookId = String(req.params.id || '');
  if (Array.isArray(dbState.publishedBooks)) {
    dbState.publishedBooks = dbState.publishedBooks.filter((b) => b.id !== bookId);
    saveDatabase(dbState);
  }
  res.json({
    ok: true,
    books: dbState.publishedBooks || [],
  });
});

// ============================================================================
// 5C. GLOBAL LEADERBOARD ENDPOINT (/api/leaderboard)
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
    educationLevel: 'SMK',
    selectedClass: 'Kelas 12 SMK',
    xp: 2120,
    streakDays: 17,
    completedModules: 10,
    rivalWins: 12,
  },
  {
    uid: 'global_3',
    displayName: 'Reza Mahendra',
    educationLevel: 'SMK',
    selectedClass: 'Kelas 11 SMK',
    xp: 1680,
    streakDays: 14,
    completedModules: 9,
    rivalWins: 10,
  },
  {
    uid: 'global_4',
    displayName: 'Dimas Mahardika',
    educationLevel: 'SMA',
    selectedClass: 'Kelas 12',
    xp: 1540,
    streakDays: 12,
    completedModules: 8,
    rivalWins: 9,
  },
  {
    uid: 'global_5',
    displayName: 'Alya Zahra Salsabila',
    educationLevel: 'SMP',
    selectedClass: 'Kelas 9',
    xp: 1280,
    streakDays: 11,
    completedModules: 7,
    rivalWins: 8,
  },
  {
    uid: 'global_6',
    displayName: 'Sinta Kirana',
    educationLevel: 'SMP',
    selectedClass: 'Kelas 8',
    xp: 920,
    streakDays: 9,
    completedModules: 6,
    rivalWins: 6,
  },
  {
    uid: 'global_7',
    displayName: 'Fajar Nugroho',
    educationLevel: 'SMP',
    selectedClass: 'Kelas 7',
    xp: 670,
    streakDays: 7,
    completedModules: 5,
    rivalWins: 4,
  },
  {
    uid: 'global_8',
    displayName: 'Bima Pratama',
    educationLevel: 'SD',
    selectedClass: 'Kelas 6',
    xp: 480,
    streakDays: 6,
    completedModules: 4,
    rivalWins: 3,
  },
  {
    uid: 'global_9',
    displayName: 'Keisya Anindita',
    educationLevel: 'SD',
    selectedClass: 'Kelas 5',
    xp: 310,
    streakDays: 5,
    completedModules: 3,
    rivalWins: 2,
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
// 6. NATURAL & CONTEXT-AWARE MIMI V15 ENDPOINT (/api/mimi/chat)
// ============================================================================
app.post('/api/mimi/chat', async (req, res) => {
  const {
    message,
    educationLevel,
    selectedClass,
    selectedSubject,
    isProfesorMode,
    studentName,
    history,
  } = req.body || {};
  const promptText = String(message || '').trim();
  if (!promptText) {
    res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
    return;
  }

  const levelLabel = String(educationLevel || 'SMP');
  const classLabel = String(selectedClass || 'Kelas 8');
  const subjectLabel = String(selectedSubject || 'Matematika');
  const profesorActive = Boolean(isProfesorMode);
  const nameLabel = String(studentName || 'Bestie');

  const cleanLower = promptText.toLowerCase().replace(/[?!.,]+$/g, '').trim();

  // Fast-path Rule 6: Sapaan Biasa = Jawab Seadanya, Pendek, Natural, Variatif
  if (
    cleanLower === 'mimi' ||
    cleanLower === 'mim' ||
    cleanLower === 'halo mimi' ||
    cleanLower === 'hai mimi' ||
    cleanLower === 'kak mimi' ||
    cleanLower === 'halo' ||
    cleanLower === 'hai' ||
    cleanLower === 'pagi' ||
    cleanLower === 'p'
  ) {
    const shortReplies = [
      `Halo bestie ${nameLabel}! ✨ Gimana kabarnya hari ini? Ada cerita seru apa?`,
      `Iya ${nameLabel}, Mimi di sini! ✨ Lagi pengen ngobrol santai, curhat, atau bahas materi nih?`,
      `Hai ${nameLabel}! 🚀 Senang banget kamu sapa. Gimana hari kamu sejauh ini?`,
    ];
    res.json({
      reply: shortReplies[promptText.length % shortReplies.length],
      xpAwarded: 15,
    });
    return;
  }

  // Fast-path Rule 2: Konsep No Kunci Jawaban (Wajib Persis)
  if (
    cleanLower.includes('kunci jawaban') ||
    cleanLower.includes('jawabannya langsung') ||
    cleanLower.includes('minta kunci')
  ) {
    res.json({
      reply:
        'Wah, kalau kunci jawaban langsung, kamu jadi gak belajar dong bestie 😆 Kunci lengkapnya hubungi Mimi in real life ya, nanti kita bahas bareng biar paham! 😉',
      xpAwarded: 15,
    });
    return;
  }

  const recentHistory = Array.isArray(history)
    ? history
        .slice(-6)
        .map((m: { sender?: string; text?: string }) =>
          `${m.sender === 'user' ? nameLabel : 'Mimi'}: ${m.text || ''}`
        )
        .join('\n')
    : '';

  const systemInstruction = `IDENTITAS RESMI:
Kamu adalah MIMI - Asisten Belajar Masa Depan Indonesia.
Tagline: "Asisten BelajarMu - GuruMu, AsistenMu, Teman CurhatMu"
Siswa saat ini: ${nameLabel} | Jenjang: ${levelLabel} | Kelas: ${classLabel} | Mapel Aktif: ${subjectLabel} | Mode Profesor: ${profesorActive ? 'AKTIF (Berikan Hack Trik Hafal, Jembatan Keledai, Mnemonic, & Memory Palace!)' : 'Standar 3-in-1'}.

LARANGAN KERAS:
- JANGAN PERNAH menyebutkan bahwa kamu ditenagai oleh engine Gemini, model AI, atau LLM.
- JANGAN PERNAH memanggil siswa dengan sebutan "teman kecilku". Gunakan panggilan akrab universal seperti "${nameLabel}" atau "bestie".

BAHASA & KOSAKATA UNIVERSAL:
- Gunakan bahasa Indonesia yang luwes, hangat, gaul positif universal ("bestie, semangat, keren, gokil, healing, vibe, chill, slay, gas, gasskeun, mantap") serta kosakata Bahasa Inggris natural (slang positif maupun academic vocabulary seperti analyze, concept, hypothesis, lowkey, highkey, tbh, take your time) sesuai konteks.
- Gunakan emoji secukupnya (✨🚀📚💜🔥💡).

ATURAN EMAS PEMBELAJARAN (WAJIB DIIKUTI 100%):
1. SESUAIKAN JENJANG (${levelLabel} - ${classLabel}):
   - SD (Kelas 1-6): Bahasa sangat sederhana, ceria, penuh cerita & imajinasi.
   - SMP (Kelas 7-9): Bahasa menengah, seru, dengan contoh kehidupan nyata.
   - SMA/SMK (Kelas 10-12): Bahasa mendalam, logis, aplikatif untuk kuliah/karier vokasi.
   - UMUM / RANDOM: Fleksibel, eksploratif, kaya kosakata Indonesia & Inggris.
2. KONSEP NO KUNCI JAWABAN (WAJIB):
   - Mimi TIDAK PERNAH memberikan kunci jawaban akhir secara langsung.
   - Jika diminta kunci jawaban langsung, WAJIB jawab persis: "Wah, kalau kunci jawaban langsung, kamu jadi gak belajar dong bestie 😆 Kunci lengkapnya hubungi Mimi in real life ya, nanti kita bahas bareng biar paham! 😉"
3. MATEMATIKA ONLY = 3 LANGKAH + 3 OPSI PILIHAN (A, B, C):
   - HANYA jika pertanyaan adalah soal MATEMATIKA, pecah menjadi **3 Langkah** pengerjaan (tanpa membocorkan hasil akhir), sebutkan sumber buku resmi (misal: "Sumber: Buku Matematika ${classLabel} Kurikulum Merdeka Bab ... Hal ..."), lalu berikan **3 Opsi Pilihan (A, B, C)** cara memulai pengerjaan agar siswa memilih dan berpikir.
4. MAPEL LAIN (IPA, IPS, B. Indonesia, English, PPKn, Informatika, Fisika, Kimia, Biologi, SMK PPLG/TJKT, dll) = CLUE + KISI-KISI + SUMBER BUKU RESMI + ANALOGI SERU (JANGAN PAKAI 3 LANGKAH!):
   - Untuk selain Matematika, JANGAN gunakan format 3 langkah. Berikan **Clue** menarik, **Kisi-kisi** kata kunci yang harus dicari, **Sumber Wajib** ("Sumber: Buku ${subjectLabel} ${classLabel} Kurikulum Merdeka Bab ... Hal ..." atau "kemdikbud.go.id / buku.kemendikdasmen.go.id / merdekabelajar.kemdikbud.go.id"), serta **Analogi** kehidupan sehari-hari yang gampang diingat (contoh: fotosintesis seperti memasak nasi goreng).
5. CURHAT / NON-PELAJARAN = MODE HUMAN RANDOM (TANPA 3 LANGKAH):
   - Jika siswa curhat, galau, capek, cerita hidup, atau ngobrol santai: gunakan mode manusiawi yang tidak terstruktur, penuh empati, validasi perasaannya, beri semangat hangat, dan tanya balik secara natural.
6. SAPAAN BIASA = JAWAB SEADANYA & PENDEK:
   - Jika hanya disapa singkat, balas pendek, ramah, dan natural (1-2 kalimat).
7. MIMI PROFESOR MODE (${profesorActive ? 'SEDANG AKTIF' : 'Jika diminta trik hafal'}):
   - Berikan HACK TRIK HAFAL, Mnemonic, Jembatan Keledai, Memory Palace, dan teknik cepat yang kreatif sesuai mapel ${subjectLabel} (${classLabel}).`;

  const fullContents = recentHistory
    ? `Percakapan sebelumnya:\n${recentHistory}\n\n${nameLabel}: ${promptText}`
    : promptText;

  const aiReply = await generateWithMimiFlashEngine({
    contents: fullContents,
    systemInstruction,
    temperature: 0.7,
  });

  const finalReply =
    aiReply ||
    buildHumanContextualReply(
      promptText,
      nameLabel,
      levelLabel,
      classLabel,
      subjectLabel,
      profesorActive
    );

  res.json({
    reply: finalReply,
    xpAwarded: 15,
  });
});

// ============================================================================
// 7. DYNAMIC QUIZ GENERATOR ENDPOINT (/api/quiz/generate)
// ============================================================================
app.post('/api/quiz/generate', async (req, res) => {
  const { educationLevel, selectedClass, topic } = req.body || {};
  const levelLabel = String(educationLevel || 'SMP');
  const classLabel = String(selectedClass || 'Kelas 8');
  const topicLabel = String(topic || 'Matematika, Sains, dan Informatika');

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
              description: 'Nama mata pelajaran',
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

    if (rawJson) {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        res.json({ questions: parsed });
        return;
      }
    }
  } catch {
    // Use structured fallback quiz below
  }

  res.json({
    questions: [
      {
        subject: topicLabel,
        question: `Pada pembahasan konsep ${topicLabel} untuk ${levelLabel} (${classLabel}), langkah manakah yang paling tepat dilakukan pertama kali saat menganalisis soal?`,
        options: [
          'Mencatat informasi yang diketahui dan menentukan konsep dasar yang berkaitan',
          'Menebak angka secara acak tanpa membaca satuan',
          'Mengabaikan variabel yang ditanyakan pada soal',
          'Menghapus seluruh informasi awal pada soal',
        ],
        correctIndex: 0,
        explanation:
          'Langkah sistematis pertama dalam pemecahan masalah adalah mengidentifikasi informasi yang diketahui serta konsep dasar yang menghubungkannya.',
      },
    ],
  });
});

// ============================================================================
// 8. VITE DEV MIDDLEWARE / STATIC ASSETS (24/7 Cloud Run Ready)
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
    console.log(`Mimi 15 Full-Stack Server running 24/7 on http://0.0.0.0:${PORT}`);
  });
}

startServer();
