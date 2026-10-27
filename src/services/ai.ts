export const MIMI_FALLBACK_MODELS = [
  'mimi-3.6-flash',
  'mimi-3.5-flash',
  'mimi-3.8-flash',
  'mimi-3.1-flash',
  // Backup model Google Gemini Flash
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
] as const;

const MODEL_ALIAS_MAP: Record<string, string> = {
  'mimi-3.6-flash': 'gemini-3.8-flash',
  'mimi-3.5-flash': 'gemini-flash-latest',
  'mimi-3.8-flash': 'gemini-3.8-flash',
  'mimi-3.1-flash': 'gemini-3.1-flash-lite',
  'gemini-3.8-flash': 'gemini-3.8-flash',
  'gemini-flash-latest': 'gemini-flash-latest',
  'gemini-3.1-flash-lite': 'gemini-3.1-flash-lite',
};

export function resolveGeminiModelName(modelName: string): string {
  return MODEL_ALIAS_MAP[modelName] || 'gemini-3.8-flash';
}

export const CLOUD_BACKEND_URLS = [
  'https://ais-pre-uujm7563cz27mgl63kqjrj-141953450050.asia-southeast1.run.app',
  'https://ais-dev-uujm7563cz27mgl63kqjrj-141953450050.asia-southeast1.run.app',
];

/**
 * Smart API Fetcher for both Full-Stack Cloud Run and Static Hosting
 * (https://gen-lang-client-0798249381.web.app, https://gen-lang-client-0798249381.firebaseapp.com, GitHub Pages).
 * Automatically falls back to the Cloud Run backend if local `/api/*` returns HTML due to SPA rewrites.
 */
export async function apiFetch(
  apiPath: string,
  init?: RequestInit,
  timeoutMs: number = 6000
): Promise<Response> {
  const normalizedPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  const candidateUrls = [
    normalizedPath,
    ...CLOUD_BACKEND_URLS.map((base) => `${base}${normalizedPath}`),
  ];

  let lastResponse: Response | null = null;
  let lastError: unknown = null;

  for (const url of candidateUrls) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...init,
        signal: init?.signal || controller.signal,
      });
      clearTimeout(timer);
      lastResponse = res;

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return res;
      }
      // If static hosting returned text/html for an /api/* route, continue to Cloud Run backend URL
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
    }
  }

  if (lastResponse) {
    return lastResponse;
  }
  throw lastError || new Error(`Failed to fetch ${apiPath}`);
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
  let lastError: any = null;

  for (let i = 0; i < MIMI_FALLBACK_MODELS.length; i++) {
    const modelName = MIMI_FALLBACK_MODELS[i];
    const resolvedModel = resolveGeminiModelName(modelName);

    try {
      console.log(`Coba Mimi model: ${modelName} (${resolvedModel})`);

      const res = await apiFetch(
        '/api/mimi/chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: prompt,
            model: resolvedModel,
            mimiModelLabel: modelName,
            educationLevel: context?.educationLevel || 'SMP',
            selectedClass: context?.selectedClass || 'Kelas 8',
            selectedSubject: context?.selectedSubject || 'Matematika',
            isProfesorMode: Boolean(context?.isProfesorMode),
            studentName: context?.studentName || 'Bestie',
            history: history.slice(-8),
          }),
        },
        6000
      );

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw Object.assign(new Error('Non-JSON response from static host'), {
          status: 503,
        });
      }

      if (res.status === 429 || res.status === 500 || res.status === 503) {
        throw Object.assign(new Error(`HTTP ${res.status} busy`), {
          status: res.status,
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (
          data &&
          typeof data.reply === 'string' &&
          data.reply.trim().length > 0 &&
          !data.reply.toLowerCase().includes('server mimi sedang sibuk')
        ) {
          return {
            reply: data.reply.trim(),
            xpAwarded: Number(data.xpAwarded) || 15,
            modelUsed: modelName,
          };
        }
      }

      throw Object.assign(new Error('Model busy or unreachable'), {
        status: 503,
      });
    } catch (error: any) {
      lastError = error;
      const errMsg = String(error?.message || '').toLowerCase();
      const isBusy =
        error?.status === 429 ||
        error?.status === 503 ||
        error?.status === 500 ||
        errMsg.includes('overloaded') ||
        errMsg.includes('busy') ||
        errMsg.includes('sibuk') ||
        errMsg.includes('quota') ||
        errMsg.includes('timeout') ||
        errMsg.includes('abort') ||
        errMsg.includes('non-json');

      if (isBusy && i < MIMI_FALLBACK_MODELS.length - 1) {
        console.log(
          `${modelName} sibuk, switch ke ${MIMI_FALLBACK_MODELS[i + 1]}`
        );
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('Semua model sedang penuh');
}
