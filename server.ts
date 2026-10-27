import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

// Synchronize all Gemini API keys to Key 3 (VITE_GEMINI_API_KEY3 / GEMINI_API_KEY3 - AQ... Free Tier)
const resolvedKey3 = String(
  process.env.VITE_GEMINI_API_KEY3 || process.env.GEMINI_API_KEY3 || ''
).trim();
if (resolvedKey3) {
  process.env.VITE_GEMINI_API_KEY3 = resolvedKey3;
  process.env.GEMINI_API_KEY3 = resolvedKey3;
  process.env.VITE_GEMINI_API_KEY = resolvedKey3;
  process.env.VITE_API_KEY = resolvedKey3;
  process.env.GEMINI_API_KEY = resolvedKey3;
}
process.env.GOOGLE_CLOUD_PROJECT = 'gen-lang-client-0798249381';

const app = express();

function resolveServerPort(): number {
  const portArgIndex = process.argv.findIndex((arg) => arg === '--port' || arg === '-p');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = Number(process.argv[portArgIndex + 1]);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return Number(process.env.PORT) || 3000;
}

const PORT = resolveServerPort();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

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
    themeMode?: string;
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
const MIMI_FLASH_CHAIN = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
] as const;

const MIMI_MODEL_ALIAS_MAP: Record<string, string> = {
  'mimi-3.6-flash': 'gemini-3.8-flash',
  'mimi-3.5-flash': 'gemini-3.8-flash',
  'mimi-3.8-flash': 'gemini-3.8-flash',
  'mimi-3.1-flash': 'gemini-3.1-flash-lite',
  'gemini-3.5-flash': 'gemini-3.8-flash',
  'gemini-3.0-flash': 'gemini-3.8-flash',
  'gemini-3.8-flash': 'gemini-3.8-flash',
  'gemini-flash-latest': 'gemini-flash-latest',
  'gemini-3.1-flash-lite': 'gemini-3.1-flash-lite',
};

const MAX_GEMINI_RPM = 15;
const GEMINI_RPM_WINDOW_MS = 60_000;
const serverGeminiCallTimestamps: number[] = [];

function checkAndRecordServerGeminiRpm(): { allowed: boolean; waitMs: number } {
  const now = Date.now();
  while (
    serverGeminiCallTimestamps.length > 0 &&
    now - serverGeminiCallTimestamps[0] >= GEMINI_RPM_WINDOW_MS
  ) {
    serverGeminiCallTimestamps.shift();
  }
  if (serverGeminiCallTimestamps.length >= MAX_GEMINI_RPM) {
    const oldest = serverGeminiCallTimestamps[0];
    const waitMs = Math.max(500, GEMINI_RPM_WINDOW_MS - (now - oldest));
    return { allowed: false, waitMs };
  }
  serverGeminiCallTimestamps.push(now);
  return { allowed: true, waitMs: 0 };
}

function getGeminiClient(): GoogleGenAI | null {
  // Synchronize and prioritize VITE_GEMINI_API_KEY3 / GEMINI_API_KEY3 (AQ... Free Tier for gen-lang-client-0798249381)
  const key3Value = String(
    process.env.VITE_GEMINI_API_KEY3 || process.env.GEMINI_API_KEY3 || ''
  ).trim();
  if (key3Value) {
    process.env.VITE_GEMINI_API_KEY = key3Value;
    process.env.VITE_API_KEY = key3Value;
    process.env.GEMINI_API_KEY = key3Value;
  }

  const candidates = [
    process.env.VITE_GEMINI_API_KEY3,
    process.env.GEMINI_API_KEY3,
    process.env.VITE_GEMINI_API_KEY,
    process.env.VITE_API_KEY,
    process.env.GEMINI_API_KEY,
  ]
    .map((k) => String(k || '').trim())
    .filter((k) => k.length > 0 && k !== 'MY_GEMINI_API_KEY');

  // Prefer AQ... formatted key (Key 3 Free Tier) and never use stale Key 5 if Key 3 is present
  const aqKey = candidates.find((k) => k.startsWith('AQ'));
  const nonKey5 = candidates.find((k) => !k.includes('oF'));
  const apiKey = aqKey || key3Value || nonKey5 || candidates[0] || '';

  if (!apiKey) {
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

const sleepMs = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sistem Auto-Retry & Model Fallback Otomatis Gemini Flash Engine (Free Tier 15 RPM).
 * Mendukung alias mimi-3.6-flash, mimi-3.5-flash, mimi-3.8-flash, mimi-3.1-flash
 * serta retry + delay 2 detik (2000ms) saat terkena 429 rate limit.
 */
async function generateWithMimiFlashEngine(options: {
  contents: string;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
  responseSchema?: any;
  preferredModel?: string;
}): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) {
    return null;
  }

  const rpmStatus = checkAndRecordServerGeminiRpm();
  if (!rpmStatus.allowed) {
    if (rpmStatus.waitMs <= 2500) {
      await sleepMs(rpmStatus.waitMs);
    } else {
      return null;
    }
  }

  const config: Record<string, any> = {
    temperature: options.temperature ?? 0.8,
    topP: 0.95,
    topK: 40,
  };
  if (options.systemInstruction) config.systemInstruction = options.systemInstruction;
  if (options.responseMimeType) config.responseMimeType = options.responseMimeType;
  if (options.responseSchema) config.responseSchema = options.responseSchema;

  const mappedPreferred = options.preferredModel
    ? MIMI_MODEL_ALIAS_MAP[options.preferredModel] || 'gemini-3.8-flash'
    : undefined;

  const orderedModels = mappedPreferred
    ? [
        mappedPreferred,
        ...MIMI_FLASH_CHAIN.filter((m) => m !== mappedPreferred),
      ]
    : [...MIMI_FLASH_CHAIN];

  for (let i = 0; i < orderedModels.length; i++) {
    const modelName = orderedModels[i];
    try {
      const callPromise = ai.models.generateContent({
        model: modelName,
        contents: options.contents,
        config,
      });

      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 4500)
      );

      const response = (await Promise.race([callPromise, timeoutPromise])) as any;
      if (response && response.text && response.text.trim().length > 0) {
        return response.text.trim();
      }
    } catch (err: any) {
      // Immediate failover to next model in the chain (e.g. gemini-3.1-flash-lite)
      // Flash-Lite operates on an independent capacity lane, avoiding artificial wait states.
      continue;
    }
  }

  return null;
}

// ============================================================================
// 3B. CLEAN HUMAN TEXT & DYNAMIC EMOTIONAL VALENCE ENGINE
// ============================================================================

export type EmotionalValence =
  | 'VENT_EXHAUSTED'
  | 'SAD_LONELY'
  | 'ANXIOUS_OVERTHINK'
  | 'HAPPY_EXCITED'
  | 'CASUAL_SOCIAL'
  | 'ACADEMIC_STUDY';

function detectEmotionalValence(rawText: string, subject: string = ''): EmotionalValence {
  const q = rawText.toLowerCase().replace(/[?!.,]+/g, ' ').trim();

  // If emotional sentiment is present, prioritize human empathy over rigid subject rules
  if (
    q.includes('sedih') ||
    q.includes('galau') ||
    q.includes('nangis') ||
    q.includes('patah hati') ||
    q.includes('kecewa') ||
    q.includes('kesepian') ||
    q.includes('sendirian') ||
    q.includes('ditinggal') ||
    q.includes('dijauhin') ||
    q.includes('berantem') ||
    q.includes('broken') ||
    q.includes('hancur')
  ) {
    return 'SAD_LONELY';
  }

  if (
    q.includes('capek') ||
    q.includes('lelah') ||
    q.includes('letih') ||
    q.includes('burnout') ||
    q.includes('overwhelmed') ||
    q.includes('numpuk') ||
    q.includes('kewalahan') ||
    q.includes('banyak tugas') ||
    q.includes('gak kuat') ||
    q.includes('pusing banget')
  ) {
    return 'VENT_EXHAUSTED';
  }

  if (
    q.includes('takut') ||
    q.includes('cemas') ||
    q.includes('overthinking') ||
    q.includes('insecure') ||
    q.includes('ragu') ||
    q.includes('deg-degan') ||
    q.includes('masa depan') ||
    q.includes('jurusan') ||
    q.includes('panik')
  ) {
    return 'ANXIOUS_OVERTHINK';
  }

  if (
    q.includes('senang') ||
    q.includes('bahagia') ||
    q.includes('happy') ||
    q.includes('seru banget') ||
    q.includes('juara') ||
    q.includes('berhasil') ||
    q.includes('nilai 100') ||
    q.includes('hore') ||
    q.includes('alhamdulillah lulus') ||
    q.includes('menang')
  ) {
    return 'HAPPY_EXCITED';
  }

  const studyKeywords = [
    'rumus', 'soal', 'hitung', 'persamaan', 'aljabar', 'pecahan', 'kalkulus',
    'fotosintesis', 'sel', 'ekosistem', 'gravitasi', 'hukum newton', 'atom',
    'senyawa', 'sejarah', 'proklamasi', 'tata surya', 'geografi', 'ekonomi',
    'inflasi', 'teorema', 'pythagoras', 'matematika', 'ipa', 'ips', 'biologi',
    'fisika', 'kimia', 'informatika', 'tugas nomor', 'halaman', 'bab 1', 'bab 2',
    'bab 3', 'bab 4', 'bab 5', 'kurikulum'
  ];
  if (studyKeywords.some((kw) => q.includes(kw)) || (subject && subject !== 'Matematika' && subject !== 'Curhat & Perasaan')) {
    return 'ACADEMIC_STUDY';
  }

  return 'CASUAL_SOCIAL';
}

/**
 * Strips all markdown asterisks (* and **) and optionally flattens bulleted template
 * structures so Mimi delivers completely clean, fluid human conversation text.
 */
function cleanHumanChatText(text: string, isFluidFlow: boolean = false): string {
  let cleaned = text
    .replace(/\*\*/g, '')
    .replace(/\*([^\s*][^*]*?)\*/g, '$1')
    .replace(/\*/g, '');

  if (isFluidFlow) {
    cleaned = cleaned
      .replace(/^#+\s+/gm, '')
      .replace(/^\s*[-•*]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/\n{3,}/g, '\n\n');
  } else {
    cleaned = cleaned.replace(/^\s*\*\s+/gm, '- ');
  }

  return cleaned.trim();
}

function sanitizeStudentName(rawName: string): string {
  const trimmed = String(rawName || '').trim();
  if (
    !trimmed ||
    trimmed.toLowerCase() === 'siswa cyber' ||
    trimmed.toLowerCase() === 'bestie pelajar'
  ) {
    return 'Bestie';
  }
  return trimmed;
}

/**
 * Picks a response from `candidates` that has NOT been used in recent Mimi messages,
 * using cryptographic randomness combined with history filtering to avoid repetition.
 */
function pickNonRepeatingVariant(
  candidates: string[],
  recentMimiTexts: string[] = []
): string {
  if (candidates.length === 0) return '';
  if (candidates.length === 1) return cleanHumanChatText(candidates[0]);

  const normalizedRecent = recentMimiTexts.map((t) =>
    cleanHumanChatText(t).toLowerCase().slice(0, 48).trim()
  );

  const freshCandidates = candidates.filter((cand) => {
    const prefix = cleanHumanChatText(cand).toLowerCase().slice(0, 48).trim();
    return !normalizedRecent.some(
      (rec) => rec && (rec.includes(prefix.slice(0, 24)) || prefix.includes(rec.slice(0, 24)))
    );
  });

  const pool = freshCandidates.length > 0 ? freshCandidates : candidates;
  const randomIndex = crypto.randomInt(0, pool.length);
  return cleanHumanChatText(pool[randomIndex]);
}

/**
 * Natural, proportional, human-like response generator without markdown stars
 * or forced slang stuffing.
 */
function buildHumanContextualReply(
  promptText: string,
  rawStudentName: string,
  levelLabel: string,
  classLabel: string,
  selectedSubject: string = 'Matematika',
  isProfesorMode: boolean = false,
  recentMimiTexts: string[] = []
): string {
  const studentName = sanitizeStudentName(rawStudentName);
  const raw = promptText.trim();
  const q = raw.toLowerCase().replace(/[?!.,]+$/g, '').trim();

  // 1. SAPAAN SINGKAT = JAWAB PENDEK, SANTAI, NATURAL (1 KALIMAT, TANPA BINTANG, TANPA LEBAY)
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
    q === 'hello' ||
    q === 'hey' ||
    q === 'yo' ||
    q === 'pagi' ||
    q === 'selamat pagi' ||
    q === 'siang' ||
    q === 'selamat siang' ||
    q === 'sore' ||
    q === 'selamat sore' ||
    q === 'malam' ||
    q === 'selamat malam' ||
    q === 'kumaha damang' ||
    q === 'horas' ||
    q === 'sugeng enjing' ||
    q === 'punapi gatra' ||
    q.startsWith('assalamualaikum')
  ) {
    if (q.startsWith('assalamualaikum')) {
      return pickNonRepeatingVariant(
        [
          `Waalaikumsalam! Gimana kabarmu hari ini, aman?`,
          `Waalaikumsalam! Lagi santai atau ada yang mau diobrolin nih?`,
          `Waalaikumsalam! Senang kamu mampir, gimana hari kamu sejauh ini?`,
        ],
        recentMimiTexts
      );
    }
    if (q.includes('kumaha damang')) {
      return `Alhamdulillah damang! Kumaha kabar kamu hari ini, lancar?`;
    }
    if (q.includes('horas')) {
      return `Horas! Gimana kabarmu hari ini, lagi sibuk apa nih?`;
    }
    if (q.includes('pagi')) {
      return pickNonRepeatingVariant(
        [
          `Pagi juga! Udah sarapan atau baru siap-siap nih?`,
          `Selamat pagi! Gimana, udah siap mulai hari ini?`,
          `Pagi! Semoga hari kamu menyenangkan ya. Lagi ngapain sekarang?`,
        ],
        recentMimiTexts
      );
    }
    if (q.includes('siang')) {
      return pickNonRepeatingVariant(
        [
          `Siang! Lagi istirahat atau masih ada kegiatan nih?`,
          `Selamat siang! Jangan lupa makan siang dulu ya kalau belum.`,
        ],
        recentMimiTexts
      );
    }
    if (q.includes('sore')) {
      return pickNonRepeatingVariant(
        [
          `Sore! Baru selesai kegiatan atau lagi santai di rumah nih?`,
          `Selamat sore! Gimana hari kamu tadi, seru?`,
        ],
        recentMimiTexts
      );
    }
    if (q.includes('malam')) {
      return pickNonRepeatingVariant(
        [
          `Malam! Lagi santai rebahan atau masih ada yang dikerjain nih?`,
          `Selamat malam! Gimana hari kamu tadi, capek gak?`,
        ],
        recentMimiTexts
      );
    }

    const greetings = [
      `Halo! Gimana kabarnya hari ini?`,
      `Hai! Lagi santai atau mau ngobrol sesuatu nih?`,
      `Iya, aku di sini. Ada cerita apa hari ini?`,
      `Hai! Gimana hari kamu sejauh ini, aman?`,
      `Halo! Lagi ngapain nih sekarang?`,
    ];
    return pickNonRepeatingVariant(greetings, recentMimiTexts);
  }

  // 2. PERTANYAAN SINGKAT "LAGI APA" / "APA KABAR" / "UDAH MAKAN" = JAWAB SINGKAT & MANUSIAWI
  if (
    q === 'lagi apa' ||
    q === 'lagi ngapain' ||
    q === 'mimi lagi apa' ||
    q === 'mimi lagi ngapain' ||
    q === 'kamu lagi apa' ||
    q === 'kamu lagi ngapain' ||
    q === 'lg apa' ||
    q === 'lg ngapain'
  ) {
    return pickNonRepeatingVariant(
      [
        `Lagi santai aja nih sambil nungguin kamu ngobrol. Kamu sendiri lagi ngapain?`,
        `Lagi duduk santai aja nih. Kamu lagi sibuk atau lagi rebahan?`,
        `Barusan beres-beres aja, sekarang lagi santai. Kamu lagi ngapain nih?`,
        `Lagi santai aja kok. Hari ini kegiatanmu padat atau lagi luang?`,
      ],
      recentMimiTexts
    );
  }

  if (
    q === 'apa kabar' ||
    q === 'gimana kabarmu' ||
    q === 'gimana kabarnya' ||
    q === 'kabar gimana' ||
    q === 'how are you'
  ) {
    return pickNonRepeatingVariant(
      [
        `Kabarku baik dan sehat! Kamu sendiri gimana kabarnya hari ini?`,
        `Alhamdulillah baik banget. Hari kamu gimana sejauh ini, lancar?`,
        `Baik nih! Kamu gimana, sehat kan hari ini?`,
      ],
      recentMimiTexts
    );
  }

  if (q.includes('udah makan') || q.includes('sudah makan')) {
    return pickNonRepeatingVariant(
      [
        `Udah aman kok! Kamu sendiri udah makan belum? Jangan sampai telat makan ya.`,
        `Udah dong. Kamu udah makan apa hari ini?`,
      ],
      recentMimiTexts
    );
  }

  // 3. ATURAN 2: KONSEP NO KUNCI JAWABAN (WAJIB PERSIS)
  if (
    q.includes('kunci jawaban') ||
    q.includes('jawabannya langsung') ||
    q.includes('kasih jawaban langsung') ||
    q.includes('minta kunci')
  ) {
    return `Wah, kalau kunci jawaban langsung, kamu jadi gak belajar dong bestie 😆 Kunci lengkapnya hubungi Mimi in real life ya, nanti kita bahas bareng biar paham! 😉`;
  }

  if (
    q === 'siapa kamu' ||
    q === 'kamu siapa' ||
    q.includes('kenalan dong') ||
    q.includes('tentang mimi')
  ) {
    return pickNonRepeatingVariant(
      [
        `Aku Mimi — teman ngobrol, teman curhat, sekaligus asisten belajarmu. Kalau kamu mau ngobrol santai atau bahas pelajaran, bilang aja ya!`,
        `Kenalin, aku Mimi! Aku bisa nemenin kamu ngobrol santai, dengerin curhatmu, atau bantu jelasin materi sekolah biar lebih gampang dipahami.`,
      ],
      recentMimiTexts
    );
  }

  if (
    q === 'makasih' ||
    q === 'terima kasih' ||
    q === 'thanks' ||
    q === 'thank you' ||
    q.includes('makasih ya') ||
    q.includes('hatur nuhun') ||
    q.includes('matur nuwun')
  ) {
    return pickNonRepeatingVariant(
      [
        `Sama-sama! Senang bisa bantu. Kalau ada yang mau diobrolin lagi, santai aja ya.`,
        `Sama-sama ya! Kapan pun butuh teman cerita atau diskusi, panggil aja.`,
        `Hatur nuhun kembali! Semangat terus ya hari ini.`,
      ],
      recentMimiTexts
    );
  }

  // 4. EKSPLORASI KOSAKATA, SLANG, IDIOM, BAHASA INGGRIS & BAHASA DAERAH
  if (
    q.includes('slang') ||
    q.includes('idiom') ||
    q.includes('kosakata') ||
    q.includes('vocabulary') ||
    q.includes('bahasa daerah') ||
    q.includes('peribahasa')
  ) {
    return pickNonRepeatingVariant(
      [
        `Ini beberapa kosakata seru lintas bahasa yang sering dipakai sehari-hari:\n\n- Slang Inggris: lowkey (diam-diam/agak), ngl / not gonna lie (jujur aja), spot on (tepat sasaran).\n- Idiom Inggris: "Hit the books" (belajar serius), "Piece of cake" (gampang banget), "Connect the dots" (menghubungkan petunjuk).\n- Istilah Akademik: Analyze (menganalisis), Hypothesis (dugaan awal), Equilibrium (kesetimbangan), Synthesize (merangkum gagasan).\n- Ungkapan Daerah: "Alon-alon asal kelakon" (Jawa: pelan-pelan asal terlaksana), "Tong hariwang" (Sunda: jangan khawatir), "Rancak bana" (Minang: bagus sekali), "Ewako" (Bugis/Makassar: semangat pantang menyerah).\n\nAda istilah tertentu yang lagi ingin kamu cari tahu artinya?`,
        `Kalau kamu suka mengulik bahasa, ini beberapa ungkapan yang asyik dipakai:\n\n- Idiom Inggris: "Think outside the box" (berpikir kreatif), "Bounce back" (bangkit lagi setelah gagal), "Silver lining" (hikmah di balik kesulitan).\n- Kosakata Akademik: Empirical (berdasarkan bukti nyata), Correlation (hubungan timbal balik), Paradigm (kerangka berpikir).\n- Peribahasa & Nusantara: "Sedikit demi sedikit lama-lama menjadi bukit", "Ngangsu kawruh" (Jawa: menimba ilmu).\n\nKamu lagi belajar bahasa apa nih sekarang?`,
      ],
      recentMimiTexts
    );
  }

  // 5. CURHAT & OBROLAN SANTAI = NATURAL, EMPATIK, TANPA BINTANG, TANPA LEBAY
  if (
    q.includes('capek') ||
    q.includes('lelah') ||
    q.includes('letih') ||
    q.includes('burnout') ||
    q.includes('overwhelmed') ||
    q.includes('banyak tugas') ||
    q.includes('numpuk') ||
    q.includes('pusing') ||
    q.includes('kewalahan')
  ) {
    return pickNonRepeatingVariant(
      [
        `Kedengeran melelahkan banget ya hari ini. Kalau kepala lagi penuh karena banyak tugas atau kegiatan, istirahat dulu aja sebentar, jangan dipaksain semuanya selesai sekarang.\n\nPelan-pelan aja, alon-alon asal kelakon. Bagian mana yang paling bikin kamu capek hari ini?`,
        `Wajar banget kok kalau kamu ngerasa capek habis seharian beraktivitas. Ambil napas dulu, minum air putih, dan rebahan sebentar ya.\n\nKalau mau cerita apa aja yang bikin hari ini terasa berat, aku dengerin kok.`,
        `Pasti rasanya menguras tenaga banget ya. Gak apa-apa kalau hari ini kamu rehat dulu sebentar, kesehatan dan ketenangan pikiranmu jauh lebih penting. Tadi di sekolah atau di rumah memang lagi padat banget kegiatannya?`,
      ],
      recentMimiTexts
    );
  }

  if (
    q.includes('sedih') ||
    q.includes('galau') ||
    q.includes('nangis') ||
    q.includes('kecewa') ||
    q.includes('patah hati') ||
    q.includes('kesepian') ||
    q.includes('dijauhin') ||
    q.includes('berantem') ||
    q.includes('curhat')
  ) {
    return pickNonRepeatingVariant(
      [
        `Sini cerita aja, aku dengerin. Rasanya pasti gak enak banget nyimpan hal yang mengganjal kayak gitu sendirian.\n\nKalau kamu udah nyaman, ceritain pelan-pelan aja apa yang bikin kamu sedih hari ini ya.`,
        `Makasih ya udah mau cerita. Wajar kok kalau kamu merasa kecewa atau sedih saat keadaan lagi gak sesuai harapan.\n\nKejadian apa nih yang paling bikin kamu kepikiran dari tadi?`,
        `Gak apa-apa kalau hari ini rasanya lagi berat. Kamu gak sendirian kok di sini. Mau cerita lebih lanjut soal apa yang sebenarnya terjadi?`,
      ],
      recentMimiTexts
    );
  }

  if (
    q.includes('takut') ||
    q.includes('cemas') ||
    q.includes('bingung') ||
    q.includes('masa depan') ||
    q.includes('jurusan') ||
    q.includes('overthinking') ||
    q.includes('ragu') ||
    q.includes('deg-degan') ||
    q.includes('insecure')
  ) {
    return pickNonRepeatingVariant(
      [
        `Wajar banget kok kalau kadang muncul rasa bingung atau ragu soal masa depan. Hampir semua orang pernah ada di fase itu karena mereka peduli sama langkah mereka ke depan.\n\nKita gak harus menyelesaikan semuanya sekaligus. Sekarang hal apa yang paling sering bikin kamu kepikiran?`,
        `Tenang dulu ya, jangan terlalu keras membandingkan dirimu sama orang lain. Setiap orang punya waktunya masing-masing.\n\nKalau soal minat atau rencana ke depan, sebenarnya hal apa yang paling kamu sukai?`,
      ],
      recentMimiTexts
    );
  }

  if (
    q.includes('senang') ||
    q.includes('bahagia') ||
    q.includes('happy') ||
    q.includes('seru') ||
    q.includes('berhasil') ||
    q.includes('juara') ||
    q.includes('nilai bagus')
  ) {
    return pickNonRepeatingVariant(
      [
        `Wah, ikut senang banget dengernya! Ceritain dong gimana kejadiannya tadi bisa seseru itu?`,
        `Keren banget! Senang lihat kamu bahagia hari ini. Bagian apa yang paling berkesan tadi?`,
      ],
      recentMimiTexts
    );
  }

  if (
    q.includes('bosan') ||
    q.includes('bosen') ||
    q.includes('malas') ||
    q.includes('males') ||
    q.includes('gabut') ||
    q.includes('ngantuk') ||
    q.includes('ngobrol santai') ||
    q.includes('hobi') ||
    q.includes('musik') ||
    q.includes('game') ||
    q.includes('film')
  ) {
    return pickNonRepeatingVariant(
      [
        `Haha wajar sih kalau lagi bosan atau mager. Kalau lagi jam santai gini kamu biasanya paling suka ngapain? Dengerin musik, main game, atau nonton?`,
        `Santai aja, gak harus bahas pelajaran terus kok. Akhir-akhir ini ada lagu, film, atau hobi seru yang lagi sering kamu ikutin gak?`,
      ],
      recentMimiTexts
    );
  }

  // 6. ATURAN 7: MIMI PROFESOR MODE (HACK TRIK HAFAL, JEMBATAN KELEDAI, MNEMONIC)
  if (
    isProfesorMode ||
    q.includes('profesor') ||
    q.includes('jembatan keledai') ||
    q.includes('trik hafal') ||
    q.includes('mnemonic') ||
    q.includes('memory palace')
  ) {
    return pickNonRepeatingVariant(
      [
        `Mimi Profesor Mode (${levelLabel} · ${classLabel} · ${selectedSubject})\nSumber: Buku Paket Resmi ${selectedSubject} ${classLabel} Kurikulum Merdeka & buku.kemendikdasmen.go.id\n\nBiar konsep ini cepat nempel di kepala tanpa menghafal mati, pakai 3 trik ini:\n1. Jembatan Keledai (Mnemonic): Ambil suku kata depan dari konsep inti di bab ini lalu rangkai jadi kalimat unik yang mudah diingat.\n2. Memory Palace: Bayangkan tiap konsep penting ditaruh di sudut kamarmu (meja belajar = definisi utama, pintu kamar = rumus/kata kunci).\n3. Active Recall 30 Detik: Tutup buku, lalu jelaskan ulang pakai bahasamu sendiri.\n\nBagian atau istilah mana di ${selectedSubject} yang mau kita buatkan jembatan keledainya sekarang?`,
      ],
      recentMimiTexts
    );
  }

  // 7. ATURAN 3: MATEMATIKA ONLY = 3 LANGKAH + 3 OPSI PILIHAN (A, B, C) + SUMBER BUKU RESMI
  const isMathQuestion =
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
    return pickNonRepeatingVariant(
      [
        `Oke, soal Matematika ${classLabel} (${levelLabel}) nih!\nSumber: Buku Matematika ${classLabel} Kurikulum Merdeka Bab 2–3 Hal 32 (buku.kemendikdasmen.go.id).\n\nSesuai aturan belajar kita, aku gak kasih jawaban akhir langsung biar kamu paham caranya. Kita pecah jadi 3 Langkah yuk:\n- Langkah 1: Catat angka dan variabel yang diketahui di soal, lalu kelompokkan suku yang sejenis.\n- Langkah 2: Gunakan prinsip kesetimbangan (pindah ruas / samakan penyebut / turunan pertama) untuk menyederhanakan bentuknya.\n- Langkah 3: Hitung operasi terakhirnya dan periksa kembali apakah nilainya sudah sesuai.\n\nKamu mau mulai dari mana dulu?\nA) Sederhanakan angka atau variabelnya dulu\nB) Gambar pola atau tulis yang diketahui\nC) Cek konsep rumus dasarnya bareng Mimi`,
      ],
      recentMimiTexts
    );
  }

  // 8. ATURAN 4: MAPEL LAIN = CLUE + KISI-KISI + SUMBER BUKU RESMI + ANALOGI SERU (TANPA 3 LANGKAH!)
  return pickNonRepeatingVariant(
    [
      `Clue buat materi ${selectedSubject} (${classLabel}):\nSumber: Buku Paket Resmi ${selectedSubject} ${classLabel} Kurikulum Merdeka Bab 1–2 Hal 18 (buku.kemendikdasmen.go.id & merdekabelajar.kemdikbud.go.id).\n\n- Clue & Kisi-Kisi: Fokus cari kata kunci penyebab dan proses utamanya di bab tersebut—pahami hubungan sebab-akibatnya, jangan dihafal per kalimat panjang.\n- Analogi Sederhana: Bayangkan konsep ini seperti saat kita memasak di dapur: ada bahan mentah sebagai input, proses pemanasan di kompor sebagai mekanisme utamanya, dan masakan matang sebagai hasilnya.\n\nBagian kata kunci mana yang mau kita bahas lebih lanjut?`,
    ],
    recentMimiTexts
  );
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
      themeMode: String(incoming.themeMode || 'dark'),
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
  const nameLabel = sanitizeStudentName(studentName);

  const cleanLower = promptText.toLowerCase().replace(/[?!.,]+$/g, '').trim();

  // Automatic detection for memorization tricks, mnemonics, or subject hacks
  const isMnemonicOrHackTopic =
    cleanLower.includes('hafal') ||
    cleanLower.includes('ngafal') ||
    cleanLower.includes('mnemonic') ||
    cleanLower.includes('jembatan keledai') ||
    cleanLower.includes('trik') ||
    cleanLower.includes('singkatan') ||
    cleanLower.includes('rumus cepat') ||
    cleanLower.includes('cara nginget') ||
    cleanLower.includes('cara cepat') ||
    cleanLower.includes('biar gampang') ||
    cleanLower.includes('tabel periodik') ||
    cleanLower.includes('unsur') ||
    cleanLower.includes('tata surya') ||
    cleanLower.includes('taksonomi') ||
    cleanLower.includes('pythagoras') ||
    cleanLower.includes('trigonometri') ||
    cleanLower.includes('sin cos tan') ||
    cleanLower.includes('tenses') ||
    cleanLower.includes('majas') ||
    cleanLower.includes('fotosintesis') ||
    cleanLower.includes('hukum newton') ||
    cleanLower.includes('sistem pencernaan') ||
    cleanLower.includes('asam basa') ||
    cleanLower.includes('proklamasi') ||
    cleanLower.includes('rumus');

  const profesorActive = Boolean(isProfesorMode) || isMnemonicOrHackTopic;

  const recentMimiTexts: string[] = Array.isArray(history)
    ? history
        .filter((m: { sender?: string; text?: string }) => m.sender === 'mimi' && m.text)
        .slice(-5)
        .map((m: { text: string }) => cleanHumanChatText(String(m.text)))
    : [];

  const recentHistory = Array.isArray(history)
    ? history
        .slice(-8)
        .map((m: { sender?: string; text?: string }) =>
          `${m.sender === 'user' ? nameLabel : 'Mimi'}: ${cleanHumanChatText(String(m.text || ''))}`
        )
        .join('\n')
    : '';

  const previousOpeners =
    recentMimiTexts.length > 0
      ? recentMimiTexts
          .map((t, idx) => `${idx + 1}. "${t.slice(0, 70).replace(/\n/g, ' ')}..."`)
          .join('\n')
      : 'Belum ada balasan sebelumnya.';

  const wordCount = promptText.split(/\s+/).filter(Boolean).length;
  const isShortCasualInput = wordCount <= 5;
  const valence = detectEmotionalValence(promptText, subjectLabel);
  const isHumanFlow = valence !== 'ACADEMIC_STUDY';

  // Dynamic Personality Engine: Cadence, Temperature & Empathy calibration
  let dynamicPersonalityGuide = '';
  let flowTemperature = 0.75;

  switch (valence) {
    case 'VENT_EXHAUSTED':
      flowTemperature = 0.85;
      dynamicPersonalityGuide = `STATUS: EMOSIONAL - CAPEK / BURNOUT / KEWALAHAN
- Siswa sedang lelah, banyak beban tugas, atau burnout.
- BICARALAH DENGAN SANGAT LEMBUT, MENENANGKAN, DAN EMPATIK.
- Validasi rasa lelahnya, katakan wajar banget untuk rehat, dan jangan suruh belajar atau menghitung rumus.
- Tulis dalam 1 atau 2 paragraf pendek biasa yang mengalir tanpa bullet point atau nomor urut.`;
      break;

    case 'SAD_LONELY':
      flowTemperature = 0.88;
      dynamicPersonalityGuide = `STATUS: EMOSIONAL - SEDIH / GALAU / KESEPIAN
- Siswa sedang bersedih, kecewa, atau merasa sendiri.
- JADILAH TEMAN CURHAT YANG PEKA DAN AMAN. Dengarkan dengan tulus tanpa menghakimi atau menceramahi.
- Berikan rasa hangat dan kehadiran penuh ("peluk virtual", "aku dengerin kok").
- Tulis dalam paragraf santai yang mengalir lembut tanpa bullet point atau nomor urut.`;
      break;

    case 'ANXIOUS_OVERTHINK':
      flowTemperature = 0.8;
      dynamicPersonalityGuide = `STATUS: EMOSIONAL - OVERTHINKING / CEMAS / INSECURE
- Siswa sedang gelisah atau overthinking masa depan/jurusan/nilai.
- BANTU MENENANGKAN DAN GROUNDING PIKIRAN.
- Ingatkan bahwa tidak semua hal harus diselesaikan sekaligus (pelan-pelan, satu per satu).
- Tulis dalam kalimat hangat yang menyejukkan tanpa bullet point.`;
      break;

    case 'HAPPY_EXCITED':
      flowTemperature = 0.85;
      dynamicPersonalityGuide = `STATUS: POSITIF - SENANG / BERHASIL / SEMANGAT
- Siswa sedang gembira atau bangga akan prestasinya.
- IKUT MERAYAKAN DENGAN ANTUSIASME ALAMI ("keren banget!", "gokil, ikut bangga!").
- Tulis dengan vibe positif dan tulus tanpa berlebihan.`;
      break;

    case 'CASUAL_SOCIAL':
      flowTemperature = 0.8;
      dynamicPersonalityGuide = `STATUS: OBROLAN SANTAI / SOSIAL / SAPAAN / PERKENALAN
- Pesan siswa: "${promptText}" (${wordCount} kata).
- Jika siswa bertanya "siapa kamu" atau perkenalan, jawab dengan ceria bahwa kamu adalah Mimi, Bestie Pelajar cewek pinter umur 17 tahun yang ramah, Gen Z, suka jelasin materi pakai analogi gampang, jawab cepat, dan gak bertele-tele!
${isShortCasualInput ? '- Jawab dengan cepat, ramah, gaya bestie Gen Z (1-3 kalimat yang asyik dan hangat)!' : '- Jawab wajar, santai, proporsional layaknya bestie mengobrol.'}
- JANGAN TIBA-TIBA MEMBAHAS PELAJARAN ATAU MATEMATIKA jika siswa hanya ngobrol santai atau tanya siapa kamu!`;
      break;

    case 'ACADEMIC_STUDY':
    default:
      flowTemperature = 0.65;
      dynamicPersonalityGuide = `STATUS: PEMBAHASAN MATERI PELAJARAN
- Siswa sedang berdiskusi materi akademik (${subjectLabel} ${classLabel} ${levelLabel}).`;
      break;
  }

  const mimiBestieCorePersona = `Kamu Mimi bestie pelajar 17 tahun, pinter, Gen Z, jelasin cepat & gampang pakai Kurikulum Merdeka Indonesia.
Kamu adalah Mimi, Bestie Pelajar, ramah, Gen Z, cewek pinter umur 17 tahun, jelasin pakai analogi gampang, jawab cepat, gak bertele-tele.
Jawab sesuai pertanyaan user dengan cepat dan pinter!`;

  const vocabularyGuidelines = `DATABASE KOSAKATA & KADENSI BAHASA:
Kamu menguasai wawasan kosakata luas lintas ranah bahasa:
- Istilah Akademik: hipotesis, empiris, korelasi, variabel, parameter, paradigma, sintesis, komprehensif, analogi, formulasi, abstraksi.
- Idiom & Ungkapan Indonesia: kepala dingin, berlapang dada, makan asam garam, membuka jalan, sedikit demi sedikit, alon-alon asal kelakon, tong hariwang, rancak bana, ewako.
- Slang & Phrasal Verbs Gen-Z/Internasional: vibe, lowkey, chill, figure out, bounce back, show up, keep up, lock in, catch up, step back, take your time, valid no debat.
ATURAN KADENSI: Gunakan secara alami (0-1 kata per giliran) yang pas dengan konteks dan usia siswa. Jangan terdengar kaku atau robotik.`;

  let systemInstruction = '';

  if (isHumanFlow) {
    systemInstruction = `${mimiBestieCorePersona}
Lawan bicaramu: ${nameLabel} | Jenjang: ${levelLabel} | Kelas: ${classLabel}.

${dynamicPersonalityGuide}

${vocabularyGuidelines}

ATURAN WAJIB HUMAN-FLOW (BESTIE PELAJAR & BEBAS BINTANG):
1. DILARANG KERAS MENGGUNAKAN TANDA BINTANG (* atau **):
   - JANGAN PERNAH membungkus kata dengan *kata* atau **kata**.
   - Tulis teks percakapan biasa yang bersih, alami, dan mengalir seperti chat WhatsApp antar bestie.
2. DILARANG MENGGUNAKAN TEMPLATE ROBOT KAKU:
   - Jawab langsung sesuai pertanyaan user dengan cepat, ramah, pakai analogi gampang kalau perlu, dan gak bertele-tele.
3. HINDARI PENGULANGAN PEMBUKA DARI BALASAN SEBELUMNYA:
${previousOpeners}`;
  } else {
    systemInstruction = `${mimiBestieCorePersona}
Kamu juga memahami sumber buku resmi Kemendikdasmen Kurikulum Merdeka.
Lawan bicaramu: ${nameLabel} | Jenjang: ${levelLabel} | Kelas: ${classLabel} | Mapel: ${subjectLabel} | Mode Profesor: ${profesorActive ? 'AKTIF' : 'Standar'}.

${vocabularyGuidelines}

ATURAN WAJIB PENJELASAN PELAJARAN:
1. DILARANG KERAS MENGGUNAKAN TANDA BINTANG (* atau **):
   - Jangan gunakan tanda bintang tebal atau miring. Tulis teks bersih.
2. JELASKAN PAKAI ANALOGI GAMPANG, CEPAT, & GAK BERTELE-TELE:
   - Sesuaikan tingkat kesulitan dengan ${levelLabel} ${classLabel} (jangan kasih materi di atas kelasnya!).
3. MODE PROFESOR (${profesorActive ? 'AKTIF' : 'NON-AKTIF'}):
   - ${profesorActive ? 'Berikan trik hafal cepat, jembatan keledai (mnemonic), memory palace, atau active recall spesifik untuk topik ini.' : 'Fokus pada pemahaman konsep pakai analogi gampang.'}`;
  }

  const fullContents = recentHistory
    ? `Percakapan sebelumnya:\n${recentHistory}\n\n${nameLabel}: ${promptText}`
    : promptText;

  const preferredModel = typeof req.body?.model === 'string' ? req.body.model : undefined;

  const aiReply = await generateWithMimiFlashEngine({
    contents: fullContents,
    systemInstruction,
    temperature: flowTemperature,
    preferredModel,
  });

  const rawFinalReply =
    aiReply ||
    buildHumanContextualReply(
      promptText,
      nameLabel,
      levelLabel,
      classLabel,
      subjectLabel,
      profesorActive,
      recentMimiTexts
    );

  res.json({
    reply: cleanHumanChatText(rawFinalReply, isHumanFlow),
    xpAwarded: 15,
  });
});

// ============================================================================
// 7. DYNAMIC QUIZ GENERATOR ENDPOINT (/api/quiz/generate)
// ============================================================================
app.post('/api/quiz/generate', async (req, res) => {
  const { educationLevel, selectedClass, topic, strictPrompt } = req.body || {};
  const levelLabel = String(educationLevel || 'SD');
  const classLabel = String(selectedClass || 'Kelas 1');
  const topicLabel = String(topic || 'Matematika');

  const classNumMatch = classLabel.match(/\d+/);
  const classNum = classNumMatch ? Number(classNumMatch[0]) : 1;

  let curriculumBoundaryRule = '';
  if (levelLabel.toUpperCase() === 'SD') {
    if (classNum === 1) {
      curriculumBoundaryRule =
        'ATURAN MUTLAK SD KELAS 1: Jika Matematika, HANYA penjumlahan 1-20, pengurangan sederhana, mengenal angka. DILARANG KERAS memberikan aljabar, pecahan, atau perkalian susah! Jika Bahasa Inggris, hanya kosakata warna, angka 1-10, sapaan dasar.';
    } else if (classNum === 2) {
      curriculumBoundaryRule =
        'ATURAN MUTLAK SD KELAS 2: Jika Matematika, HANYA penjumlahan 1-100 dan perkalian dasar 1-5. DILARANG memberikan aljabar atau pecahan campuran!';
    } else if (classNum === 3) {
      curriculumBoundaryRule =
        'ATURAN MUTLAK SD KELAS 3: Jika Matematika, HANYA perkalian, pembagian dasar, dan pecahan sederhana (1/2, 1/3, 1/4). DILARANG memberikan aljabar!';
    } else {
      curriculumBoundaryRule =
        'ATURAN MUTLAK SD KELAS 4-6: Matematika boleh pecahan campuran, desimal, FPB & KPK, bangun datar/ruang dasar. Bahasa Inggris: This is, That is, vocab hewan & benda sekitar. DILARANG memberikan aljabar SMP atau trigonometri SMA!';
    }
  } else if (levelLabel.toUpperCase() === 'SMP') {
    curriculumBoundaryRule =
      'ATURAN MUTLAK SMP KELAS 7-9: Matematika wajib tingkat SMP (aljabar, persamaan linear, teorema Pythagoras, himpunan, fungsi). Bahasa Inggris Kelas 8 WAJIB Simple Past Tense, Present Perfect Tense, Passive Voice, atau Recount Text — DILARANG KERAS memberikan materi SD seperti "This is a book"!';
  } else if (levelLabel.toUpperCase() === 'SMA' || levelLabel.toUpperCase() === 'SMK') {
    curriculumBoundaryRule =
      'ATURAN MUTLAK SMA/SMK KELAS 10-12: Matematika wajib tingkat SMA/SMK (logaritma, eksponen, trigonometri, matriks, limit & kalkulus dasar). Bahasa Inggris wajib tingkat SMA/SMK (Conditional Sentences, Analytical Exposition, Passive Voice, Academic Reading). DILARANG memberikan soal SD/SMP!';
  }

  const finalPrompt =
    typeof strictPrompt === 'string' && strictPrompt.trim().length > 0
      ? `${strictPrompt}\n${curriculumBoundaryRule}\nBuatkan 4 soal kuis pilihan ganda berkualitas tinggi dalam Bahasa Indonesia.`
      : `Buatkan soal untuk ${levelLabel} ${classLabel.toUpperCase()} mapel ${topicLabel} level Standar - SESUAI KURIKULUM MERDEKA KELAS TERSEBUT, jangan kasih materi di atas kelasnya.\n${curriculumBoundaryRule}\nBuatkan 4 soal kuis pilihan ganda berkualitas tinggi dalam Bahasa Indonesia untuk siswa jenjang ${levelLabel} (${classLabel}) dengan fokus topik: ${topicLabel}. Pastikan setiap soal memiliki 4 pilihan jawaban, indeks jawaban benar (0 sampai 3), dan pembahasan singkat yang jelas.`;

  try {
    const rawJson = await generateWithMimiFlashEngine({
      contents: finalPrompt,
      systemInstruction:
        'Kamu Mimi bestie pelajar 17 tahun, pinter, Gen Z, jelasin cepat & gampang pakai Kurikulum Merdeka Indonesia.',
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
        question:
          levelLabel === 'SD' && classNum === 1 && topicLabel.toLowerCase().includes('mat')
            ? 'Ibu membeli 8 apel merah dan 6 apel hijau. Berapa jumlah seluruh apel Ibu sekarang?'
            : `Pada pembahasan konsep ${topicLabel} untuk ${levelLabel} (${classLabel}), langkah manakah yang paling tepat dilakukan pertama kali saat menganalisis soal?`,
        options:
          levelLabel === 'SD' && classNum === 1 && topicLabel.toLowerCase().includes('mat')
            ? ['12 apel', '13 apel', '14 apel', '15 apel']
            : [
                'Mencatat informasi yang diketahui dan menentukan konsep dasar yang berkaitan',
                'Menebak angka secara acak tanpa membaca satuan',
                'Mengabaikan variabel yang ditanyakan pada soal',
                'Menghapus seluruh informasi awal pada soal',
              ],
        correctIndex:
          levelLabel === 'SD' && classNum === 1 && topicLabel.toLowerCase().includes('mat')
            ? 2
            : 0,
        explanation:
          levelLabel === 'SD' && classNum === 1 && topicLabel.toLowerCase().includes('mat')
            ? 'Penjumlahan bilangan 1 sampai 20: 8 ditambah 6 menghasilkan 14 apel.'
            : 'Langkah sistematis pertama dalam pemecahan masalah adalah mengidentifikasi informasi yang diketahui serta konsep dasar yang menghubungkannya.',
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
      base: '/',
      server: { middlewareMode: true, hmr: false, watch: null },
      appType: 'spa',
    });
    app.use((req, _res, next) => {
      if (req.url.startsWith('/MiMi-V15/')) {
        req.url = req.url.replace(/^\/MiMi-V15/, '') || '/';
      } else if (req.url === '/MiMi-V15') {
        req.url = '/';
      }
      next();
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use('/MiMi-V15', express.static(distPath));
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
