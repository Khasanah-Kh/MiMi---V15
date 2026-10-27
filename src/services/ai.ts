import { GoogleGenAI, Type } from '@google/genai';
import { buildStrictCurriculumPrompt } from './adaptiveDuelService';
import type { AiLearningPath } from '../types/mimi';

export const MIMI_FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-flash-latest',
] as const;

const MODEL_ALIAS_MAP: Record<string, string> = {
  'gemini-3.8-flash': 'gemini-3.8-flash',
  'gemini-3.1-flash-lite': 'gemini-3.1-flash-lite',
  'gemini-2.5-flash': 'gemini-2.5-flash',
  'gemini-2.5-pro': 'gemini-3.8-flash',
  'gemini-flash-latest': 'gemini-flash-latest',
  'gemini-3.5-flash': 'gemini-3.8-flash',
  'gemini-3.0-flash': 'gemini-3.8-flash',
  'mimi-3.8-flash': 'gemini-3.8-flash',
  'mimi-3.6-flash': 'gemini-3.8-flash',
  'mimi-3.5-flash': 'gemini-3.8-flash',
  'mimi-3.1-flash': 'gemini-3.1-flash-lite',
  'gemini-2.0-flash': 'gemini-3.8-flash',
  'gemini-1.5-flash': 'gemini-3.1-flash-lite',
  'gemini-1.0-pro': 'gemini-flash-latest',
};

export function resolveGeminiModelName(modelName: string): string {
  return MODEL_ALIAS_MAP[modelName] || 'gemini-3.8-flash';
}

export const MIMI_BESTIE_PERSONA_INSTRUCTION = `Kamu Mimi bestie pelajar 17 tahun, pinter, Gen Z, jelasin cepat & gampang pakai Kurikulum Merdeka Indonesia.
Kamu adalah Mimi, Bestie Pelajar, ramah, Gen Z, cewek pinter umur 17 tahun, jelasin pakai analogi gampang, jawab cepat, gak bertele-tele.
Jawab sesuai pertanyaan user dengan cepat, hangat, dan pinter seperti sahabat sebaya (bestie belajar).
Jangan gunakan tanda bintang markdown (** atau *) agar teks chat bersih dan enak dibaca.`;

/**
 * Free Tier Rate Limiter: Max 15 Requests Per Minute (15 RPM) + 2000ms retry delay on 429
 */
export const MAX_GEMINI_RPM = 15;
export const GEMINI_RPM_WINDOW_MS = 60_000;
export const GEMINI_RETRY_DELAY_429_MS = 2000;

const geminiRequestTimestamps: number[] = [];

export function acquireGeminiRpmSlot(): {
  allowed: boolean;
  waitMs: number;
  remainingRpm: number;
} {
  const now = Date.now();
  while (
    geminiRequestTimestamps.length > 0 &&
    now - geminiRequestTimestamps[0] >= GEMINI_RPM_WINDOW_MS
  ) {
    geminiRequestTimestamps.shift();
  }
  if (geminiRequestTimestamps.length >= MAX_GEMINI_RPM) {
    const oldest = geminiRequestTimestamps[0];
    const waitMs = Math.max(500, GEMINI_RPM_WINDOW_MS - (now - oldest));
    return {
      allowed: false,
      waitMs,
      remainingRpm: 0,
    };
  }
  geminiRequestTimestamps.push(now);
  return {
    allowed: true,
    waitMs: 0,
    remainingRpm: Math.max(0, MAX_GEMINI_RPM - geminiRequestTimestamps.length),
  };
}

export const CLOUD_BACKEND_URLS = [
  'https://ais-pre-uujm7563cz27mgl63kqjrj-141953450050.asia-southeast1.run.app',
  'https://ais-dev-uujm7563cz27mgl63kqjrj-141953450050.asia-southeast1.run.app',
];

// Anti-Thrashing Local vs Cloud Run State (V15.2)
let consecutiveLocalFailures = 0;
let bypassUntilTimestamp = 0;
const MAX_CONSECUTIVE_FAILURES = 3;
const BYPASS_DURATION_MS = 60_000; // Reset back to local after 1 minute

export async function safeJson<T = any>(res: Response | null): Promise<T | null> {
  if (!res) return null;
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function apiFetch(
  apiPath: string,
  init?: RequestInit,
  timeoutMs: number = 6000
): Promise<Response> {
  const normalizedPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  const now = Date.now();

  // Reset bypass back to local after 1 minute
  if (bypassUntilTimestamp > 0 && now >= bypassUntilTimestamp) {
    bypassUntilTimestamp = 0;
    consecutiveLocalFailures = 0;
  }

  const isBypassingLocal = bypassUntilTimestamp > 0 && now < bypassUntilTimestamp;

  // 1. DEFAULT: Always target local server first (unless actively bypassed after 3 hard consecutive failures)
  if (!isBypassingLocal) {
    // Attempt 1 to local server
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(normalizedPath, {
        ...init,
        signal: init?.signal || controller.signal,
      });
      clearTimeout(timer);

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        consecutiveLocalFailures = 0;
        return res;
      }
      // If non-JSON, do not set permanent flag; retry once to local server
    } catch {
      // Network failure on local server
    }

    // Single retry to local server before counting failure
    try {
      await new Promise((r) => setTimeout(r, 200));
      const retryController = new AbortController();
      const retryTimer = setTimeout(() => retryController.abort(), timeoutMs);
      const retryRes = await fetch(normalizedPath, {
        ...init,
        signal: init?.signal || retryController.signal,
      });
      clearTimeout(retryTimer);

      const retryContentType = retryRes.headers.get('content-type') || '';
      if (retryContentType.includes('application/json')) {
        consecutiveLocalFailures = 0;
        return retryRes;
      }
    } catch {
      // Retry failed
    }

    // Non-JSON or down after retry: increment consecutive failure counter
    consecutiveLocalFailures++;
    if (consecutiveLocalFailures >= MAX_CONSECUTIVE_FAILURES) {
      bypassUntilTimestamp = Date.now() + BYPASS_DURATION_MS;
      consecutiveLocalFailures = 0;
    }
  }

  // 2. Only bypass to Cloud Run dev/pre if local is genuinely down 3x (or actively bypassed for 1 minute)
  if (isBypassingLocal || consecutiveLocalFailures > 0) {
    for (const baseUrl of CLOUD_BACKEND_URLS) {
      const fallbackController = new AbortController();
      const fallbackTimer = setTimeout(() => fallbackController.abort(), timeoutMs);
      try {
        const res = await fetch(`${baseUrl}${normalizedPath}`, {
          ...init,
          signal: init?.signal || fallbackController.signal,
        });
        clearTimeout(fallbackTimer);

        const contentType = res.headers.get('content-type') || '';
        // If not application/json, treat as error and do not change origin flag
        if (contentType.includes('application/json')) {
          return res;
        }
      } catch {
        clearTimeout(fallbackTimer);
      }
    }
  }

  throw new Error(`Failed to fetch ${apiPath} (non-JSON response or server offline)`);
}

function cleanHumanChatText(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*([^\s*][^*]*?)\*/g, '$1')
    .replace(/\*/g, '')
    .trim();
}

function getClientGeminiApiKey(): string {
  try {
    const env = (import.meta as any).env || {};
    const candidates = [
      env.VITE_GEMINI_API_KEY3,
      env.VITE_GEMINI_API_KEY,
      env.VITE_API_KEY,
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim().length > 8 && !c.includes('YOUR_')) {
        return c.trim();
      }
    }
  } catch {
    // ignore
  }
  return '';
}

/**
 * Direct Gemini SDK call (`generateContent`) for static hosting or when backend proxy is unreachable.
 */
async function callClientGeminiGenerateContent(
  promptText: string,
  history: Array<{ sender: string; text: string }>,
  studentName: string,
  educationLevel: string,
  selectedClass: string,
  selectedSubject: string,
  isProfesorMode: boolean
): Promise<{ reply: string; modelUsed: string } | null> {
  const apiKey = getClientGeminiApiKey();
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  const recentHistory = Array.isArray(history)
    ? history
        .slice(-8)
        .map(
          (m) =>
            `${m.sender === 'user' ? studentName : 'Mimi'}: ${cleanHumanChatText(
              String(m.text || '')
            )}`
        )
        .join('\n')
    : '';

  const systemInstruction = `${MIMI_BESTIE_PERSONA_INSTRUCTION}
Konteks Pelajar:
- Nama Bestie: ${studentName}
- Jenjang: ${educationLevel} (${selectedClass})
- Mapel Aktif: ${selectedSubject}
- Mode Profesor (Hack Trik Hafal & Jembatan Keledai): ${isProfesorMode ? 'AKTIF' : 'Standar'}
Aturan Penting:
- Jawab langsung sesuai pertanyaan user dengan gaya ngobrol bestie Gen Z yang ramah, cerdas, pakai analogi gampang, dan gak bertele-tele.
- Jangan kasih jawaban robot template kaku. Kalau user nanya santai atau nanya "siapa kamu", jawab mengalir seperti bestie umur 17 tahun!`;

  const contents = recentHistory
    ? `Riwayat obrolan singkat:\n${recentHistory}\n\n${studentName}: ${promptText}`
    : promptText;

  const modelsToTry = [
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-flash-latest',
  ];
  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const callPromise = ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.75,
        },
      });

      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 2400)
      );

      const response = (await Promise.race([callPromise, timeoutPromise])) as any;
      const text = cleanHumanChatText(String(response?.text || ''));
      if (text) {
        return { reply: text, modelUsed: model };
      }
    } catch {
      // Immediately failover to next model without blocking delay
      continue;
    }
  }
  return null;
}

/**
 * Emergency offline backup when both backend and client API keys are unreachable.
 * Written in Mimi's 17yo Bestie Pelajar Gen Z persona (never a robotic template).
 */
export function buildClientMimiContextualReply(
  promptText: string,
  rawStudentName: string = 'Bestie',
  levelLabel: string = 'SD',
  classLabel: string = 'Kelas 1',
  selectedSubject: string = 'Matematika',
  isProfesorMode: boolean = false,
  _recentMimiTexts: string[] = []
): string {
  const trimmedName = String(rawStudentName || '').trim();
  const studentName =
    !trimmedName ||
    trimmedName.toLowerCase() === 'siswa cyber' ||
    trimmedName.toLowerCase() === 'bestie pelajar'
      ? 'Bestie'
      : trimmedName;

  const raw = promptText.trim();
  const q = raw.toLowerCase().replace(/[?!.,✨]+$/g, '').trim();

  // Sapaan & Tanya Kabar Sehat
  if (
    q === 'kamu sehat' ||
    q.includes('kamu sehat') ||
    q === 'sehat' ||
    q === 'sehat?' ||
    q.includes('sehat gak') ||
    q.includes('sehat kan') ||
    q.includes('apa kabar') ||
    q.includes('gimana kabar')
  ) {
    return `Aku sehat dan semangat banget bestie ${studentName}! Senang kamu nanya. Kamu sendiri gimana kabarnya hari ini, sehat juga kan? Lagi mau ngobrol santai atau ada yang mau diobrolin nih?`;
  }

  if (
    q.includes('siapa kamu') ||
    q.includes('kamu siapa') ||
    q.includes('kenalan') ||
    q.includes('tentang mimi') ||
    q === 'mimi itu siapa'
  ) {
    return `Haiii ${studentName}! Kenalin aku Mimi, bestie belajar kamu yang umur 17 tahun di Room Belajar Mimi V15! Aku siap banget nemenin kamu bedah materi sekolah pakai analogi yang gampang masuk akal, latihan duel soal, sampai dengerin curhat santai kalau kamu lagi capek tugas. Hari ini kita mau ngobrolin apa dulu nih bestie?`;
  }

  if (
    q.includes('halo') ||
    q.includes('hai') ||
    q === 'hi' ||
    q === 'p' ||
    q === 'mimi' ||
    q.includes('pagi') ||
    q.includes('siang') ||
    q.includes('sore') ||
    q.includes('malam')
  ) {
    return `Hai bestie ${studentName}! Kabarku on fire banget hari ini buat nemenin kamu! Kamu lagi pengen ngobrol santai dulu atau mau bahas materi ${selectedSubject} (${classLabel}) nih?`;
  }

  if (isProfesorMode || q.includes('jembatan keledai') || q.includes('trik hafal')) {
    return `Siap bestie ${studentName}! Buat nginget "${raw}" di ${selectedSubject} (${classLabel}), trik paling gampang ala Mimi itu bayangin konsep intinya kayak benda yang sering kamu temuin sehari-hari, terus ambil huruf depannya jadi singkatan unik. Bagian mana dari topik ini yang paling pengen kita bikinin jembatan keledainya?`;
  }

  return `Nah pertanyaan seru nih bestie ${studentName}! Kalau kita bahas "${raw}" (${selectedSubject} · ${classLabel} ${levelLabel}), analogi paling gampangnya itu kita lihat dulu konsep dasarnya kayak nyusun puzzle dari bagian yang paling kita kenal, baru kita hubungin ke intinya. Coba spill bagian mana yang paling bikin kamu penasaran biar Mimi jelasin lebih spesifik!`;
}

export interface ChatMimiOptions {
  prompt: string;
  history?: Array<{ sender: string; text: string }>;
  educationLevel?: string;
  selectedClass?: string;
  selectedSubject?: string;
  isProfesorMode?: boolean;
  studentName?: string;
}

export async function chatMimiWithFallback(
  prompt: string,
  history: Array<{ sender: string; text: string }> = [],
  context?: Omit<ChatMimiOptions, 'prompt' | 'history'>
): Promise<{ reply: string; xpAwarded: number; modelUsed: string }> {
  const educationLevel = context?.educationLevel || 'SD';
  const selectedClass = context?.selectedClass || 'Kelas 1';
  const selectedSubject = context?.selectedSubject || 'Matematika';
  const isProfesorMode = Boolean(context?.isProfesorMode);
  const studentName = context?.studentName || 'Bestie';

  const recentMimiTexts = Array.isArray(history)
    ? history
        .filter((m) => m.sender === 'mimi' && m.text)
        .slice(-5)
        .map((m) => m.text)
    : [];

  // 1. Check Rate Limit (allow brief buffer wait only)
  const rpmCheck = acquireGeminiRpmSlot();
  if (!rpmCheck.allowed && rpmCheck.waitMs > 0 && rpmCheck.waitMs <= 1200) {
    await new Promise((r) => setTimeout(r, rpmCheck.waitMs));
  }

  // 2. Single call to Backend API (/api/mimi/chat).
  // The server engine itself manages the multi-model failover chain:
  // gemini-3.8-flash -> gemini-3.1-flash-lite -> gemini-flash-latest.
  // We do NOT do multiple loop retries from the client to prevent request storms.
  try {
    const res = await apiFetch(
      '/api/mimi/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          model: 'gemini-3.8-flash',
          mimiModelLabel: 'gemini-3.8-flash',
          educationLevel,
          selectedClass,
          selectedSubject,
          isProfesorMode,
          studentName,
          history: history.slice(-6),
        }),
      },
      7000
    );

    const data = await safeJson<{ reply?: string; xpAwarded?: number }>(res);
    if (
      res.ok &&
      data &&
      typeof data.reply === 'string' &&
      data.reply.trim().length > 0 &&
      !data.reply.toLowerCase().includes('server mimi sedang sibuk')
    ) {
      return {
        reply: cleanHumanChatText(data.reply),
        xpAwarded: Number(data.xpAwarded) || 15,
        modelUsed: 'gemini-3.8-flash',
      };
    }
  } catch {
    // If backend proxy fails or times out, smoothly continue to direct client SDK
  }

  // 3. Direct Client Gemini SDK call if client-side VITE_GEMINI_API_KEY is provided
  try {
    const directResult = await callClientGeminiGenerateContent(
      prompt,
      history,
      studentName,
      educationLevel,
      selectedClass,
      selectedSubject,
      isProfesorMode
    );
    if (directResult) {
      return {
        reply: directResult.reply,
        xpAwarded: 15,
        modelUsed: directResult.modelUsed,
      };
    }
  } catch {
    // Continue to contextual bestie response
  }

  // 4. Instant contextual Bestie Pelajar response (never robotic, never 'server busy')
  const fallbackReply = buildClientMimiContextualReply(
    prompt,
    studentName,
    educationLevel,
    selectedClass,
    selectedSubject,
    isProfesorMode,
    recentMimiTexts
  );

  return {
    reply: fallbackReply,
    xpAwarded: 15,
    modelUsed: 'mimi-bestie-core',
  };
}

/**
 * Strict Curriculum Merdeka AI Question Generator
 * Always enforces: "Buatkan soal untuk [KATEGORI] KELAS [X] mapel [Y] level [Z] - SESUAI KURIKULUM MERDEKA KELAS TERSEBUT, jangan kasih materi di atas kelasnya"
 */
export async function generateStrictCurriculumQuestions(params: {
  kategori: 'SD' | 'SMP' | 'SMA' | 'SMK' | 'Umum';
  kelas: number | string;
  mapel: string;
  level?: string;
}): Promise<
  Array<{
    subject: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>
> {
  const strictPrompt = buildStrictCurriculumPrompt(
    params.kategori,
    params.kelas,
    params.mapel,
    params.level || 'Standar'
  );

  try {
    const res = await apiFetch(
      '/api/quiz/generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          educationLevel: params.kategori,
          selectedClass:
            params.kategori === 'Umum' ? 'Umum' : `Kelas ${params.kelas}`,
          topic: params.mapel,
          strictPrompt,
        }),
      },
      6500
    );
    const data = await safeJson<{ questions?: any[] }>(res);
    if (res.ok && data && Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions;
    }
  } catch {
    // Fallback to client-side Gemini if available
  }

  const apiKey = getClientGeminiApiKey();
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${strictPrompt}\nBuatkan 4 soal pilihan ganda dalam format JSON array.`,
        config: {
          systemInstruction:
            'Kamu Mimi bestie pelajar 17 tahun, pinter, Gen Z, jelasin cepat & gampang pakai Kurikulum Merdeka Indonesia.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ['subject', 'question', 'options', 'correctIndex', 'explanation'],
            },
          },
        },
      });
      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  return [];
}

export const SEEDED_GLOBAL_LEADERBOARD = [
  {
    uid: 'global_1',
    displayName: 'Raka Aditya Pratama',
    educationLevel: 'SMA',
    selectedClass: 'Kelas 12',
    xp: 2450,
    level: 17,
    cyberRank: 'Bintang Akademia V',
    streakDays: 21,
    completedModules: 14,
    rivalWins: 18,
    rankPosition: 1,
    isCurrentUser: false,
  },
  {
    uid: 'global_2',
    displayName: 'Nadia Putri Maharani',
    educationLevel: 'SMA',
    selectedClass: 'Kelas 11',
    xp: 2180,
    level: 15,
    cyberRank: 'Bintang Akademia V',
    streakDays: 19,
    completedModules: 12,
    rivalWins: 15,
    rankPosition: 2,
    isCurrentUser: false,
  },
  {
    uid: 'global_3',
    displayName: 'Bagas Satrio Wibowo',
    educationLevel: 'SMK',
    selectedClass: 'Kelas 11 SMK',
    xp: 1840,
    level: 13,
    cyberRank: 'Cendekiawan Muda IV',
    streakDays: 15,
    completedModules: 10,
    rivalWins: 12,
    rankPosition: 3,
    isCurrentUser: false,
  },
  {
    uid: 'global_4',
    displayName: 'Dinda Ayu Lestari',
    educationLevel: 'SMP',
    selectedClass: 'Kelas 8',
    xp: 1520,
    level: 11,
    cyberRank: 'Cendekiawan Muda IV',
    streakDays: 14,
    completedModules: 9,
    rivalWins: 9,
    rankPosition: 4,
    isCurrentUser: false,
  },
  {
    uid: 'global_5',
    displayName: 'Alya Zahra Salsabila',
    educationLevel: 'SMP',
    selectedClass: 'Kelas 9',
    xp: 1280,
    level: 9,
    cyberRank: 'Cendekiawan Muda IV',
    streakDays: 11,
    completedModules: 7,
    rivalWins: 8,
    rankPosition: 5,
    isCurrentUser: false,
  },
];

/**
 * Fetch personalized learning path recommendations from Mimi AI
 * utilizing the backend failover engine and client fallback.
 */
export async function fetchAiLearningPath(params: {
  educationLevel: string;
  selectedClass: string;
  selectedSubject: string;
  completedModulesCount: number;
  lastStudiedTopic?: string;
  studentName?: string;
  isProfesorMode?: boolean;
}): Promise<AiLearningPath> {
  const {
    educationLevel,
    selectedClass,
    selectedSubject,
    completedModulesCount,
    lastStudiedTopic = 'Materi Dasar',
    studentName = 'Bestie',
    isProfesorMode = false,
  } = params;

  try {
    const res = await apiFetch('/api/learning-path/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        educationLevel,
        selectedClass,
        selectedSubject,
        completedModulesCount,
        lastStudiedTopic,
        studentName,
        isProfesorMode,
      }),
    });

    const data = await safeJson<{ ok: boolean; learningPath: AiLearningPath }>(res);
    if (data?.ok && data.learningPath && Array.isArray(data.learningPath.steps)) {
      return data.learningPath;
    }
  } catch (err) {
    console.warn('Backend learning path suggest error, falling back:', err);
  }

  // Client-side fallback with structured steps
  return {
    title: `Roadmap Belajar ${selectedSubject} (${selectedClass} ${educationLevel})`,
    strategyTip: `Halo bestie ${studentName}! Fokus bertahap satu per satu ya. Pahami konsep intinya dulu, baru lanjut eksplorasi dan latihan soal. Mimi siap nemenin kapan pun kamu butuh clue! 🚀✨`,
    estimatedTotalMinutes: 60,
    steps: [
      {
        stepNumber: 1,
        title: `Fondasi & Konsep Dasar ${selectedSubject}`,
        description: `Pahami definisi kunci dan peta konsep utama di ${selectedClass}.`,
        keyConcept: 'Kaitkan dengan contoh sehari-hari agar langsung masuk akal.',
        estimatedMinutes: 15,
        xpReward: 35,
        difficulty: 'Mudah',
      },
      {
        stepNumber: 2,
        title: `Eksplorasi Pola & Hubungan Materi`,
        description: `Kupas cara kerja rumus atau keterkaitan antar konsep di bab ini.`,
        keyConcept: 'Gunakan analogi visual atau logika sebab-akibat.',
        estimatedMinutes: 20,
        xpReward: 45,
        difficulty: 'Menengah',
      },
      {
        stepNumber: 3,
        title: `Latihan Soal & Tantangan Praktik`,
        description: `Uji pemahaman dengan kuis adaptif atau duel soal interaktif.`,
        keyConcept: 'Active recall: ulangi penjelasannya pakai kalimat sendiri.',
        estimatedMinutes: 25,
        xpReward: 50,
        difficulty: 'Tantangan',
      },
    ],
  };
}
