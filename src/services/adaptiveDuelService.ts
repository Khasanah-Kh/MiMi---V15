/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DuelQuestion } from '../types/mimi';
import { FULL_QUESTION_BANK } from '../data/questionBankKelas';
import { AdaptiveQuestion } from '../data/questionBankInggris';

export type DuelClassKey = 'sd' | 'kelas7' | 'kelas8' | 'kelas9' | 'sma' | 'umum';
export type DuelDifficultyLevel = 'pemula' | 'menengah' | 'mahir' | 'ahli';
export type DuelSubjectFilter = 'semua' | 'mtk' | 'inggris' | 'pkn' | 'ipa' | 'ips' | 'indo' | 'umum';

export interface AdaptiveArenaConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  subjectKey: DuelSubjectFilter | 'cerdas_cermat' | 'tantang_kakak';
  questionCount: number;
  xpReward: number;
  isDoubleXp?: boolean;
  badgeText: string;
}

export const DUEL_LEVEL_BADGES: Record<
  DuelDifficultyLevel,
  { label: string; emoji: string; colorClass: string; stars: string }
> = {
  pemula: {
    label: 'Pemula',
    emoji: '🟢',
    colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    stars: '⭐ Mudah',
  },
  menengah: {
    label: 'Menengah',
    emoji: '🔵',
    colorClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    stars: '⭐⭐ Sedang',
  },
  mahir: {
    label: 'Mahir',
    emoji: '🟣',
    colorClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    stars: '⭐⭐⭐ Menantang',
  },
  ahli: {
    label: 'Ahli',
    emoji: '🟡',
    colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    stars: '⭐⭐⭐⭐ HOTS Master',
  },
};

export const DUEL_CLASS_OPTIONS: { key: DuelClassKey; label: string; shortLabel: string; nextClassLabel: string }[] = [
  { key: 'sd', label: 'SD (Kelas 1–6)', shortLabel: 'SD', nextClassLabel: 'SMP Kelas 7' },
  { key: 'kelas7', label: 'Kelas 7 SMP', shortLabel: 'Kls 7', nextClassLabel: 'Kakak Kelas 8' },
  { key: 'kelas8', label: 'Kelas 8 SMP', shortLabel: 'Kls 8', nextClassLabel: 'Kakak Kelas 9' },
  { key: 'kelas9', label: 'Kelas 9 SMP', shortLabel: 'Kls 9', nextClassLabel: 'Kakak Kelas 10 SMA' },
  { key: 'sma', label: 'SMA / SMK (Kls 10–12)', shortLabel: 'SMA/SMK', nextClassLabel: 'Level Universitas' },
  { key: 'umum', label: 'Kelas Umum (Dewasa/Alumni)', shortLabel: 'Umum', nextClassLabel: 'Master Umum Pro' },
];

export function mapUiClassToDuelClassKey(selectedClass: string, educationLevel: string): DuelClassKey {
  const lower = (selectedClass || '').toLowerCase();
  const eduLower = (educationLevel || '').toLowerCase();
  if (lower.includes('umum') || eduLower.includes('umum')) return 'umum';
  if (lower.includes('7')) return 'kelas7';
  if (lower.includes('8')) return 'kelas8';
  if (lower.includes('9')) return 'kelas9';
  if (lower.includes('10') || lower.includes('11') || lower.includes('12') || eduLower.includes('sma') || eduLower.includes('smk')) {
    return 'sma';
  }
  if (eduLower.includes('sd') || lower.includes('1') || lower.includes('2') || lower.includes('3') || lower.includes('4') || lower.includes('5') || lower.includes('6')) {
    return 'sd';
  }
  return 'kelas7';
}

/**
 * Generates the 8 Adaptive Duel Arena cards for the selected class and level
 */
export function getAdaptiveArenasForClass(
  classKey: DuelClassKey,
  level: DuelDifficultyLevel
): AdaptiveArenaConfig[] {
  const clsInfo = DUEL_CLASS_OPTIONS.find((c) => c.key === classKey) || DUEL_CLASS_OPTIONS[1];
  const short = clsInfo.shortLabel;
  const lvlInfo = DUEL_LEVEL_BADGES[level];

  if (classKey === 'umum') {
    return [
      {
        id: `arena-umum-logika-${level}`,
        title: `🔢 Logika & Numerik Umum`,
        subtitle: 'Deret Angka, Aritmetika & Penalaran Kerja',
        icon: '🔢',
        subjectKey: 'umum',
        questionCount: 10,
        xpReward: 180,
        badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
      },
      {
        id: `arena-umum-inggris-${level}`,
        title: `🇬🇧 English Daily & Work`,
        subtitle: 'Vocabulary, Grammar & Reading Comprehension',
        icon: '🇬🇧',
        subjectKey: 'inggris',
        questionCount: 10,
        xpReward: 180,
        badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
      },
      {
        id: `arena-umum-pkn-${level}`,
        title: `🏛️ Wawasan Kebangsaan & PKN`,
        subtitle: 'Pancasila, UUD 1945, Konstitusi & Etika Warga',
        icon: '🏛️',
        subjectKey: 'pkn',
        questionCount: 10,
        xpReward: 180,
        badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
      },
      {
        id: `arena-umum-ipa-${level}`,
        title: `🧬 Sains & Teknologi Umum`,
        subtitle: 'Fenomena Alam, Kesehatan & Literasi Sains',
        icon: '🧬',
        subjectKey: 'ipa',
        questionCount: 10,
        xpReward: 180,
        badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
      },
      {
        id: `arena-umum-ips-${level}`,
        title: `📜 Ekonomi & Sosial Umum`,
        subtitle: 'Literasi Finansial, Sejarah & Pengetahuan Global',
        icon: '📜',
        subjectKey: 'ips',
        questionCount: 10,
        xpReward: 180,
        badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
      },
      {
        id: `arena-umum-indo-${level}`,
        title: `📝 Bahasa & Komunikasi`,
        subtitle: 'Kalimat Efektif, EYD & Pemahaman Bacaan',
        icon: '📝',
        subjectKey: 'indo',
        questionCount: 10,
        xpReward: 180,
        badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
      },
      {
        id: `arena-umum-cerdas-cermat-${level}`,
        title: `🏆 Cerdas Cermat Umum`,
        subtitle: 'Campur 6 Bidang: Logika, Inggris, PKN, Sains, Ekonomi, Bahasa',
        icon: '🏆',
        subjectKey: 'cerdas_cermat',
        questionCount: 10,
        xpReward: 220,
        badgeText: `${lvlInfo.emoji} Campur 6 Mapel`,
      },
      {
        id: `arena-umum-tantang-master-${level}`,
        title: `⚔️ Tantang Master Umum`,
        subtitle: 'Uji Kemampuan Level Tinggi • Reward XP x2 Lipat!',
        icon: '⚔️',
        subjectKey: 'tantang_kakak',
        questionCount: 10,
        xpReward: 360,
        isDoubleXp: true,
        badgeText: `🔥 XP x2 • Naik Level`,
      },
    ];
  }

  return [
    {
      id: `arena-${classKey}-mtk-${level}`,
      title: `🔢 MTK ${short}`,
      subtitle: 'Matematika, Bilangan Bulat & Aljabar',
      icon: '🔢',
      subjectKey: 'mtk',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-inggris-${level}`,
      title: `🇬🇧 Inggris ${short}`,
      subtitle: 'Vocabulary, Grammar & Reading Text',
      icon: '🇬🇧',
      subjectKey: 'inggris',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-pkn-${level}`,
      title: `🏛️ PKN ${short}`,
      subtitle: 'Pancasila, UUD 1945 & Penerapan Norma',
      icon: '🏛️',
      subjectKey: 'pkn',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-ipa-${level}`,
      title: `🧬 IPA ${short}`,
      subtitle: 'Fisika, Biologi & Sains Terapan',
      icon: '🧬',
      subjectKey: 'ipa',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-ips-${level}`,
      title: `📜 IPS ${short}`,
      subtitle: 'Geografi, Sejarah & Ekonomi Sosial',
      icon: '📜',
      subjectKey: 'ips',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-indo-${level}`,
      title: `📝 Indo ${short}`,
      subtitle: 'Teks Bacaan, EYD & Kalimat Efektif',
      icon: '📝',
      subjectKey: 'indo',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-cerdas-cermat-${level}`,
      title: `🏆 Cerdas Cermat ${short}`,
      subtitle: 'Campur 6 Mapel: 2 MTK, 2 Inggris, 2 PKN, 2 IPA, 2 IPS/Indo',
      icon: '🏆',
      subjectKey: 'cerdas_cermat',
      questionCount: 10,
      xpReward: 200,
      badgeText: `${lvlInfo.emoji} Campur 6 Mapel`,
    },
    {
      id: `arena-${classKey}-tantang-kakak-${level}`,
      title: `⚔️ Tantang ${clsInfo.nextClassLabel}`,
      subtitle: 'Naik Level Tantangan • Reward XP x2 Lipat!',
      icon: '⚔️',
      subjectKey: 'tantang_kakak',
      questionCount: 10,
      xpReward: 320,
      isDoubleXp: true,
      badgeText: `🔥 Reward XP x2`,
    },
  ];
}

/**
 * Shuffles options array while preserving the correct answer index
 */
function toShuffledDuelQuestion(item: AdaptiveQuestion, customCategoryLabel?: string): DuelQuestion {
  const pairs = item.options.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === item.answer,
  }));

  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  const newCorrectIdx = pairs.findIndex((p) => p.isCorrect);
  const subjectNames: Record<string, string> = {
    inggris: '🇬🇧 Bahasa Inggris',
    pkn: '🏛️ PKN & Pancasila',
    mtk: '🔢 Matematika',
    ipa: '🧬 Sains IPA',
    ips: '📜 Sosial IPS',
    indo: '📝 Bahasa Indonesia',
    umum: '🌐 Wawasan & Logika Umum',
  };

  return {
    id: item.id,
    category: customCategoryLabel || `${subjectNames[item.subject] || 'Kuis'} • ${DUEL_LEVEL_BADGES[item.level].label}`,
    question: item.q,
    options: pairs.map((p) => p.text),
    correctIndex: newCorrectIdx >= 0 ? newCorrectIdx : 0,
    explanation: item.explanation || 'Perhatikan konsep inti pada soal untuk menentukan jawaban yang paling tepat.',
    timeLimitSec: 10,
  };
}

/**
 * Anti-boredom history manager: keeps up to 150 recent question IDs (15 games x 10 questions)
 * separated per class, subject, and difficulty level
 */
function getRecentHistoryIds(historyKey: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(historyKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecentHistoryIds(historyKey: string, newIds: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentHistoryIds(historyKey);
    const combined = [...newIds, ...existing].slice(0, 150); // 15 games * 10 questions
    localStorage.setItem(historyKey, JSON.stringify(combined));
  } catch {}
}

function pickFreshQuestionsFromPool(
  pool: AdaptiveQuestion[],
  count: number,
  historyKey: string
): AdaptiveQuestion[] {
  const recentIds = new Set(getRecentHistoryIds(historyKey));
  let unseen = pool.filter((q) => !recentIds.has(q.id));

  // If user has exhausted almost all unseen questions in this specific bucket, reset history gracefully
  if (unseen.length < count) {
    unseen = [...pool];
  }

  const shuffled = [...unseen].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, count);
  saveRecentHistoryIds(
    historyKey,
    picked.map((p) => p.id)
  );
  return picked;
}

/**
 * Selects 10 non-repeating adaptive questions for the chosen arena, class, and difficulty level
 */
export function getAdaptiveQuestionsForArena(
  classKey: DuelClassKey,
  level: DuelDifficultyLevel,
  arenaSubject: DuelSubjectFilter | 'cerdas_cermat' | 'tantang_kakak',
  count = 10
): DuelQuestion[] {
  const historyKey = `duel_history_${classKey}_${arenaSubject}_${level}`;

  // Case 1: Cerdas Cermat Campur (2 MTK + 2 Inggris + 2 PKN + 2 IPA + 2 IPS/Indo = 10 soal)
  if (arenaSubject === 'cerdas_cermat') {
    const subjectsOrder: ('mtk' | 'inggris' | 'pkn' | 'ipa' | 'ips' | 'indo')[] = [
      'mtk',
      'inggris',
      'pkn',
      'ipa',
      'ips',
    ];
    const mixedPicked: AdaptiveQuestion[] = [];

    subjectsOrder.forEach((subj) => {
      const subPool = FULL_QUESTION_BANK.filter(
        (q) => q.classKey === classKey && q.subject === subj && (q.level === level || q.level === 'menengah')
      );
      const fallbackPool = subPool.length >= 2 ? subPool : FULL_QUESTION_BANK.filter((q) => q.subject === subj);
      const pair = pickFreshQuestionsFromPool(fallbackPool, 2, `${historyKey}_${subj}`);
      mixedPicked.push(...pair);
    });

    return mixedPicked
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map((item) => toShuffledDuelQuestion(item));
  }

  // Case 2: Tantang Kakak Kelas / Naik Level (Higher difficulty level, XP x2)
  if (arenaSubject === 'tantang_kakak') {
    const nextLevelMap: Record<DuelDifficultyLevel, DuelDifficultyLevel> = {
      pemula: 'menengah',
      menengah: 'mahir',
      mahir: 'ahli',
      ahli: 'ahli',
    };
    const targetLevel = nextLevelMap[level];
    const pool = FULL_QUESTION_BANK.filter(
      (q) => q.classKey === classKey && (q.level === targetLevel || q.level === 'mahir' || q.level === 'ahli')
    );
    const picked = pickFreshQuestionsFromPool(
      pool.length >= count ? pool : FULL_QUESTION_BANK,
      count,
      historyKey
    );
    return picked.map((item) => toShuffledDuelQuestion(item, `⚔️ Tantangan Naik Level • ${DUEL_LEVEL_BADGES[targetLevel].label}`));
  }

  // Case 3: Specific Subject Arena (MTK, Inggris, PKN, IPA, IPS, Indo, Umum)
  const targetSubject = arenaSubject === 'semua' ? 'inggris' : arenaSubject;
  let pool = FULL_QUESTION_BANK.filter(
    (q) => q.classKey === classKey && q.subject === targetSubject && q.level === level
  );

  // Expand to adjacent levels if specific level has fewer than count
  if (pool.length < count) {
    const broaderPool = FULL_QUESTION_BANK.filter(
      (q) => q.classKey === classKey && q.subject === targetSubject
    );
    pool = [...pool, ...broaderPool.filter((b) => !pool.some((p) => p.id === b.id))];
  }

  const picked = pickFreshQuestionsFromPool(pool, count, historyKey);
  return picked.map((item) => toShuffledDuelQuestion(item));
}
