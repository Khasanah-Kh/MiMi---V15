/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DuelQuestion } from '../types/mimi';
import { FULL_QUESTION_BANK } from '../data/questionBankKelas';
import { AdaptiveQuestion } from '../data/questionBankInggris';
import {
  generateProceduralQuestionsForClassAndLevel,
  computeQuestionHash,
  computeStringSimilarity,
} from '../data/questionPoolGenerator';
import {
  buildDeterministic1000Questions,
  seed1000Questions,
  toAdaptiveQuestion,
} from '../data/questionBank';
import {
  get100AskedIds,
  save100AskedIdsBatch,
} from './questionService';
import curriculumLevelMap from '../data/curriculumLevel.json';
import {
  getUserDuelHistoryHashes,
  getUserTotalDuelPlayed,
} from './studentIdService';

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
  selectedKategori: DuelKategori | string,
  selectedKelas: DuelKelas | string
): DuelClassKey {
  const katUpper = String(selectedKategori || 'SD').toUpperCase().trim();
  const rawKelasStr = String(selectedKelas ?? '').trim();
  if (katUpper === 'UMUM' || rawKelasStr.toLowerCase().includes('umum')) {
    return 'umum';
  }

  const parsedNum = parseInt(rawKelasStr.replace(/[^0-9]/g, ''), 10);

  if (katUpper === 'SD') {
    if (parsedNum === 1) return 'sd1';
    if (parsedNum === 2) return 'sd2';
    if (parsedNum === 3) return 'sd3';
    if (parsedNum === 4) return 'sd4';
    if (parsedNum === 5) return 'sd5';
    if (parsedNum === 6) return 'sd6';
    return 'sd1';
  }
  if (katUpper === 'SMP') {
    if (parsedNum === 7) return 'kelas7';
    if (parsedNum === 8) return 'kelas8';
    if (parsedNum === 9) return 'kelas9';
    return 'kelas7';
  }
  if (katUpper === 'SMA') {
    if (parsedNum === 10) return 'sma10';
    if (parsedNum === 11) return 'sma11';
    if (parsedNum === 12) return 'sma12';
    return 'sma10';
  }
  if (katUpper === 'SMK') {
    if (parsedNum === 10) return 'smk10';
    if (parsedNum === 11) return 'smk11';
    if (parsedNum === 12) return 'smk12';
    return 'smk10';
  }
  return 'sd1';
}

export const STRICT_GRADE_LEVEL_SYSTEM_PROMPT = `KAMU ADALAH ENGINE PEMBUAT SOAL KURIKULUM MERDEKA MIMI-V15.
ATURAN FIX HARGA MATI (WAJIB DIPATUHI 100%):
1. Level Pemula, Menengah, Mahir, Ahli HANYA mengatur KEDALAMAN di DALAM jenjang itu, DILARANG KERAS menurunkan jenjang ke SD!
2. SD Kls 1 Pemula: BOLEH 4+4, 9+5 (memang levelnya).
3. SD Kls 1 Ahli: Soal penalaran anak SD Kelas 1 (tebak ciri hewan, bentuk, warna, arah, teka-teki anak 1-20), DILARANG KERAS soal Fisika/Hukum Newton SMP/SMA!
4. SD Kls 4-6 Pemula: DILARANG 4+4! Wajib perkalian puluhan (25x4), pecahan, KPK/FPB dasar.
5. SMP Kls 7-9 Pemula: DILARANG soal SD! Wajib Aljabar dasar SMP (contoh: Jika 2x+3=9, x=?), SPLDV, Pythagoras.
6. SMA Kls 10-12 Pemula: DILARANG KERAS soal SD/SMP! Wajib konsep dasar SMA (2a+3a, himpunan bagian, fungsi dasar, eksponen/logaritma dasar).
7. SMK Kls 10-12: KHUSUS KEJURUAN / VOKASI (K3 bengkel, APD, dasar akuntansi debet-kredit, IT/jaringan kabel UTP/IP, otomotif, uji kompetensi). JANGAN SAMAKAN DENGAN SMA!
8. UMUM (2 Kategori Saja):
   - Pengetahuan Umum: Pemula = umum dewasa dasar (ibukota, presiden); Menengah = sejarah & geografi; Mahir = analisis logika & inersia Hukum Newton I; Ahli = cerdas cermat nasional & sains modern HOTS.
   - Bahasa Inggris Umum: Pemula = daily vocab; Menengah = reading/work; Mahir = idioms & phrasal verbs; Ahli = TOEFL-like structure & inversion.
9. VALIDASI SEBELUM KIRIM SOAL: Tanyakan "Apakah guru jenjang ini akan malu kasih soal ini?" Jika YA, buat ulang!`;

export function buildStrictCurriculumPrompt(
  kategori: DuelKategori | string,
  kelas: DuelKelas | string,
  mapel: string,
  level: string
): string {
  const katUpper = String(kategori || 'SD').toUpperCase();
  const kelasStr = String(kelas || '1');
  const levelStr = String(level || 'Pemula');

  return `${STRICT_GRADE_LEVEL_SYSTEM_PROMPT}

TUGAS GENERATE SOAL:
- Kategori: ${katUpper}
- Kelas: ${kelasStr}
- Mapel: ${mapel}
- Level Kedalaman: ${levelStr}
- Anti-Duplikat: Buat soal BARU TOTAL yang belum pernah ada. Jangan ulang soal yang sama. Setiap soal harus topik, angka, cerita berbeda. JANGAN BOLAK-BALIK SOAL YANG SAMA!
- Output: 4 soal pilihan ganda unik dan segar dengan pembahasan mendalam.`;
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
      label: 'Kelas Umum (Dewasa/Alumni)',
      shortLabel: 'UMUM',
      nextClassLabel: 'Master Umum Pro',
      targetText: 'TARGET: UMUM',
    };
  }

  const parsedNum =
    typeof selectedKelas === 'number'
      ? selectedKelas
      : parseInt(String(selectedKelas).replace(/[^0-9]/g, ''), 10) ||
        (getDefaultKelasForKategori(selectedKategori) as number);

  let nextClassLabel = `Kakak Kelas ${parsedNum + 1}`;
  if (selectedKategori === 'SD' && parsedNum === 6) {
    nextClassLabel = 'SMP Kelas 7';
  } else if (selectedKategori === 'SMP' && parsedNum === 9) {
    nextClassLabel = 'SMA Kelas 10';
  } else if ((selectedKategori === 'SMA' || selectedKategori === 'SMK') && parsedNum === 12) {
    nextClassLabel = 'Level Universitas';
  } else {
    nextClassLabel = `${selectedKategori} Kelas ${parsedNum + 1}`;
  }

  return {
    key,
    label: `${selectedKategori} Kelas ${parsedNum}`,
    shortLabel: `${selectedKategori} Kls ${parsedNum}`,
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
  { key: 'smk10', label: 'SMK Kelas 10 (Vokasi)', shortLabel: 'SMK Kls 10', nextClassLabel: 'SMK Kelas 11' },
  { key: 'smk11', label: 'SMK Kelas 11 (Vokasi)', shortLabel: 'SMK Kls 11', nextClassLabel: 'SMK Kelas 12' },
  { key: 'smk12', label: 'SMK Kelas 12 (Vokasi)', shortLabel: 'SMK Kls 12', nextClassLabel: 'Level Universitas' },
  { key: 'sma', label: 'SMA / SMK (Kls 10–12)', shortLabel: 'SMA/SMK', nextClassLabel: 'Level Universitas' },
  { key: 'umum', label: 'Kelas Umum (Dewasa/Alumni)', shortLabel: 'UMUM', nextClassLabel: 'Master Umum Pro' },
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
  if (eduLower.includes('smk')) return 'smk10';
  if (eduLower.includes('sma')) return 'sma10';
  return 'sd1';
}

/**
 * Generates the Adaptive Duel Arena cards for the selected class and level.
 * Strictly presents only 2 categories for UMUM: Pengetahuan Umum & Bahasa Inggris Umum.
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
    const umumPuSubtitle =
      level === 'pemula'
        ? 'Soal Umum Dewasa Dasar: Ibukota Indonesia & Dunia, Tokoh Nasional & Geografi'
        : level === 'menengah'
        ? 'Sejarah Nasional (Rengasdengklok, Sumpah Pemuda), Geografi Kepulauan & Dunia'
        : level === 'mahir'
        ? 'Analisis Logika Umum, Inersia (Hukum I Newton), Efisiensi Kerja & Finansial'
        : 'Cerdas Cermat Nasional: Sains Modern HOTS, Logika Kompleks & Kosmologi';

    const umumEnSubtitle =
      level === 'pemula'
        ? 'Daily Conversation Vocab, Shopping, Greeting & Ungkapan Bahasa Inggris Harian'
        : level === 'menengah'
        ? 'Reading Comprehension, Job Expressions & Komunikasi Kerja'
        : level === 'mahir'
        ? 'Idioms Sehari-hari ("Break a leg"), Phrasal Verbs & Wawancara Profesional'
        : 'TOEFL-Like Structure, Advanced Idioms, Inversion & Academic Vocabulary';

    return [
      {
        id: `arena-umum-pengetahuan-umum-${level}`,
        title: `🎲 Pengetahuan Umum`,
        subtitle: umumPuSubtitle,
        icon: '🎲',
        subjectKey: 'umum',
        questionCount: 10,
        xpReward: 200,
        badgeText: `🔥 Kategori 1 • ${lvlInfo.label}`,
      },
      {
        id: `arena-umum-bahasa-inggris-${level}`,
        title: `🇬🇧 Bahasa Inggris Umum`,
        subtitle: umumEnSubtitle,
        icon: '🇬🇧',
        subjectKey: 'inggris',
        questionCount: 10,
        xpReward: 200,
        badgeText: `🔥 Kategori 2 • ${lvlInfo.label}`,
      },
    ];
  }

  const isSmk = classKey.startsWith('smk');

  return [
    {
      id: `arena-${classKey}-${short}-mtk-${level}`,
      title: isSmk ? `📐 Matematika Terapan ${short}` : `🔢 MTK ${short}`,
      subtitle:
        classKey === 'sd1'
          ? 'Penjumlahan & Pengurangan 1–20, Mengenal Angka (Tanpa Aljabar)'
          : classKey === 'sd2'
          ? 'Penjumlahan 1–100 & Perkalian Dasar 1–5'
          : classKey === 'sd3'
          ? 'Perkalian, Pembagian Dasar & Pecahan Sederhana'
          : classKey.startsWith('sd')
          ? 'Perkalian Puluhan (25×4), Pecahan, KPK & FPB'
          : classKey.startsWith('kelas')
          ? 'Aljabar Dasar SMP, PLSV, Fungsi & Pythagoras'
          : isSmk
          ? 'Matematika Vokasi: Logika Teknik, Trigonometri Proyeksi & Perhitungan Biaya'
          : 'Konsep Dasar SMA: Aljabar/Eksponen, Himpunan, Fungsi, Logaritma & Kalkulus',
      icon: isSmk ? '📐' : '🔢',
      subjectKey: 'mtk',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-${short}-inggris-${level}`,
      title: isSmk ? `🇬🇧 English for Vocational ${short}` : `🇬🇧 Inggris ${short}`,
      subtitle:
        classKey === 'kelas8'
          ? 'Past Continuous, Comparative Degree, Simple Past & Present Perfect'
          : classKey === 'sd4' || classKey === 'sd5' || classKey === 'sd6'
          ? 'Daily Expressions, Simple Present & Reading Dasar SD'
          : isSmk
          ? 'Technical Terms, Job Interview & Workplace Communication'
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
      subtitle: 'Pancasila, UUD 1945 & Penerapan Norma Sesuai Jenjang',
      icon: '🏛️',
      subjectKey: 'pkn',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-${short}-ipa-${level}`,
      title: isSmk ? `⚙️ Sains Terapan & K3 ${short}` : `🧬 IPA ${short}`,
      subtitle: isSmk
        ? 'Keselamatan Kerja Bengkel (K3), Alat Ukur Presisi & Kelistrikan'
        : 'Sains Alam, Fisika & Biologi Terapan Sesuai Kelas',
      icon: isSmk ? '⚙️' : '🧬',
      subjectKey: 'ipa',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-${short}-ips-${level}`,
      title: isSmk ? `📊 Bisnis & Akuntansi ${short}` : `📜 IPS ${short}`,
      subtitle: isSmk
        ? 'Dasar Akuntansi (Debet-Kredit), Ekonomi Bisnis & Manajemen'
        : 'Geografi, Sejarah & Ekonomi Sosial Sesuai Kelas',
      icon: isSmk ? '📊' : '📜',
      subjectKey: 'ips',
      questionCount: 10,
      xpReward: 160,
      badgeText: `${lvlInfo.emoji} ${lvlInfo.label}`,
    },
    {
      id: `arena-${classKey}-${short}-indo-${level}`,
      title: `📝 Indo ${short}`,
      subtitle: isSmk
        ? 'Surat Lamaran Kerja, Teks Prosedur Teknis & Laporan Magang'
        : 'Teks Bacaan, EYD & Kalimat Efektif Sesuai Kelas',
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
 * Runtime Guard ("Apakah guru jenjang ini akan malu kasih soal ini?"):
 * Rejects any question that violates the strict grade boundary.
 */
export function isQuestionValidForClassAndLevel(
  item: AdaptiveQuestion,
  targetClassKey: DuelClassKey
): boolean {
  const qLower = item.q.toLowerCase();
  const typeLower = (item.type || '').toLowerCase();

  // ATURAN SD KELAS 1:
  // DILARANG KERAS Hukum Newton, gaya fisika SMP/SMA, atau aljabar!
  if (targetClassKey === 'sd1') {
    if (
      qLower.includes('newton') ||
      qLower.includes('inersia') ||
      qLower.includes('aljabar') ||
      qLower.includes('fotosintesis') ||
      qLower.includes('pythagoras') ||
      qLower.includes('trigonometri') ||
      qLower.includes('logaritma') ||
      qLower.includes('kalkulus') ||
      qLower.includes('persamaan linear') ||
      qLower.includes('kecepatan') && qLower.includes('m/s') ||
      typeLower.includes('newton') ||
      typeLower.includes('aljabar')
    ) {
      return false;
    }
  }

  // If NOT SD Kelas 1-3, strictly forbid SD1-SD3 elementary questions (e.g. 4+4, 9+5, bunyi sila dasar, pancaindra dasar)
  if (!['sd1', 'sd2', 'sd3'].includes(targetClassKey)) {
    if (
      typeLower.includes('sd1') ||
      typeLower.includes('sd2') ||
      typeLower.includes('sd3') ||
      qLower.includes('berapakah hasil penjumlahan dari') ||
      qLower.includes('lambang bilangan dari') ||
      qLower.includes('bunyi sila ke-') ||
      qLower.includes('lambang dari sila ke-') ||
      qLower.includes('huruf vokal (huruf hidup)')
    ) {
      return false;
    }
  }

  // If SMP, SMA, SMK, or Umum, strictly forbid any SD-typed question
  if (
    targetClassKey.startsWith('kelas') ||
    targetClassKey.startsWith('sma') ||
    targetClassKey.startsWith('smk') ||
    targetClassKey === 'umum'
  ) {
    if (
      typeLower.endsWith('sd') ||
      typeLower.includes('sd4') ||
      typeLower.includes('sd5') ||
      typeLower.includes('sd6') ||
      qLower.includes('this is a ...')
    ) {
      return false;
    }
  }

  return true;
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

const GLOBAL_USER_QUESTION_HISTORY_KEY = 'user_question_history_v15';

export function getGlobalUserQuestionHistory(): Array<{ id: string; hash: string; qText: string }> {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GLOBAL_USER_QUESTION_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGlobalUserQuestionHistory(
  newQuestions: Array<{ id: string; qText: string }>
): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getGlobalUserQuestionHistory();
    const newEntries = newQuestions.map((q) => ({
      id: q.id,
      hash: computeQuestionHash(q.qText),
      qText: q.qText,
    }));
    const combined = [...newEntries, ...existing].slice(0, 500);
    localStorage.setItem(GLOBAL_USER_QUESTION_HISTORY_KEY, JSON.stringify(combined));
  } catch {}
}

/**
 * Anti-Bosan Filtering:
 * Checks candidate against the 500 recent questions history:
 * 1. MD5/String hash must be unique
 * 2. Similarity with recent question texts must be < 80%
 */
/**
 * Anti-Bosan & Anti-Ulang 100 Match (1000 Soal Unik):
 * Checks candidate against:
 * 1. `mimi_100_match_asked` (1000 unique IDs before any repeat is allowed)
 * 2. Recent questions history hash & similarity (< 80%)
 */
function isFreshQuestion(
  candidate: AdaptiveQuestion,
  historyList: Array<{ id: string; hash: string; qText: string }>,
  asked100Set: Set<string>
): boolean {
  if (asked100Set.has(candidate.id)) {
    return false;
  }
  const candidateHash = computeQuestionHash(candidate.q);
  if (asked100Set.has(candidateHash)) {
    return false;
  }
  for (const h of historyList) {
    if (h.hash === candidateHash || h.id === candidate.id) {
      return false;
    }
    if (computeStringSimilarity(candidate.q, h.qText) > 0.85) {
      return false;
    }
  }
  return true;
}

function pickFreshQuestionsFromPool(
  pool: AdaptiveQuestion[],
  count: number,
  classKey: DuelClassKey,
  level: DuelDifficultyLevel,
  subjectFilter: string,
  recordAsked = true
): AdaptiveQuestion[] {
  const historyList = getGlobalUserQuestionHistory();
  const asked100Ids = get100AskedIds();
  const asked100Set = new Set(asked100Ids);

  // 1. Filter out any questions seen in 100-match history
  let freshCandidates = pool.filter((q) => isFreshQuestion(q, historyList, asked100Set));

  // 2. If pool has fewer than count fresh items, pull from 1000-Question Bank for this classKey
  if (freshCandidates.length < count) {
    const bank1000 = buildDeterministic1000Questions()
      .map(toAdaptiveQuestion)
      .filter((q) => isQuestionValidForClassAndLevel(q, classKey));

    const classMatchedBank = bank1000.filter(
      (q) =>
        q.classKey === classKey &&
        !asked100Set.has(q.id) &&
        !freshCandidates.some((f) => f.id === q.id)
    );
    freshCandidates = [...freshCandidates, ...classMatchedBank];
  }

  // 3. If still fewer than count, pull unseen questions from the remaining 1000-Question Bank (valid for grade boundary)
  if (freshCandidates.length < count) {
    const bank1000All = buildDeterministic1000Questions()
      .map(toAdaptiveQuestion)
      .filter(
        (q) =>
          isQuestionValidForClassAndLevel(q, classKey) &&
          !asked100Set.has(q.id) &&
          !freshCandidates.some((f) => f.id === q.id)
      );
    freshCandidates = [...freshCandidates, ...bank1000All];
  }

  // 4. Only if all 1000 questions have been exhausted, fallback to full pool (which triggers reset at >1000)
  if (freshCandidates.length < count) {
    freshCandidates = [...pool];
  }

  const shuffled = [...freshCandidates].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, count);

  if (recordAsked) {
    saveGlobalUserQuestionHistory(picked.map((p) => ({ id: p.id, qText: p.q })));
    save100AskedIdsBatch(picked.map((p) => p.id));
  }

  return picked;
}

/**
 * Selects 10 non-repeating adaptive questions strictly matching the chosen classKey, subject, and difficulty level.
 * Enforces 100-Match (1000 Unique Questions) Anti-Ulang guarantee.
 */
export function getAdaptiveQuestionsForArena(
  classKey: DuelClassKey,
  level: DuelDifficultyLevel,
  arenaSubject: DuelSubjectFilter | 'cerdas_cermat' | 'tantang_kakak',
  count = 10
): DuelQuestion[] {
  // Combine static curated questions + procedural pool + 1000-Question Bank
  const proceduralPool = generateProceduralQuestionsForClassAndLevel(classKey, level, arenaSubject);
  const bank1000Pool = buildDeterministic1000Questions().map(toAdaptiveQuestion);
  const combinedBank = [...FULL_QUESTION_BANK, ...proceduralPool, ...bank1000Pool];

  // Deduplicate by id
  const seenIds = new Set<string>();
  const uniqueCombinedBank = combinedBank.filter((q) => {
    if (seenIds.has(q.id)) return false;
    seenIds.add(q.id);
    return true;
  });

  const strictClassPool = uniqueCombinedBank.filter(
    (q) => q.classKey === classKey && isQuestionValidForClassAndLevel(q, classKey)
  );

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
      const exactLevelSubPool = strictClassPool.filter(
        (q) => q.subject === subj && q.level === level
      );
      const fallbackPool =
        exactLevelSubPool.length >= 2
          ? exactLevelSubPool
          : [
              ...exactLevelSubPool,
              ...strictClassPool.filter((q) => q.subject === subj && q.level !== level),
            ];
      const pair = pickFreshQuestionsFromPool(fallbackPool, 2, classKey, level, subj, false);
      mixedPicked.push(...pair);
    });

    const finalTen = mixedPicked.sort(() => Math.random() - 0.5).slice(0, count);
    saveGlobalUserQuestionHistory(finalTen.map((p) => ({ id: p.id, qText: p.q })));
    save100AskedIdsBatch(finalTen.map((p) => p.id));

    return finalTen.map((item) => toShuffledDuelQuestion(item));
  }

  // Case 2: Tantang Kakak Kelas / Naik Level
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
    const nextProcedural = generateProceduralQuestionsForClassAndLevel(nextCls, level, arenaSubject);
    const combinedNextBank = [...uniqueCombinedBank, ...nextProcedural];

    const nextPool = combinedNextBank.filter(
      (q) => q.classKey === nextCls && isQuestionValidForClassAndLevel(q, nextCls) && q.level === level
    );
    const nextBroadPool = combinedNextBank.filter(
      (q) => q.classKey === nextCls && isQuestionValidForClassAndLevel(q, nextCls)
    );
    const targetPool =
      nextPool.length >= count
        ? nextPool
        : nextBroadPool.length >= count
        ? [...nextPool, ...nextBroadPool.filter((b) => !nextPool.some((p) => p.id === b.id))]
        : strictClassPool;

    const picked = pickFreshQuestionsFromPool(targetPool, count, nextCls, level, arenaSubject, true);
    return picked.map((item) =>
      toShuffledDuelQuestion(item, `⚔️ Tantangan Naik Kelas • ${DUEL_LEVEL_BADGES[level].label}`)
    );
  }

  // Case 3: Specific Subject Arena (MTK, Inggris, PKN, IPA, IPS, Indo, Umum)
  const targetSubject =
    classKey === 'umum'
      ? arenaSubject === 'inggris'
        ? 'inggris'
        : 'umum'
      : arenaSubject === 'semua'
      ? 'mtk'
      : arenaSubject;

  let pool = strictClassPool.filter(
    (q) => q.subject === targetSubject && q.level === level
  );

  if (pool.length < count) {
    const broaderPool = strictClassPool.filter((q) => q.subject === targetSubject);
    pool = [...pool, ...broaderPool.filter((b) => !pool.some((p) => p.id === b.id))];
  }

  const picked = pickFreshQuestionsFromPool(pool, count, classKey, level, targetSubject, true);
  return picked.map((item) => toShuffledDuelQuestion(item));
}

/**
 * Asynchronously fetches or pulls 10 unique questions for Duel Arena.
 * Seeds IndexedDB with 1,000+ unique questions via seed1000Questions() and enforces
 * 100-Match (1000 Unique Questions) Anti-Ulang tracking (`mimi_100_match_asked`).
 */
export async function fetchFreshDuelQuestions(
  classKey: DuelClassKey,
  level: DuelDifficultyLevel,
  arenaSubject: DuelSubjectFilter | 'cerdas_cermat' | 'tantang_kakak',
  count = 10,
  userUid?: string
): Promise<DuelQuestion[]> {
  // Ensure 1,000-question IndexedDB bank is seeded
  seed1000Questions().catch(() => {});

  // 1. Gather 100-match asked IDs + history hashes
  const asked100Ids = get100AskedIds();
  let historyHashes: string[] = [];
  let totalPlayed = Math.floor(asked100Ids.length / 10);

  if (userUid && userUid !== 'usr_public_visitor') {
    try {
      const [fsHashes, playedCount] = await Promise.all([
        getUserDuelHistoryHashes(userUid, 50).catch(() => []),
        getUserTotalDuelPlayed(userUid).catch(() => 0),
      ]);
      historyHashes = fsHashes;
      totalPlayed = Math.max(totalPlayed, playedCount);
    } catch {}
  }

  const localHistory = getGlobalUserQuestionHistory();
  const combinedHistory = Array.from(
    new Set([
      ...asked100Ids.slice(-100),
      ...historyHashes,
      ...localHistory.map((h) => h.hash).filter(Boolean),
    ])
  ).slice(0, 100);

  // 2. Attempt fetching from server Gemini engine with timeout, then top-up to exact `count` (10) from 1000-question bank
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2400);

    const res = await fetch('/api/duel/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classKey,
        level,
        arenaSubject,
        historyQuestionHashes: combinedHistory,
        historyQuestionIds: asked100Ids.slice(-100),
        totalDuelPlayed: totalPlayed,
        count,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.questions) && data.questions.length >= 4) {
        const aiQuestions: DuelQuestion[] = data.questions
          .slice(0, count)
          .map((q: any, idx: number) => {
            const qId =
              q.id && !asked100Ids.includes(q.id)
                ? String(q.id)
                : `q_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`;
            return toShuffledDuelQuestion({
              id: qId,
              q: q.q,
              options: q.options,
              answer: q.answer,
              explanation: q.explanation,
              subject: q.subject || arenaSubject || 'umum',
              level,
              classKey,
              type: q.type || q.subject || 'general',
            });
          });

        saveGlobalUserQuestionHistory(
          aiQuestions.map((q) => ({
            id: q.id,
            qText: q.question,
          }))
        );
        save100AskedIdsBatch(aiQuestions.map((q) => q.id));

        if (aiQuestions.length < count) {
          const remainder = getAdaptiveQuestionsForArena(
            classKey,
            level,
            arenaSubject,
            count - aiQuestions.length
          );
          return [...aiQuestions, ...remainder];
        }

        return aiQuestions;
      }
    }
  } catch {
    // Instant fallback to 1000-Question Anti-Repeat Bank
  }

  // 3. Deterministic + Procedural 1000-Question Bank (100% unique across 100 Matches)
  return getAdaptiveQuestionsForArena(classKey, level, arenaSubject, count);
}


