/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DuelQuestion } from '../types/mimi';
import { FULL_QUESTION_BANK } from '../data/questionBankKelas';
import { AdaptiveQuestion } from '../data/questionBankInggris';
import curriculumLevelMap from '../data/curriculumLevel.json';

export type DuelClassKey =
  | 'sd1'
  | 'sd2'
  | 'sd3'
  | 'sd4'
  | 'sd5'
  | 'sd6'
  | 'sd'
  | 'kelas7'
  | 'kelas8'
  | 'kelas9'
  | 'sma10'
  | 'sma11'
  | 'sma12'
  | 'smk10'
  | 'smk11'
  | 'smk12'
  | 'sma'
  | 'umum';

export type DuelDifficultyLevel = 'pemula' | 'menengah' | 'mahir' | 'ahli';

export type DuelSubjectFilter =
  | 'semua'
  | 'mtk'
  | 'inggris'
  | 'pkn'
  | 'ipa'
  | 'ips'
  | 'indo'
  | 'umum'
  | 'cerdas_cermat'
  | 'tantang_kakak';

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

export type DuelKategori = 'SD' | 'SMP' | 'SMA' | 'SMK' | 'Umum';
export type DuelKelas = number | 'Umum';

export const DUEL_KATEGORI_LIST: DuelKategori[] = ['SD', 'SMP', 'SMA', 'SMK', 'Umum'];

export function getKelasChipsByKategori(selectedKategori: DuelKategori): number[] {
  if (selectedKategori === 'SD') return [1, 2, 3, 4, 5, 6];
  if (selectedKategori === 'SMP') return [7, 8, 9];
  if (selectedKategori === 'SMA') return [10, 11, 12];
  if (selectedKategori === 'SMK') return [10, 11, 12];
  return [];
}

export function getDefaultKelasForKategori(kategori: DuelKategori): DuelKelas {
  if (kategori === 'SD') return 1;
  if (kategori === 'SMP') return 7;
  if (kategori === 'SMA') return 10;
  if (kategori === 'SMK') return 10;
  return 'Umum';
}

export function getDuelTargetText(
  selectedKategori: DuelKategori,
  selectedKelas: DuelKelas
): string {
  if (selectedKategori === 'Umum' || selectedKelas === 'Umum') {
    return 'TARGET: UMUM';
  }
  return `TARGET: ${selectedKategori} KELAS ${selectedKelas}`;
}

export function mapKategoriKelasToDuelClassKey(
  selectedKategori: DuelKategori,
  selectedKelas: DuelKelas
): DuelClassKey {
  if (selectedKategori === 'Umum' || selectedKelas === 'Umum') return 'umum';
  if (selectedKategori === 'SD') {
    if (selectedKelas === 1) return 'sd1';
    if (selectedKelas === 2) return 'sd2';
    if (selectedKelas === 3) return 'sd3';
    if (selectedKelas === 4) return 'sd4';
    if (selectedKelas === 5) return 'sd5';
    return 'sd6';
  }
  if (selectedKategori === 'SMP') {
    if (selectedKelas === 7) return 'kelas7';
    if (selectedKelas === 8) return 'kelas8';
    return 'kelas9';
  }
  if (selectedKategori === 'SMA') {
    if (selectedKelas === 10) return 'sma10';
    if (selectedKelas === 11) return 'sma11';
    return 'sma12';
  }
  if (selectedKategori === 'SMK') {
    if (selectedKelas === 10) return 'smk10';
    if (selectedKelas === 11) return 'smk11';
    return 'smk12';
  }
  return 'sd1';
}

/**
 * Builds the strict Kurikulum Merdeka prompt instruction using curriculumLevel.json
 */
export function buildStrictCurriculumPrompt(
  kategori: string,
  kelas: string | number,
  mapel: string,
  level: string = 'Menengah'
): string {
  const katUpper = String(kategori || 'SD').toUpperCase();
  const rawKelasNum = String(kelas || '1').replace(/[^0-9]/g, '') || 'Umum';
  const katKey = katUpper.includes('UMUM') ? 'Umum' : katUpper;
  const kelasKey = katKey === 'Umum' ? 'Umum' : rawKelasNum;

  const baseHeader = `Buatkan soal untuk ${katKey} KELAS ${kelasKey} mapel ${mapel} level ${level} - SESUAI KURIKULUM MERDEKA KELAS TERSEBUT, jangan kasih materi di atas kelasnya.`;

  const katObj = (curriculumLevelMap as any)[katKey];
  const kelasObj = katObj?.[kelasKey];
  if (!kelasObj) {
    return baseHeader;
  }

  const mLower = mapel.toLowerCase();
  let subjKey = 'mtk';
  if (mLower.includes('inggris') || mLower.includes('english')) subjKey = 'inggris';
  else if (mLower.includes('indo')) subjKey = 'indo';
  else if (mLower.includes('ipa') || mLower.includes('fisika') || mLower.includes('biologi') || mLower.includes('kimia') || mLower.includes('sains')) subjKey = 'ipa';
  else if (mLower.includes('ips') || mLower.includes('sejarah') || mLower.includes('ekonomi') || mLower.includes('geografi')) subjKey = 'ips';
  else if (mLower.includes('pkn') || mLower.includes('ppkn') || mLower.includes('pancasila')) subjKey = 'pkn';

  const rules = kelasObj[subjKey] || kelasObj.mtk;
  const allowed = Array.isArray(rules?.allowedTopics) ? rules.allowedTopics.join('; ') : '';
  const forbidden = Array.isArray(rules?.forbiddenTopics) ? rules.forbiddenTopics.join('; ') : '';

  return `${baseHeader}\nATURAN KETAT MATERI YANG BOLEH: ${allowed || 'Sesuai kelas tersebut'}.\nLARANGAN KERAS (JANGAN PERNAH MUNCUL): ${forbidden || 'Jangan berikan materi kelas di atasnya atau di bawahnya'}.`;
}

export function getDynamicDuelMeta(
  selectedKategori: DuelKategori,
  selectedKelas: DuelKelas
): {
  key: DuelClassKey;
  label: string;
  shortLabel: string;
  nextClassLabel: string;
  targetText: string;
} {
  const key = mapKategoriKelasToDuelClassKey(selectedKategori, selectedKelas);
  const targetText = getDuelTargetText(selectedKategori, selectedKelas);

  if (selectedKategori === 'Umum' || selectedKelas === 'Umum') {
    return {
      key: 'umum',
      label: 'Umum (Random Pengetahuan Umum HAGO)',
      shortLabel: 'Umum HAGO',
      nextClassLabel: 'Master Umum HAGO',
      targetText,
    };
  }

  const numKelas = typeof selectedKelas === 'number' ? selectedKelas : 1;
  let nextClassLabel = `Kakak Kelas ${numKelas + 1}`;
  if (selectedKategori === 'SD' && numKelas === 6) {
    nextClassLabel = 'SMP Kelas 7';
  } else if (selectedKategori === 'SMP' && numKelas === 9) {
    nextClassLabel = 'SMA Kelas 10';
  } else if ((selectedKategori === 'SMA' || selectedKategori === 'SMK') && numKelas === 12) {
    nextClassLabel = 'Level Universitas';
  } else {
    nextClassLabel = `${selectedKategori} Kelas ${numKelas + 1}`;
  }

  return {
    key,
    label: `${selectedKategori} Kelas ${numKelas}`,
    shortLabel: `${selectedKategori} Kls ${numKelas}`,
    nextClassLabel,
    targetText,
  };
}

export const DUEL_CLASS_OPTIONS: { key: DuelClassKey; label: string; shortLabel: string; nextClassLabel: string }[] = [
  { key: 'sd1', label: 'SD Kelas 1', shortLabel: 'SD Kls 1', nextClassLabel: 'SD Kelas 2' },
  { key: 'sd2', label: 'SD Kelas 2', shortLabel: 'SD Kls 2', nextClassLabel: 'SD Kelas 3' },
  { key: 'sd3', label: 'SD Kelas 3', shortLabel: 'SD Kls 3', nextClassLabel: 'SD Kelas 4' },
  { key: 'sd4', label: 'SD Kelas 4', shortLabel: 'SD Kls 4', nextClassLabel: 'SD Kelas 5' },
  { key: 'sd5', label: 'SD Kelas 5', shortLabel: 'SD Kls 5', nextClassLabel: 'SD Kelas 6' },
  { key: 'sd6', label: 'SD Kelas 6', shortLabel: 'SD Kls 6', nextClassLabel: 'SMP Kelas 7' },
  { key: 'sd', label: 'SD (Kelas 1–6)', shortLabel: 'SD', nextClassLabel: 'SMP Kelas 7' },
  { key: 'kelas7', label: 'Kelas 7 SMP', shortLabel: 'Kls 7', nextClassLabel: 'Kakak Kelas 8' },
  { key: 'kelas8', label: 'Kelas 8 SMP', shortLabel: 'Kls 8', nextClassLabel: 'Kakak Kelas 9' },
  { key: 'kelas9', label: 'Kelas 9 SMP', shortLabel: 'Kls 9', nextClassLabel: 'Kakak Kelas 10 SMA' },
  { key: 'sma10', label: 'SMA Kelas 10', shortLabel: 'SMA Kls 10', nextClassLabel: 'SMA Kelas 11' },
  { key: 'sma11', label: 'SMA Kelas 11', shortLabel: 'SMA Kls 11', nextClassLabel: 'SMA Kelas 12' },
  { key: 'sma12', label: 'SMA Kelas 12', shortLabel: 'SMA Kls 12', nextClassLabel: 'Level Universitas' },
  { key: 'smk10', label: 'SMK Kelas 10', shortLabel: 'SMK Kls 10', nextClassLabel: 'SMK Kelas 11' },
  { key: 'smk11', label: 'SMK Kelas 11', shortLabel: 'SMK Kls 11', nextClassLabel: 'SMK Kelas 12' },
  { key: 'smk12', label: 'SMK Kelas 12', shortLabel: 'SMK Kls 12', nextClassLabel: 'Level Universitas' },
  { key: 'sma', label: 'SMA / SMK (Kls 10–12)', shortLabel: 'SMA/SMK', nextClassLabel: 'Level Universitas' },
  { key: 'umum', label: 'Kelas Umum (Dewasa/Alumni)', shortLabel: 'Umum', nextClassLabel: 'Master Umum Pro' },
];

export function mapUiClassToDuelClassKey(selectedClass: string, educationLevel: string): DuelClassKey {
  const lower = (selectedClass || '').toLowerCase();
  const eduLower = (educationLevel || '').toLowerCase();
  if (lower.includes('umum') || eduLower.includes('umum')) return 'umum';
  if (lower.includes('10')) return eduLower.includes('smk') ? 'smk10' : 'sma10';
  if (lower.includes('11')) return eduLower.includes('smk') ? 'smk11' : 'sma11';
  if (lower.includes('12')) return eduLower.includes('smk') ? 'smk12' : 'sma12';
  if (lower.includes('7')) return 'kelas7';
  if (lower.includes('8')) return 'kelas8';
  if (lower.includes('9')) return 'kelas9';
  if (lower.includes('1')) return 'sd1';
  if (lower.includes('2')) return 'sd2';
  if (lower.includes('3')) return 'sd3';
  if (lower.includes('4')) return 'sd4';
  if (lower.includes('5')) return 'sd5';
  if (lower.includes('6')) return 'sd6';
  if (eduLower.includes('sma') || eduLower.includes('smk')) return 'sma10';
  return 'sd1';
}

/**
 * Generates the 8 Adaptive Duel Arena cards for the selected class and level
 */
export function getAdaptiveArenasForClass(
  classKey: DuelClassKey,
  level: DuelDifficultyLevel,
  customShortLabel?: string,
  customNextClassLabel?: string
): AdaptiveArenaConfig[] {
  const clsInfo = DUEL_CLASS_OPTIONS.find((c) => c.key === classKey) || DUEL_CLASS_OPTIONS[0];
  const short = customShortLabel || clsInfo.shortLabel;
  const nextLabel = customNextClassLabel || clsInfo.nextClassLabel;
  const lvlInfo = DUEL_LEVEL_BADGES[level];

  if (classKey === 'umum') {
    return [
      {
        id: `arena-umum-pengetahuan-umum-${level}`,
        title: `🎲 Pengetahuan Umum (HAGO & Millionaire)`,
        subtitle: 'Cerdas Cermat Pengetahuan Umum: Sains, Sejarah Nusantara, Dunia & Logika',
        icon: '🎲',
        subjectKey: 'umum',
        questionCount: 10,
        xpReward: 200,
        badgeText: `🔥 Kategori 1 • ${lvlInfo.label}`,
      },
      {
        id: `arena-umum-bahasa-inggris-${level}`,
        title: `🇬🇧 Bahasa Inggris Umum (HAGO & Millionaire)`,
        subtitle: 'Cerdas Cermat Bahasa Inggris: Idioms, Phrasal Verbs, Vocab & Daily English',
        icon: '🇬🇧',
        subjectKey: 'inggris',
        questionCount: 10,
        xpReward: 200,
        badgeText: `🔥 Kategori 2 • ${lvlInfo.label}`,
      },
    ];
  }

  return [
    {
      id: `arena-${classKey}-${short}-mtk-${level}`,
      title: `🔢 MTK ${short}`,
      subtitle:
        classKey === 'sd1'
          ? 'Penjumlahan & Pengurangan 1–20, Mengenal Angka (Tanpa Aljabar)'
          : classKey === 'sd2'
          ? 'Penjumlahan 1–100 & Perkalian Dasar 1–5'
          : classKey === 'sd3'
          ? 'Perkalian, Pembagian Dasar & Pecahan Sederhana'
          : classKey.startsWith('sd')
          ? 'Pecahan Campuran, Desimal, FPB & KPK'
          : classKey.startsWith('kelas')
          ? 'Aljabar, PLSV & Teorema Pythagoras'
          : 'Logaritma, Trigonometri & Kalkulus Dasar',
      icon: '🔢',
      subjectKey: 'mtk',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-${short}-inggris-${level}`,
      title: `🇬🇧 Inggris ${short}`,
      subtitle:
        classKey === 'kelas8'
          ? 'Past Continuous, Comparative Degree, Simple Past & Present Perfect'
          : classKey === 'sd4' || classKey === 'sd5' || classKey === 'sd6'
          ? 'This is / That is, Vocab Hewan & Benda Sekitar'
          : 'Vocabulary, Grammar & Reading Text Sesuai Kelas',
      icon: '🇬🇧',
      subjectKey: 'inggris',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-${short}-pkn-${level}`,
      title: `🏛️ PKN ${short}`,
      subtitle: 'Pancasila, UUD 1945 & Penerapan Norma',
      icon: '🏛️',
      subjectKey: 'pkn',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-${short}-ipa-${level}`,
      title: `🧬 IPA ${short}`,
      subtitle: 'Sains Alam, Fisika & Biologi Terapan',
      icon: '🧬',
      subjectKey: 'ipa',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-${short}-ips-${level}`,
      title: `📜 IPS ${short}`,
      subtitle: 'Geografi, Sejarah & Ekonomi Sosial',
      icon: '📜',
      subjectKey: 'ips',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-${short}-indo-${level}`,
      title: `📝 Indo ${short}`,
      subtitle: 'Teks Bacaan, EYD & Kalimat Efektif',
      icon: '📝',
      subjectKey: 'indo',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-${short}-cerdas-cermat-${level}`,
      title: `🏆 Cerdas Cermat ${short}`,
      subtitle: 'Campur 6 Mapel: 2 MTK, 2 Inggris, 2 PKN, 2 IPA, 2 IPS/Indo',
      icon: '🏆',
      subjectKey: 'cerdas_cermat',
      questionCount: 10,
      xpReward: 200,
      badgeText: `${lvlInfo.emoji} Campur 6 Mapel`,
    },
    {
      id: `arena-${classKey}-${short}-tantang-kakak-${level}`,
      title: `⚔️ Tantang ${nextLabel}`,
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
    const combined = [...newIds, ...existing].slice(0, 150);
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
 * Selects 10 non-repeating adaptive questions strictly matching the chosen classKey, subject, and difficulty level.
 * NEVER mixes SD Kelas 1 with algebra or SMP Kelas 8 with SD material.
 */
export function getAdaptiveQuestionsForArena(
  classKey: DuelClassKey,
  level: DuelDifficultyLevel,
  arenaSubject: DuelSubjectFilter | 'cerdas_cermat' | 'tantang_kakak',
  count = 10
): DuelQuestion[] {
  const historyKey = `duel_history_v15_${classKey}_${arenaSubject}_${level}`;
  const strictClassPool = FULL_QUESTION_BANK.filter((q) => q.classKey === classKey);

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
      const subPool = strictClassPool.filter(
        (q) => q.subject === subj && (q.level === level || q.level === 'menengah')
      );
      const fallbackPool =
        subPool.length >= 2 ? subPool : strictClassPool.filter((q) => q.subject === subj);
      const pair = pickFreshQuestionsFromPool(fallbackPool, 2, `${historyKey}_${subj}`);
      mixedPicked.push(...pair);
    });

    return mixedPicked
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map((item) => toShuffledDuelQuestion(item));
  }

  // Case 2: Tantang Kakak Kelas / Naik Level (Still strictly within appropriate grade progression, never jumping from SD 1 to Algebra)
  if (arenaSubject === 'tantang_kakak') {
    const nextClassKeyMap: Record<string, DuelClassKey> = {
      sd1: 'sd2',
      sd2: 'sd3',
      sd3: 'sd4',
      sd4: 'sd5',
      sd5: 'sd6',
      sd6: 'kelas7',
      kelas7: 'kelas8',
      kelas8: 'kelas9',
      kelas9: 'sma10',
      sma10: 'sma11',
      sma11: 'sma12',
      sma12: 'sma12',
      smk10: 'smk11',
      smk11: 'smk12',
      smk12: 'smk12',
      umum: 'umum',
    };
    const nextCls = nextClassKeyMap[classKey] || classKey;
    const nextPool = FULL_QUESTION_BANK.filter((q) => q.classKey === nextCls);
    const picked = pickFreshQuestionsFromPool(
      nextPool.length >= count ? nextPool : strictClassPool,
      count,
      historyKey
    );
    return picked.map((item) =>
      toShuffledDuelQuestion(item, `⚔️ Tantangan Naik Kelas • ${DUEL_LEVEL_BADGES[level].label}`)
    );
  }

  // Case 3: Specific Subject Arena (MTK, Inggris, PKN, IPA, IPS, Indo, Umum)
  const targetSubject = arenaSubject === 'semua' ? 'mtk' : arenaSubject;
  let pool = strictClassPool.filter(
    (q) => q.subject === targetSubject && q.level === level
  );

  if (pool.length < count) {
    const broaderPool = strictClassPool.filter((q) => q.subject === targetSubject);
    pool = [...pool, ...broaderPool.filter((b) => !pool.some((p) => p.id === b.id))];
  }

  const picked = pickFreshQuestionsFromPool(pool, count, historyKey);
  return picked.map((item) => toShuffledDuelQuestion(item));
}
