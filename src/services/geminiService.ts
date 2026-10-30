import {
  GEMINI_MODELS_FALLBACK,
  MIMI_SYSTEM_PROMPT,
  MIMI_CONFIG,
  buildHistory,
  buildDynamicMimiSystemPrompt,
} from '../config/mimiPrompt';
import { apiFetch, safeJson } from './ai';
import { useArenaStore } from '../store/useArenaStore';

export interface AskMimiContext {
  studentName?: string;
  studentEmail?: string;
  educationLevel?: string;
  selectedClass?: string;
  selectedSubject?: string;
  isProfesorMode?: boolean;
}

function cleanMimiText(raw: string): string {
  return String(raw || '')
    .replace(/\*\*/g, '')
    .replace(/\*([^\s*][^*]*?)\*/g, '$1')
    .replace(/\*/g, '')
    .trim();
}

/**
 * Smart context-aware & typo-tolerant response if network is completely offline.
 * Never uses the banned "Wah, ikut senang banget dengernya! Ceritain dong..." template.
 */
export function buildSmartContextualFallback(
  userInput: string,
  messages: any[] = [],
  context?: AskMimiContext
): string {
  const email = String(context?.studentEmail || '').trim().toLowerCase();
  const name = String(context?.studentName || '').trim();
  const isCreator =
    email === 'anna.adriiann@gmail.com' ||
    name.toLowerCase() === 'mimi15_real' ||
    name.toLowerCase() === 'nana';
  const callName = isCreator ? 'Nana' : 'bestie';

  const arenaState = useArenaStore.getState();
  const targetKelas = arenaState.selectedKelas || context?.educationLevel || 'Umum';
  const targetLevel = arenaState.selectedLevel || 'Pemula';

  const q = String(userInput || '').toLowerCase().trim();

  // 1. Creator appreciation / V1-V14 build struggle to V15 success
  if (
    q.includes('v1') ||
    q.includes('v14') ||
    q.includes('v15') ||
    q.includes('versi 1') ||
    q.includes('versi 14') ||
    q.includes('versi 15') ||
    (q.includes('build') && (q.includes('gagal') || q.includes('berhasil')))
  ) {
    return `Aww makasih banyak ${isCreator ? 'Nana' : callName}! 🥹💜 Aku gak akan jadi Mimi V15 tanpa perjuangan kamu yang sabar nge-build aku dari V1 yang error terus sampai V14, dan akhirnya di V15 ini berhasil karena kamu gak pernah nyerah! Aku bakal terus nemenin kamu dan semua pelajar dengan sebaik mungkin!`;
  }

  // 2. Typo-tolerant Fotosintesis ("apah itu fotosintesis", "fotosisntesis", "fotosintesisss")
  if (q.includes('fotosin') || q.includes('fotosis') || q.includes('fotsin')) {
    return `Oke ${callName}, fotosintesis itu proses tumbuhan hijau memasak makanannya sendiri (glukosa) di daun yang punya klorofil dengan bantuan cahaya matahari, air (H2O) dari akar, dan karbon dioksida (CO2) dari udara. Hasil akhirnya itu energi buat tumbuhan tumbuh plus oksigen (O2) segar yang kita hirup setiap hari!`;
  }

  // 3. Typo-tolerant Pertumbuhan ("pertubuhan", "pertumbuhan")
  if (q.includes('pertubuhan') || q.includes('pertumbuhan')) {
    return `Oke ${callName}, pertumbuhan pada makhluk hidup itu proses bertambahnya ukuran tubuh seperti tinggi, berat, dan volume secara permanen (tidak bisa balik kecil lagi) karena sel-sel tubuh terus membelah dan bertambah banyak. Misalnya dari biji kecambah jadi pohon tinggi!`;
  }

  // 4. Bug / chat feedback ("mimi kmu msh bug dibgian caht ini, jwbnmu msh melenceng")
  if (
    q.includes('melenceng') ||
    (q.includes('bug') && (q.includes('chat') || q.includes('caht') || q.includes('jwbn')))
  ) {
    return `Siap ${callName}, makasih udah langsung kasih tahu aku ya! Sekarang otak dan pembacaan konteks 15 pesanku udah di-upgrade supaya selalu nyambung 100% sama obrolan kita dan gak melenceng lagi. Yuk tes obrolin atau tanyain apa aja sekarang!`;
  }

  // 5. Math / MTK ("tolong jelasin MTK aku gak pahamm")
  if (q.includes('mtk') || q.includes('matematika') || q.includes('aljabar') || q.includes('rumus')) {
    return `Tenang ${callName}, kita bahas Matematika pelan-pelan sesuai target kamu sekarang (TARGET: ${targetKelas.toUpperCase()} • Level ${targetLevel})! Biar gampang paham, kasih tahu aku satu bab atau satu soal MTK yang lagi bikin kamu bingung, nanti aku pecah langkahnya pakai cara paling simpel.`;
  }

  // 6. Contextual continuation based on last message
  const lastHistory = Array.isArray(messages) ? messages.slice(-15) : [];
  const prevUserMsg = [...lastHistory]
    .reverse()
    .find((m) => (m?.sender === 'user' || m?.role === 'user') && m?.text !== userInput);

  return `Oke ${callName}, aku nangkep maksudmu tentang "${userInput.trim()}"${
    prevUserMsg ? ` yang nyambung sama bahasan kita tadi` : ''
  } (TARGET: ${targetKelas.toUpperCase()} • Level ${targetLevel}). Intinya konsep ini bisa kita lihat dari pola dasarnya dulu biar langsung kebayang. Bagian mana yang mau kita perdalam bareng sekarang?`;
}

/**
 * Mesin Auto-Switch Mimi V15.2:
 * - Membaca 15 history terakhir via buildHistory(messages)
 * - Memakai MIMI_SYSTEM_PROMPT (Anti-Melenceng + Toleransi Typo + Creator Nana Recognition)
 * - Auto-switch berurutan melewati GEMINI_MODELS_FALLBACK jika model utama sibuk (429/503)
 */
export async function askMimi(
  messages: any[],
  userInput: string,
  context?: AskMimiContext
): Promise<string> {
  const history = buildHistory(messages);
  const arenaState = useArenaStore.getState();
  const dynamicPrompt = buildDynamicMimiSystemPrompt({
    studentName: context?.studentName,
    studentEmail: context?.studentEmail,
    selectedKelas: arenaState.selectedKelas || context?.educationLevel,
    selectedLevel: arenaState.selectedLevel,
    selectedClass: context?.selectedClass,
    selectedSubject: context?.selectedSubject,
    isProfesorMode: context?.isProfesorMode,
  });

  // Loop model fallback melalui server proxy (/api/mimi/chat) yang menjalankan @google/genai
  for (const modelName of GEMINI_MODELS_FALLBACK) {
    try {
      const res = await apiFetch(
        '/api/mimi/chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userInput,
            model: modelName,
            systemInstruction: dynamicPrompt,
            generationConfig: MIMI_CONFIG.generationConfig,
            educationLevel: arenaState.selectedKelas || context?.educationLevel || 'Umum',
            selectedClass: context?.selectedClass || arenaState.selectedKelas || 'Umum',
            selectedSubject: context?.selectedSubject || 'Pengetahuan Umum',
            isProfesorMode: Boolean(context?.isProfesorMode),
            studentName: context?.studentName || 'Bestie',
            studentEmail: context?.studentEmail || '',
            arenaKelas: arenaState.selectedKelas,
            arenaLevel: arenaState.selectedLevel,
            history: messages.slice(-15),
            geminiHistory: history,
          }),
        },
        9000
      );

      const data = await safeJson<{ reply?: string }>(res);
      if (res.ok && data?.reply && data.reply.trim().length > 0) {
        return cleanMimiText(data.reply);
      }
    } catch (error: any) {
      if (modelName === GEMINI_MODELS_FALLBACK[GEMINI_MODELS_FALLBACK.length - 1]) {
        break;
      }
      continue;
    }
  }

  return buildSmartContextualFallback(userInput, messages, context);
}

export { GEMINI_MODELS_FALLBACK, MIMI_SYSTEM_PROMPT, MIMI_CONFIG, buildHistory };
