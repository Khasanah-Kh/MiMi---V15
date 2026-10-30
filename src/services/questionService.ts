/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ANTI-ULANG 100 MATCH (1000 SOAL UNIK) SERVICE — MIMI V15
 * Match 1 sampai 100 = 100 x 10 soal = 1000 soal WAJIB BEDA SEMUA!
 * Baru di Match 101 boleh ngulang dari Match 1 lagi + dapat Badge 🏆 LEGEND 100 MATCH.
 */

import {
  Bank1000Question,
  buildDeterministic1000Questions,
  seed1000Questions,
} from '../data/questionBank';

export const KEY_ASKED = 'mimi_100_match_asked';
export const KEY_LEGEND_BADGE = 'mimi_legend_100_match_badge';
export const KEY_RESET_NOTICE = 'mimi_100_match_reset_notice';
export const MAX_UNIQUE = 1000; // 100 match x 10 soal = 1000 soal unik

export interface Match100ProgressInfo {
  askedIds: string[];
  askedCount: number;
  matchKe: number;
  remainingUnique: number;
  isLegend100Unlocked: boolean;
  legendCycleCount: number;
  resetNoticeMessage: string | null;
}

export function get100AskedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY_ASKED) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLegend100CycleCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return Math.max(0, parseInt(localStorage.getItem(KEY_LEGEND_BADGE) || '0', 10) || 0);
  } catch {
    return 0;
  }
}

export function consume100MatchResetNotice(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const msg = localStorage.getItem(KEY_RESET_NOTICE);
    if (msg) {
      localStorage.removeItem(KEY_RESET_NOTICE);
      return msg;
    }
    return null;
  } catch {
    return null;
  }
}

export function save100AskedIds(id: string): {
  resetTriggered: boolean;
  askedCount: number;
  legendUnlocked: boolean;
} {
  if (typeof window === 'undefined') {
    return { resetTriggered: false, askedCount: 0, legendUnlocked: false };
  }
  let asked = get100AskedIds();
  if (!asked.includes(id)) {
    asked.push(id);
  }
  let resetTriggered = false;

  // JANGAN hapus sampai 1000, baru hapus kalau sudah melebihi 1000 (Match 101)
  if (asked.length > MAX_UNIQUE) {
    // Sudah 100 match (1000 soal unik), reset - boleh ulang dari awal di Match 101
    asked = [id]; // mulai lagi dari awal untuk Match 101
    resetTriggered = true;
    const prevCycles = getLegend100CycleCount();
    try {
      localStorage.setItem(KEY_LEGEND_BADGE, String(prevCycles + 1));
      localStorage.setItem(
        KEY_RESET_NOTICE,
        '🎉 Selamat! Kamu sudah selesaikan 100 Match (1000 soal unik) dan meraih badge 🏆 LEGEND 100 MATCH! Soal akan di-refresh dari awal lagi!'
      );
    } catch {}
  }

  try {
    localStorage.setItem(KEY_ASKED, JSON.stringify(asked));
  } catch {}

  return {
    resetTriggered,
    askedCount: asked.length,
    legendUnlocked: getLegend100CycleCount() > 0,
  };
}

export function save100AskedIdsBatch(ids: string[]): {
  resetTriggered: boolean;
  askedCount: number;
  legendUnlocked: boolean;
} {
  let lastResult = {
    resetTriggered: false,
    askedCount: get100AskedIds().length,
    legendUnlocked: getLegend100CycleCount() > 0,
  };
  for (const id of ids) {
    const res = save100AskedIds(id);
    if (res.resetTriggered) {
      lastResult = { ...res, resetTriggered: true };
    } else {
      lastResult = { ...res, resetTriggered: lastResult.resetTriggered };
    }
  }
  return lastResult;
}

export function getMatch100ProgressInfo(): Match100ProgressInfo {
  const asked = get100AskedIds();
  const askedCount = Math.min(MAX_UNIQUE, asked.length);
  // Match 1: 0..10 soal, Match 2: 11..20 soal, dst sampai Match 100
  const matchKe =
    askedCount === 0
      ? 1
      : Math.min(100, Math.floor((askedCount - 1) / 10) + 1);
  const legendCycles = getLegend100CycleCount();

  return {
    askedIds: asked,
    askedCount,
    matchKe,
    remainingUnique: Math.max(0, MAX_UNIQUE - askedCount),
    isLegend100Unlocked: legendCycles > 0 || askedCount >= MAX_UNIQUE,
    legendCycleCount: legendCycles,
    resetNoticeMessage: null,
  };
}

/**
 * Buat atau ambil 1 soal baru Duel Arena yang 100% unik (belum pernah keluar di 100 Match).
 */
export async function getUniqueQuestion(
  kategori: string,
  level: string
): Promise<{
  id: string;
  q: string;
  options: string[];
  answer: number;
  explanation?: string;
}> {
  const askedIds = get100AskedIds();
  const remaining = MAX_UNIQUE - askedIds.length;

  const prompt = `
    BUAT 1 SOAL BARU DUEL ARENA - WAJIB UNIK!
    Kategori: ${kategori} Level: ${level}
    SOAL YANG SUDAH KELUAR (JANGAN PERNAH BUAT LAGI): ${askedIds.slice(-100).join(', ')}
    Sisa kuota soal unik sebelum reset: ${remaining}/1000
    
    ATURAN KERAS:
    - Jangan ulangi topik LIGO, James Webb, atau soal lama!
    - Buat dari topik berbeda: AI, IKN, Sains, Sejarah, Logika, Ekonomi, Inggris.
    - ID soal harus unik: q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}
    
    Format JSON: {"id": "...", "q": "...", "options": ["A","B","C","D"], "answer": 0, "explanation": "..."}
  `;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2200);
    const res = await fetch('/api/duel/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classKey: kategori.toLowerCase(),
        level: level.toLowerCase(),
        arenaSubject: 'umum',
        historyQuestionIds: askedIds.slice(-100),
        customPrompt: prompt,
        count: 1,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.questions) && data.questions.length > 0) {
        const first = data.questions[0];
        const uniqueId =
          first.id && !askedIds.includes(first.id)
            ? String(first.id)
            : `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        save100AskedIds(uniqueId);
        return {
          id: uniqueId,
          q: String(first.q),
          options: Array.isArray(first.options) ? first.options.slice(0, 4) : ['A', 'B', 'C', 'D'],
          answer: Number(first.answer) || 0,
          explanation: String(first.explanation || ''),
        };
      }
    }
  } catch {
    // Fallback ke bank 1000 soal unik lokal/IndexedDB
  }

  const bank = await seed1000Questions();
  const askedSet = new Set(askedIds);
  const unseen = bank.filter((item) => !askedSet.has(item.id));
  const picked =
    unseen.length > 0
      ? unseen[Math.floor(Math.random() * unseen.length)]
      : bank[Math.floor(Math.random() * bank.length)];

  const finalId =
    picked && !askedSet.has(picked.id)
      ? picked.id
      : `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  save100AskedIds(finalId);
  return {
    id: finalId,
    q: picked.q,
    options: [...picked.options],
    answer: picked.answer,
    explanation: picked.explanation,
  };
}

/**
 * Mengambil N (default 10) soal unik dari Bank 1000 Soal yang BELUM PERNAH keluar
 * dalam `mimi_100_match_asked`, sesuai kategori, kelas, mapel, dan level.
 * Otomatis menyimpan ke-10 ID soal tersebut ke `mimi_100_match_asked`.
 */
export function pick100MatchUniqueQuestions(
  candidates: Bank1000Question[],
  count = 10
): Bank1000Question[] {
  const askedIds = get100AskedIds();
  const askedSet = new Set(askedIds);
  const fullBank = buildDeterministic1000Questions();

  // 1. Filter kandidat yang belum pernah ditanyakan di 100 match ini
  let unseen = candidates.filter((q) => !askedSet.has(q.id));

  // 2. Jika kandidat spesifik kelas/mapel kurang dari count, ambil tambahan dari Bank 1000 Soal yang belum pernah keluar
  if (unseen.length < count) {
    const extraUnseen = fullBank.filter(
      (q) => !askedSet.has(q.id) && !unseen.some((u) => u.id === q.id)
    );
    unseen = [...unseen, ...extraUnseen];
  }

  // 3. Acak urutan soal yang belum pernah keluar
  const shuffled = [...unseen].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  // 4. Simpan ID soal ke mimi_100_match_asked (tidak akan dihapus sampai > 1000 soal / Match 101)
  save100AskedIdsBatch(selected.map((q) => q.id));

  return selected;
}
