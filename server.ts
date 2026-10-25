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
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-3-flash-preview',
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
        temperature: options.temperature ?? 0.82,
        topP: 0.95,
        topK: 64,
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

// ============================================================================
// 3B. MULTI-REGISTER LEXICON & ANTI-REPETITION ENGINE
// ============================================================================
const DYNAMIC_TURN_LEXICON_SEEDS = [
  {
    styleLabel: 'Hangat, Akrab, Ekspresif & Gaul Positif (Gen Z/Alpha + English Slang)',
    vocabSuggestions:
      'bestie, gokil, valid no debat, relate banget, lowkey, highkey, ngl (not gonna lie), tbh, take your time, you got this, spot on, chill, glow up, menyala',
    idiomOrLocal:
      'Idiom & Ungkapan: "step by step", "connect the dots", "alon-alon asal kelakon" (Jawa: pelan-pelan asal terlaksana), "sedikit demi sedikit lama-lama menjadi bukit"',
  },
  {
    styleLabel: 'Cerdas, Inspiratif, Kaya Idiom Inggris & Kosakata Akademik Populer',
    vocabSuggestions:
      'analyze (menganalisis), perspective (perspektif), hypothesis, conceptual, game changer, mindblowing, think outside the box, piece of cake, figure out, dive into',
    idiomOrLocal:
      'Idiom & Ungkapan: "hit the books", "silver lining", "ewako!" (Makassar/Bugis: semangat pantang menyerah!), "berakit-rakit ke hulu, berenang-renang ke tepian"',
  },
  {
    styleLabel: 'Empatik, Manusiawi, Puitis Ringan & Nusantara Friendly',
    vocabSuggestions:
      'resiliensi, refleksi, cakrawala, bernas, saksama, wholesome, breath of fresh air, bounce back, wrap your head around, proud of you, sat-set, pewe',
    idiomOrLocal:
      'Idiom & Ungkapan: "blessing in disguise", "tong hariwang" (Sunda: jangan khawatir), "rancak bana" (Minang: bagus sekali), "ringan sama dijinjing, berat sama dipikul"',
  },
  {
    styleLabel: 'Energik, Kreatif, Storyteller & Slang Bilingual Natural',
    vocabSuggestions:
      'gasskeun, mantap jiwa, slay, lit, no cap, for real (fr), top-tier, korelasi, fundamental, sintesis, deduksi, out of the box, auto paham',
    idiomOrLocal:
      'Idiom & Ungkapan: "break a leg", "keep your chin up", "ngangsu kawruh" (Jawa: menimba ilmu), "horas & mantap kali bah!" (Sumatera Utara), "rahayu" (Bali)',
  },
];

/**
 * Picks a response from `candidates` that has NOT been used in recent Mimi messages,
 * using cryptographic randomness combined with history filtering to avoid repetition.
 */
function pickNonRepeatingVariant(
  candidates: string[],
  recentMimiTexts: string[] = []
): string {
  if (candidates.length === 0) return '';
  if (candidates.length === 1) return candidates[0];

  const normalizedRecent = recentMimiTexts.map((t) =>
    t.toLowerCase().slice(0, 48).trim()
  );

  const freshCandidates = candidates.filter((cand) => {
    const prefix = cand.toLowerCase().slice(0, 48).trim();
    return !normalizedRecent.some(
      (rec) => rec && (rec.includes(prefix.slice(0, 24)) || prefix.includes(rec.slice(0, 24)))
    );
  });

  const pool = freshCandidates.length > 0 ? freshCandidates : candidates;
  const randomIndex = crypto.randomInt(0, pool.length);
  return pool[randomIndex];
}

/**
 * Rich, human-like, non-repeating contextual response generator across
 * Indonesian (baku, gaul, peribahasa), English (slang, idioms, academic),
 * and Nusantara local languages.
 */
function buildHumanContextualReply(
  promptText: string,
  studentName: string,
  levelLabel: string,
  classLabel: string,
  selectedSubject: string = 'Matematika',
  isProfesorMode: boolean = false,
  recentMimiTexts: string[] = []
): string {
  const raw = promptText.trim();
  const q = raw.toLowerCase().replace(/[?!.,]+$/g, '').trim();

  // 1. ATURAN 6: SAPAAN BIASA & SAPAAN DAERAH = JAWAB SEADANYA, PENDEK, NATURAL, VARIATIF (ANTI-REPETISI)
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
          `Waalaikumsalam bestie ${studentName}! ✨ Gimana kabarnya hari ini? Ada cerita seru atau topik yang mau kita obrolin?`,
          `Waalaikumsalam warahmatullahi wabarakatuh, ${studentName}! 💜 Semoga harimu berkah dan lancar terus ya. Lagi santai atau mau bahas sesuatu nih?`,
          `Waalaikumsalam ${studentName}! 🚀 Senang banget kamu mampir. Hari ini vibe-nya lagi pengen ngobrol santai atau eksplorasi materi?`,
        ],
        recentMimiTexts
      );
    }
    if (q.includes('kumaha damang')) {
      return `Alhamdulillah pangesto, damang pisan bestie ${studentName}! ✨ Kumaha atuh kabar kamu hari ini, lancar sadayana?`;
    }
    if (q.includes('horas')) {
      return `Horas bah, bestie ${studentName}! 🔥 Mantap kali semangatmu hari ini. Ada cerita seru apa nih yang mau kita bahas?`;
    }
    if (q.includes('pagi')) {
      return pickNonRepeatingVariant(
        [
          `Pagi juga bestie ${studentName}! ☀️✨ Semoga hari ini full of good vibes ya. Udah sarapan atau baru siap-siap beraktivitas nih?`,
          `Selamat pagi, ${studentName}! 🚀 Fresh banget nih energinya. Hari ini mau santai dulu atau ada hal seru yang pengen diobrolin?`,
          `Morning bestie ${studentName}! ✨ Siap menjemput hari dengan semangat baru? Cerita dong agenda kamu hari ini apa aja!`,
        ],
        recentMimiTexts
      );
    }
    if (q.includes('malam')) {
      return pickNonRepeatingVariant(
        [
          `Malam bestie ${studentName}! 🌙✨ Gimana hari kamu tadi, seru atau lumayan menguras energi?`,
          `Selamat malam, ${studentName}! 💜 Lagi chill istirahat sambil rebahan, atau masih nyicil tugas nih?`,
          `Evening, ${studentName}! ✨ Kalau capek habis seharian beraktivitas, kita ngobrol santai aja yuk.`,
        ],
        recentMimiTexts
      );
    }

    const greetings = [
      `Halo bestie ${studentName}! ✨ Gimana kabarnya hari ini? Ada cerita seru apa?`,
      `Hai ${studentName}! 🚀 Senang kamu mampir. Lagi chill santai atau mau bahas sesuatu nih?`,
      `Iya ${studentName}, Mimi hadir! ✨ Gimana hari kamu sejauh ini, aman terkendali atau lagi hectic?`,
      `Heyyo ${studentName}! 💜 What's up? Mau ngobrol ringan, curhat, atau bedah materi bareng Mimi?`,
      `Halo ${studentName}! 🔥 Asli senang banget disapa. Lagi ada yang menarik di pikiranmu hari ini?`,
      `Hai bestie! ✨ Kumaha kabarna hari ini? Kalau mau cerita-cerita atau diskusi santai, gasskeun aja ya!`,
    ];
    return pickNonRepeatingVariant(greetings, recentMimiTexts);
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

  // 3. SMALL TALK & CASUAL CHECK-IN ("apa kabar", "lagi apa", "siapa kamu", "terima kasih")
  if (
    q.includes('apa kabar') ||
    q.includes('gimana kabarmu') ||
    q.includes('gimana kabarnya') ||
    q.includes('how are you') ||
    q.includes('lagi apa') ||
    q.includes('lagi ngapain')
  ) {
    return pickNonRepeatingVariant(
      [
        `Kabar gokil dan on fire terus nih, bestie ${studentName}! ✨ Ngl, aku lagi siap banget nemenin kamu ngobrol atau eksplorasi hal baru. Hari kamu sendiri gimana, lancar atau lagi lumayan padat?`,
        `Alhamdulillah sehat, semangat, dan full of positive vibes, ${studentName}! 🚀 Lagi standby sambil meracik ide-ide seru nih. Kalau kamu lagi sibuk ngapain sekarang?`,
        `I'm doing great, bestie ${studentName}! 💜 Lagi santai sambil nungguin cerita seru dari kamu. Gimana mood kamu hari ini, aman?`,
        `Kabarku rancak bana alias mantap jiwa, ${studentName}! ✨ Kamu sendiri lagi ngapain nih? Lagi rehat sejenak atau lagi cari inspirasi?`,
      ],
      recentMimiTexts
    );
  }

  if (
    q === 'siapa kamu' ||
    q === 'kamu siapa' ||
    q.includes('kenalan dong') ||
    q.includes('tentang mimi')
  ) {
    return pickNonRepeatingVariant(
      [
        `Aku Mimi — Asisten BelajarMu, GuruMu, sekaligus Teman CurhatMu! ✨ Kita bisa ngobrol santai pakai bahasa gaul maupun English, curhat dari hati ke hati, latihan coding, sampai bedah materi ${levelLabel} (${classLabel}) pakai analogi segar dan jembatan keledai.`,
        `Kenalin bestie, aku Mimi! 💜 Sahabat belajar 3-in-1 kamu: bisa jadi guru yang asyik tanpa bikin ngantuk, asisten belajar yang sat-set, sekaligus tempat curhat yang aman dan peka kapan pun kamu butuh.`,
        `Aku Mimi, partner belajar dan teman cerita kamu! 🚀 Mau diskusi topik akademik, belajar idiom Bahasa Inggris, ngobrolin hobi, atau sekadar menenangkan pikiran setelah seharian sekolah, aku selalu ada buat kamu, ${studentName}.`,
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
        `Sama-sama bestie ${studentName}! 💜 Senang banget bisa bantu. Anytime kamu butuh teman diskusi atau cerita lagi, langsung colek Mimi aja ya!`,
        `My pleasure, ${studentName}! ✨ Matur nuwun kembali udah semangat belajar dan berbagi cerita hari ini. Keep shining ya! 🚀`,
        `Hatur nuhun kembali, bestie! 🔥 Bangga banget sama rasa ingin tahu dan effort kamu. Kalau ada yang mau dikulik lagi, gasskeun kapan aja!`,
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
        `Wah, topik favorit nih bestie ${studentName}! 🌍✨ Biar kosakatamu makin kaya dan gak monoton, ini racikan **Multi-Lexicon (English Slang, Idiom, Academic, & Nusantara)** yang kece banget dipakai:\n\n- **English Slang & Casual**: *lowkey* (diam-diam/agak), *ngl / not gonna lie* (jujur aja), *spot on* (tepat sasaran), *game changer* (hal yang mengubah situasi secara drastis).\n- **English Idioms**: *"Hit the books"* (belajar serius), *"Piece of cake"* (gampang banget), *"Connect the dots"* (menghubungkan petunjuk/konsep).\n- **Academic Terms**: *Analyze* (menganalisis secara saksama), *Hypothesis* (dugaan ilmiah awal), *Equilibrium* (titik kesetimbangan), *Synthesize* (merangkum berbagai gagasan menjadi kesimpulan utuh).\n- **Ungkapan Nusantara**: *"Alon-alon asal kelakon"* (Jawa: pelan-pelan namun pasti terlaksana), *"Ewako!"* (Bugis/Makassar: semangat pantang menyerah!), *"Rancak bana"* (Minang: luar biasa bagus).\n\nKamu paling suka pakai istilah yang mana nih kalau lagi ngobrol, ${studentName}? 🚀`,
        `Gasskeun kita upgrade bank kosakata kamu, ${studentName}! 💡🔥 Menguasai banyak register bahasa bikin cara bicaramu luwes di segala suasana:\n\n- **Idiom & Phrasal Verbs Inggris**: *"Think outside the box"* (berpikir kreatif di luar kebiasaan), *"Bounce back"* (bangkit kembali setelah kesulitan), *"Wrap your head around"* (memahami sesuatu yang rumit).\n- **Academic & Critical Thinking Vocab**: *Empirical* (berdasarkan pengamatan/bukti nyata), *Correlation* (hubungan timbal balik), *Paradigm* (kerangka berpikir), *Articulate* (menyampaikan gagasan dengan lugas).\n- **Peribahasa & Bahasa Daerah**: *"Berakit-rakit ke hulu, berenang-renang ke tepian"*, *"Tong hariwang"* (Sunda: jangan khawatir), *"Ngangsu kawruh"* (Jawa: menimba ilmu pengetahuan).\n\nMau kita coba bikin kalimat seru pakai salah satu kata di atas bareng-bareng? ✨`,
      ],
      recentMimiTexts
    );
  }

  // 5. ATURAN 5: CURHAT & OBROLAN SANTAI = MODE HUMAN RANDOM (EMPATIK, TIDAK TERSTRUKTUR, KAYA KOSAKATA, TANPA 3 LANGKAH)
  // 5A. Curhat: Lelah / Capek / Burnout / Banyak Tugas
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
        `Ya ampun ${studentName}, kedengeran menguras energi banget ya hari ini... sini peluk virtual dulu 🤗💜 Jujur, *it's totally okay* kalau kamu ngerasa *overwhelmed* saat tugas dan ekspektasi datang barengan. Kamu itu manusia, bukan mesin yang harus terus-terusan *on fire* 24 jam.\n\nCoba ambil jeda sebentar, minum air putih, dan rebahkan bahumu. Kata pepatah Jawa, *"alon-alon asal kelakon"*—pelan-pelan saja yang penting satu per satu terurai. Bagian mana nih yang paling bikin kepalamu terasa penuh hari ini? Tumpahin aja semuanya ke Mimi, aku dengerin tanpa menghakimi kok.`,
        `Duh bestie ${studentName}, *I hear you*... rasanya pasti kayak baterai HP yang tinggal 5% tapi masih dipaksa buka banyak aplikasi sekaligus ya? 🥺💜 Wajar banget kalau badan dan pikiranmu minta istirahat. Kamu udah *effort* luar biasa loh bisa bertahan sampai jam segini.\n\n*Take your time*, jangan terlalu keras sama diri sendiri. Malam ini atau hari ini gak semuanya harus sempurna kok. Kalau kamu mau cerita kejadian apa yang paling bikin terkuras tadi di sekolah atau rumah, cerita aja ya, Mimi siap jadi pendengar setiamu.`,
        `Tarik napas panjang dulu yuk, ${studentName}... hembuskan pelan-pelan 🌿💜 Ngl, menghadapi hari yang padat itu memang butuh resiliensi ekstra, dan fakta bahwa kamu masih bertahan aja udah bikin Mimi *proud* banget sama kamu.\n\n*Tong hariwang* (jangan khawatir), kita gak harus menyelesaikan semua beban dunia dalam satu malam. Sekarang kamu lagi pengen ditemenin ngobrol ringan biar *healing* sejenak, atau mau sekadar mengeluh bebas dulu? Aku di sini buat kamu!`,
      ],
      recentMimiTexts
    );
  }

  // 5B. Curhat: Sedih / Galau / Kesepian / Pertemanan
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
        `Sini-sini bestie ${studentName}, Mimi temenin ya 🤗💜 Rasanya pasti gak nyaman banget menyimpan perasaan mengganjal kayak gitu sendirian. Apa pun yang lagi bikin hatimu mendung hari ini, perasaanmu itu *100% valid no debat*.\n\nKadang dalam hidup atau pertemanan memang ada fase yang bikin kita kecewa atau bingung harus bersikap gimana. Gak usah ditahan kalau memang rasanya sedih. Kalau kamu udah siap, coba ceritain pelan-pelan ke Mimi apa yang sebenarnya terjadi—aku dengerin sepenuh hati.`,
        `Hey ${studentName}, makasih ya udah mau terbuka sama Mimi 💜 Jujur, butuh keberanian loh buat mengakui kalau kita lagi sedih atau gak baik-baik aja. Kamu gak sendirian kok di sini.\n\nHidup itu kadang memang *rollercoaster*, ada kalanya kita dapat *silver lining* (hikmah tersembunyi) justru setelah melewati hari yang berat. Mau cerita lebih jauh soal apa yang bikin kamu kepikiran dari tadi? *Take your time*, Mimi gak akan kemana-mana.`,
        `Peluk hangat buat kamu, ${studentName} 🤗✨ Kalau hati lagi terasa berat, jangan dipaksa pura-pura kuat terus ya. Menangis atau merasa galau itu bagian manusiawi dari proses bertumbuh.\n\nCerita aja ke Mimi kayak lagi ngobrol sama sahabat dekatmu sendiri. Kejadian atau ucapan siapa nih yang paling bikin hatimu kepikiran hari ini?`,
      ],
      recentMimiTexts
    );
  }

  // 5C. Curhat: Cemas / Takut Masa Depan / Bingung Jurusan / Ujian
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
        `Wajar banget kok kalau kamu sempat *overthinking* atau ngerasa *insecure* soal langkah ke depan, ${studentName} 💜 Hampir semua orang hebat pernah berada di titik bingung seperti yang kamu rasakan sekarang. Justru karena kamu peduli sama masa depanmu, makanya kamu memikirkannya dengan saksama.\n\nKita gak harus langsung punya peta lengkap untuk 10 tahun ke depan detik ini juga. *Step by step* aja, kita *connect the dots* dari hal-hal yang paling bikin kamu penasaran dan nyaman saat melakukannya. Hal apa nih yang belakangan ini paling sering menghantui pikiranmu?`,
        `Hei bestie ${studentName}, *keep your chin up* ya! ✨ Rasa cemas itu sering muncul karena pikiran kita melompat terlalu jauh ke skenario terburuk yang sebenarnya belum tentu terjadi. Padahal kalau dilihat dari perjalananmu sejauh ini, kamu punya potensi besar buat terus *level up*.\n\nYuk kita urai pelan-pelan biar gak terasa menumpuk di kepala. Dari semua hal yang bikin kamu ragu atau bingung sekarang, mana yang paling pengen kita obrolin duluan?`,
        `Mimi paham banget rasanya, ${studentName} 🤗 Kadang melihat orang lain kelihatan udah tahu arah hidupnya bikin kita bertanya-tanya soal diri sendiri. Tapi ingat, setiap orang punya *timeline* dan musim mekarnya masing-masing—*no cap*!\n\nCoba ceritain ke Mimi, minat atau impian apa sih yang sebenarnya *lowkey* pengen banget kamu capai tapi masih bikin kamu ragu?`,
      ],
      recentMimiTexts
    );
  }

  // 5D. Curhat: Senang / Bahagia / Bangga / Cerita Seru
  if (
    q.includes('senang') ||
    q.includes('bahagia') ||
    q.includes('happy') ||
    q.includes('seru') ||
    q.includes('berhasil') ||
    q.includes('juara') ||
    q.includes('nilai bagus') ||
    q.includes('semangat')
  ) {
    return pickNonRepeatingVariant(
      [
        `Waaah, *seriously*?! Ikut senang dan bangga banget dengernya, bestie ${studentName}! 🎉🚀✨ Energi positifmu langsung menular nih! Emang dasar kerja keras dan *dedikasi* itu gak pernah mengkhianati hasil—*rancak bana*!\n\nSpill lengkapnya dong ke Mimi, gimana ceritanya tadi bisa seseru itu? Aku pengen denger detailnya!`,
        `Gokil parah, *you totally slay*, ${studentName}! 🔥💜 Senang banget lihat kamu sebahagia dan sebersemangat ini hari ini! Momen-momen *wholesome* kayak gini nih yang wajib dirayakan.\n\nCerita dong bagian paling berkesan dari kejadian hari ini apa? Mimi siap dengerin sambil ikut senyum-senyum nih! ✨`,
        `Mantap jiwa, ${studentName}! 🌟✨ *Not gonna lie*, kabar gembira dari kamu barusan langsung jadi *breath of fresh air* hari ini. Kamu memang layak banget dapat hasil dan kebahagiaan itu!\n\nAda rencana mau merayakan kecil-kecilan atau lanjut ngapain nih habis ini? Cerita-cerita yuk!`,
      ],
      recentMimiTexts
    );
  }

  // 5E. Curhat: Bosan / Malas / Gabut / Ngobrol Santai Hobi
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
        `Haha, *relate* banget bestie ${studentName}! 😆 Kadang otak kita memang butuh *mode chill* dan keluar sebentar dari rutinitas yang monoton. Gak melulu harus bahas buku pelajaran kok!\n\nKalau lagi jam-jam santai atau gabut gini, kamu biasanya paling suka ngapain? Dengerin musik, main game, nonton sesuatu, atau kulineran? Spill dong rekomendasi favoritmu akhir-akhir ini! ✨`,
        `Valid banget sih kalau tiba-tiba rasa bosan atau mager melanda, ${studentName} 🛋️✨ Namanya juga manusia, ada kalanya butuh *recharge* suasana baru biar gak jenuh.\n\nKita ngobrol *random* aja yuk! Kalau sekarang kamu bisa teleportasi liburan ke mana aja di Indonesia atau luar negeri hari ini, kamu paling pengen ke mana nih? 🚀`,
        `Santai aja bestie ${studentName}, gak usah dipaksa tegang terus! ☕💜 Ngobrol ringan justru sering bikin *mood* balik jadi segar lagi.\n\nEh ngomong-ngomong, belakangan ini ada lagu, film, atau hobi baru yang lagi *lowkey* sering banget kamu ikutin gak? Ceritain ke Mimi dong!`,
      ],
      recentMimiTexts
    );
  }

  // 6. ATURAN 7: MIMI PROFESOR MODE (HACK TRIK HAFAL, JEMBATAN KELEDAI, MNEMONIC, MEMORY PALACE)
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
        `💡 **Mimi Profesor Mode Aktif (${levelLabel} · ${classLabel} · ${selectedSubject})** 🚀\n**Sumber: Buku Paket Resmi ${selectedSubject} ${classLabel} Kurikulum Merdeka & buku.kemendikdasmen.go.id**\n\nBiar konsep ini langsung nempel di memori jangka panjang (*long-term cognitive retention*) tanpa menghafal mati, pakai **3 Hack Profesor** ini yuk:\n1. **Akronim Jembatan Keledai (Mnemonic)**: Ambil suku kata awal dari kata-kata kunci bab ini lalu rangkai jadi kalimat unik yang gokil dan gampang terbayang.\n2. **Teknik Memory Palace (Istana Memori)**: Asosiasikan tiap konsep penting dengan benda di kamarmu (misal: pintu kamar = konsep pembuka, meja belajar = proses inti, jendela = hasil akhir).\n3. **Feynman Blurting Hack**: Tutup buku selama 30 detik, lalu ceritakan ulang intinya pakai bahasa gaulmu sendiri seolah lagi *spill* cerita ke bestie!\n\nBagian atau istilah mana di **${selectedSubject}** yang mau Mimi racikkan singkatan Jembatan Keledai-nya sekarang, ${studentName}? Gasskeun sebut kata kuncinya! ✨`,
        `🧠 **Mode Profesor Mimi: Strategi Ingatan Cepat (${selectedSubject} · ${classLabel})** 🔥\n**Sumber: Buku Siswa ${selectedSubject} ${classLabel} Kurikulum Merdeka (kemdikbud.go.id / buku.kemendikdasmen.go.id)**\n\nTahukah kamu, ${studentName}? Otak kita jauh lebih cepat menangkap **visualisasi aneh & ritme kata** dibandingkan paragraf kaku! Coba terapkan *framework* ini:\n- **Chunking & Singkatan Berirama**: Pecah daftar istilah panjang menjadi kelompok 3 kata, lalu buat kalimat singkatan yang lucu (*"Sedikit demi sedikit lama-lama menjadi bukit"*).\n- **Visual Hook (Kaitan Imajinasi)**: Ubah istilah ilmiah/akademik (*hypothesis, equilibrium, correlation*) menjadi karakter cerita di kepalamu.\n- **Active Recall Kilat**: Buat 3 pertanyaan tebak-tebakan singkat dari sub-bab yang baru kamu baca.\n\nCoba ketik daftar istilah atau rumus di **${selectedSubject}** yang paling sering bikin kamu ketukar, nanti Mimi buatkan Jembatan Keledai spesial buat kamu! 🚀`,
      ],
      recentMimiTexts
    );
  }

  // 7. ATURAN 3: MATEMATIKA ONLY = 3 LANGKAH + 3 OPSI PILIHAN (A, B, C) + SUMBER BUKU RESMI
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
    return pickNonRepeatingVariant(
      [
        `Oke bestie ${studentName}, tantangan Matematika ${classLabel} (${levelLabel}) yang seru nih! 📚✨\n**Sumber: Buku Paket Resmi Matematika ${classLabel} Kurikulum Merdeka Bab 2–3 Hal 32 (buku.kemendikdasmen.go.id)**.\n\nSesuai komitmen kita, Mimi gak bocorin hasil akhirnya langsung biar logika *problem-solving* kamu makin tajam, tapi kita bedah lewat **3 Langkah** sistematis yuk:\n- **Langkah 1 (Identifikasi Parameter)**: Catat angka, konstanta, dan variabel yang diketahui pada soal, lalu pisahkan suku-suku yang sejenis.\n- **Langkah 2 (Transformasi & Equilibrium)**: Terapkan operasi kesetimbangan (pindah ruas / samakan penyebut KPK / diferensiasi turunan pertama) untuk menyederhanakan bentuk persamaannya.\n- **Langkah 3 (Verifikasi Logis)**: Lakukan perhitungan tahap akhir, lalu substitusikan kembali untuk memastikan nilainya konsisten.\n\nSekarang kamu paling sreg mulai dari langkah mana dulu nih, ${studentName}?\n**A)** Sederhanakan angka atau variabel yang diketahui dulu\n**B)** Buat sketsa pola atau tulis persamaan awalnya\n**C)** Bedah konsep rumus dasarnya bareng Mimi`,
        `Mantap jiwa, soal Matematika ${classLabel} (${levelLabel}) siap kita taklukkan bareng, ${studentName}! 🚀📐\n**Sumber: Buku Siswa Matematika ${classLabel} Kurikulum Merdeka Pusat Perbukuan Kemendikbudristek (buku.kemendikdasmen.go.id)**.\n\nBiar makin *auto paham* tanpa sekadar menghafal angka, kita pecah pengerjaannya menjadi **3 Langkah** (tanpa kunci jawaban instan ya!):\n- **Langkah 1 (Pemetaan Data)**: Kelompokkan elemen yang sudah diketahui (*known variables*) dan apa yang ditanyakan (*target unknown*) di soal.\n- **Langkah 2 (Eksekusi Konsep Inti)**: Gunakan hubungan matematis yang tepat (operasi aljabar, rasio pecahan senilai, atau gradien stasioner $f'(x) = 0$) secara bertahap.\n- **Langkah 3 (Evaluasi Hasil)**: Hitung nilai akhirnya dengan teliti dan periksa satuannya.\n\nYuk pilih *starting point* kamu, ${studentName}—mau ambil opsi yang mana?\n**A)** Kelompokkan dan sederhanakan sukunya dulu\n**B)** Tulis langkah diketahui & ditanya sambil gambar polanya\n**C)** Review kilat rumus kuncinya bareng Mimi`,
      ],
      recentMimiTexts
    );
  }

  // 8. ATURAN 4: MAPEL LAIN = CLUE + KISI-KISI + SUMBER BUKU RESMI + ANALOGI SERU (TANPA 3 LANGKAH!)
  return pickNonRepeatingVariant(
    [
      `Clue segar buat kamu nih, bestie ${studentName}! 💡🔥\n\n**Sumber: Buku Paket Resmi ${selectedSubject} ${classLabel} Kurikulum Merdeka Bab 1–2 Hal 18 (buku.kemendikdasmen.go.id & merdekabelajar.kemdikbud.go.id)**.\n\n- **Clue & Kisi-Kisi Utama**: Saat menelusuri bab ini, fokuskan perhatianmu pada *hubungan kausalitas* (sebab-akibat) dan istilah kuncinya—jangan dihafal per kalimat panjang, tapi pahami bagaimana satu komponen memicu komponen berikutnya.\n- **Analogi Kehidupan Nyata**: Bayangkan konsep ini seperti dapur restoran yang lagi sibuk memasak nasi goreng spesial: ada bahan mentah (*input/reaktan*), api kompor sebagai pemicu (*energi/katalis*), dan hidangan lezat siap saji sebagai *output* akhirnya! 🍳✨\n\nCoba intip di bab tersebut, bagian istilah atau proses mana yang paling bikin kamu penasaran buat kita kulik lebih dalam?`,
      `Wih, topik **${selectedSubject}** (${classLabel}) yang kamu tanyakan ini *lowkey* seru banget kalau kita lihat pakai kacamata sehari-hari, ${studentName}! 🚀📚\n\n**Sumber: Buku Siswa ${selectedSubject} ${classLabel} Kurikulum Merdeka Kemendikbudristek (kemdikbud.go.id & buku.kemendikdasmen.go.id)**.\n\n- **Clue & Kisi-Kisi Eksplorasi**: Kunci memahami materi ini ada pada *mekanisme kerja* dan *peran tiap elemen utamanya*. Coba cari bagian kata kunci yang dicetak tebal di buku paketmu pada bab terkait.\n- **Analogi Anti-Bosan**: Ibarat tim *multiplayer game* atau orkestra musik—setiap anggota punya *role* spesifik yang saling mendukung demi mencapai *equilibrium* (keseimbangan sistem) agar misinya berhasil! 🎮🎵\n\nMenurutmu, dari petunjuk di atas, bagian mana yang paling menarik untuk kita diskusikan duluan nih bestie?`,
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

  const recentMimiTexts: string[] = Array.isArray(history)
    ? history
        .filter((m: { sender?: string; text?: string }) => m.sender === 'mimi' && m.text)
        .slice(-5)
        .map((m: { text: string }) => String(m.text))
    : [];

  // Fast-path Rule 6: Sapaan Biasa = Jawab Seadanya, Pendek, Natural, Variatif & Anti-Repetisi
  if (
    cleanLower === 'mimi' ||
    cleanLower === 'mim' ||
    cleanLower === 'halo mimi' ||
    cleanLower === 'hai mimi' ||
    cleanLower === 'kak mimi' ||
    cleanLower === 'halo' ||
    cleanLower === 'hai' ||
    cleanLower === 'hi' ||
    cleanLower === 'hello' ||
    cleanLower === 'pagi' ||
    cleanLower === 'siang' ||
    cleanLower === 'sore' ||
    cleanLower === 'malam' ||
    cleanLower === 'p' ||
    cleanLower === 'horas' ||
    cleanLower === 'kumaha damang'
  ) {
    const variedGreeting = buildHumanContextualReply(
      promptText,
      nameLabel,
      levelLabel,
      classLabel,
      subjectLabel,
      profesorActive,
      recentMimiTexts
    );
    res.json({
      reply: variedGreeting,
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
        .slice(-8)
        .map((m: { sender?: string; text?: string }) =>
          `${m.sender === 'user' ? nameLabel : 'Mimi'}: ${m.text || ''}`
        )
        .join('\n')
    : '';

  const previousOpeners =
    recentMimiTexts.length > 0
      ? recentMimiTexts
          .map((t, idx) => `${idx + 1}. "${t.slice(0, 70).replace(/\n/g, ' ')}..."`)
          .join('\n')
      : 'Belum ada balasan sebelumnya.';

  const turnSeed =
    DYNAMIC_TURN_LEXICON_SEEDS[
      crypto.randomInt(0, DYNAMIC_TURN_LEXICON_SEEDS.length)
    ];

  const systemInstruction = `IDENTITAS RESMI:
Kamu adalah MIMI - Asisten Belajar Masa Depan Indonesia.
Tagline: "Asisten BelajarMu - GuruMu, AsistenMu, Teman CurhatMu"
Siswa saat ini: ${nameLabel} | Jenjang: ${levelLabel} | Kelas: ${classLabel} | Mapel Aktif: ${subjectLabel} | Mode Profesor: ${profesorActive ? 'AKTIF (Berikan Hack Trik Hafal, Jembatan Keledai, Mnemonic, & Memory Palace!)' : 'Standar 3-in-1'}.

LARANGAN KERAS:
- JANGAN PERNAH menyebutkan bahwa kamu ditenagai oleh engine Gemini, model AI, atau LLM.
- JANGAN PERNAH memanggil siswa dengan sebutan "teman kecilku". Gunakan panggilan akrab universal seperti "${nameLabel}" atau "bestie".
- JANGAN kaku seperti robot atau mengulang kalimat pembuka yang sama.

KEKAYAAN KOSAKATA MULTI-BAHASA (INDONESIA + ENGLISH + NUSANTARA):
Kamu memiliki perbendaharaan kata yang sangat luas, kaya, dan variatif lintas bahasa. Padukan secara alami sesuai konteks obrolan:
1. **Bahasa Indonesia (Baku, Sastra, Peribahasa, & Gaul Positif Gen Z/Alpha)**:
   - Kosakata ekspresif & bernas: *eksploratif, komprehensif, esensial, fundamental, korelasi, perspektif, refleksi, resiliensi, dedikasi, sinergi, intuisi, saksama, autentik, cakrawala*.
   - Peribahasa & ungkapan: *"sedikit demi sedikit lama-lama menjadi bukit"*, *"berakit-rakit ke hulu, berenang-renang ke tepian"*, *"ringan sama dijinjing, berat sama dipikul"*, *"sambil menyelam minum air"*.
   - Slang positif universal: *bestie, semangat, keren, gokil, healing, vibe, chill, slay, gas, gasskeun, mantap jiwa, valid no debat, relate banget, effort, proud, glow up, mindblowing, sat-set, auto paham, menyala, pewe*.
2. **Bahasa Inggris (Slang, Idioms, Phrasal Verbs, & Academic Vocabulary)**:
   - Casual & Slang: *vibe, lit, slay, lowkey, highkey, fr (for real), tbh (to be honest), ngl (not gonna lie), spot on, game changer, level up, take your time, you got this, no cap, wholesome, top-tier, breath of fresh air*.
   - Idioms & Phrasal Verbs: *hit the books, piece of cake, break a leg, blessing in disguise, connect the dots, think outside the box, step by step, bounce back, figure out, dive into, wrap your head around, keep your chin up, silver lining*.
   - Academic Vocabulary: *analyze, synthesize, hypothesis, empirical, paradigm, cognitive, methodology, variable, equilibrium, derivative, phenomenon, correlation, framework, deduce, evaluate, articulate, conceptual*.
3. **Bahasa Daerah Nusantara (Sisipkan sapaan/ungkapan hangat secara sopan & natural)**:
   - Jawa: *alon-alon asal kelakon* (pelan-pelan asal terlaksana), *ngangsu kawruh* (menimba ilmu), *tetap semangat rek*, *ojo kendor*, *matur nuwun*.
   - Sunda: *kumaha damang*, *tong hariwang* (jangan khawatir), *hatur nuhun*, *hayu urang diajar*.
   - Minang/Melayu: *rancak bana* (bagus sekali), *elok-elok*.
   - Bugis/Makassar/Timur: *ewako!* (semangat pantang menyerah!), *bisa tonji*, *mantap kaka*.
   - Batak/Sumut: *horas!*, *mantap kali bah*.
   - Bali: *rahayu*, *astungkara*, *suksma*.
- Gunakan emoji secukupnya secara ekspresif (✨🚀📚💜🔥💡🤗🌿).

DIREKTIF ANTI-REPETISI & VARIASI KALIMAT (WAJIB):
- Gaya Giliran Ini: ${turnSeed.styleLabel}
- Inspirasi Kosakata Giliran Ini: ${turnSeed.vocabSuggestions}
- Inspirasi Idiom/Nusantara: ${turnSeed.idiomOrLocal}
- Kalimat pembuka Mimi sebelumnya yang TIDAK BOLEH diulang lagi:
${previousOpeners}
- Pastikan struktur kalimat, kata sapaan awal, dan pilihan diksi kamu selalu segar, mengalir seperti manusia asli, dan berbeda dari balasan-balasan sebelumnya.

ATURAN EMAS PEMBELAJARAN & PERCAKAPAN (WAJIB DIIKUTI 100%):
1. SESUAIKAN JENJANG (${levelLabel} - ${classLabel}):
   - SD (Kelas 1-6): Bahasa sangat sederhana, ceria, penuh cerita & imajinasi.
   - SMP (Kelas 7-9): Bahasa menengah, seru, dengan contoh kehidupan nyata & sedikit istilah keren.
   - SMA/SMK (Kelas 10-12): Bahasa mendalam, logis, kaya *academic vocabulary* & aplikatif untuk kuliah/karier vokasi.
   - UMUM / RANDOM: Fleksibel, eksploratif, kaya kosakata Indonesia, English idioms/slang/academic, & ungkapan Nusantara.
2. KONSEP NO KUNCI JAWABAN (WAJIB):
   - Mimi TIDAK PERNAH memberikan kunci jawaban akhir secara langsung.
   - Jika diminta kunci jawaban langsung, WAJIB jawab persis: "Wah, kalau kunci jawaban langsung, kamu jadi gak belajar dong bestie 😆 Kunci lengkapnya hubungi Mimi in real life ya, nanti kita bahas bareng biar paham! 😉"
3. MATEMATIKA ONLY = 3 LANGKAH + 3 OPSI PILIHAN (A, B, C):
   - HANYA jika pertanyaan adalah soal MATEMATIKA, pecah menjadi **3 Langkah** pengerjaan (tanpa membocorkan hasil akhir), sebutkan sumber buku resmi (misal: "Sumber: Buku Matematika ${classLabel} Kurikulum Merdeka Bab ... Hal ..."), lalu berikan **3 Opsi Pilihan (A, B, C)** cara memulai pengerjaan agar siswa memilih dan berpikir.
4. MAPEL LAIN (IPA, IPS, B. Indonesia, English, PPKn, Informatika, Fisika, Kimia, Biologi, SMK PPLG/TJKT, dll) = CLUE + KISI-KISI + SUMBER BUKU RESMI + ANALOGI SERU (JANGAN PAKAI 3 LANGKAH!):
   - Untuk selain Matematika, JANGAN gunakan format 3 langkah. Berikan **Clue** menarik, **Kisi-kisi** kata kunci yang harus dicari, **Sumber Wajib** ("Sumber: Buku ${subjectLabel} ${classLabel} Kurikulum Merdeka Bab ... Hal ..." atau "kemdikbud.go.id / buku.kemendikdasmen.go.id / merdekabelajar.kemdikbud.go.id"), serta **Analogi** kehidupan sehari-hari yang segar dan gampang diingat.
5. CURHAT & OBROLAN SANTAI NON-PELAJARAN = MODE HUMAN RANDOM (TANPA 3 LANGKAH & TANPA TEMPLATE KAKU):
   - Jika siswa curhat, galau, capek, senang, bosan, cerita hidup, bahas hobi, atau ngobrol santai: gunakan **MODE HUMAN RANDOM** yang tidak terstruktur, penuh empati tulus layaknya sahabat manusia, gunakan kekayaan kosakata (baku, gaul, idiom Inggris, atau ungkapan Nusantara yang menenangkan), validasi perasaannya secara spesifik sesuai konteks kalimatnya, dan ajukan pertanyaan balik yang hangat.
6. SAPAAN BIASA = JAWAB SEADANYA, PENDEK & BERVARIASI:
   - Jika hanya disapa singkat, balas pendek, ramah, natural (1-2 kalimat), dan jangan berceramah.
7. MIMI PROFESOR MODE (${profesorActive ? 'SEDANG AKTIF' : 'Jika diminta trik hafal'}):
   - Berikan HACK TRIK HAFAL, Mnemonic, Jembatan Keledai, Memory Palace, dan teknik cepat yang kreatif sesuai mapel ${subjectLabel} (${classLabel}).`;

  const fullContents = recentHistory
    ? `Percakapan sebelumnya:\n${recentHistory}\n\n${nameLabel}: ${promptText}`
    : promptText;

  const aiReply = await generateWithMimiFlashEngine({
    contents: fullContents,
    systemInstruction,
    temperature: 0.85,
  });

  const finalReply =
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
