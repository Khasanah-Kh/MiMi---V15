import {
  BadgeItem,
  CodingLessonItem,
  CodingResourceBook,
  EducationLevel,
  LearningMilestone,
  LevelItem,
  QuizQuestion,
  RivalProfile,
} from '../types/mimi';

export const KEMENDIKDASMEN_CATALOG_URL =
  'https://buku.kemendikdasmen.go.id/daftar-katalog';

export const CLASSES_BY_LEVEL: Record<EducationLevel, string[]> = {
  [EducationLevel.SD]: [
    'Kelas 1',
    'Kelas 2',
    'Kelas 3',
    'Kelas 4',
    'Kelas 5',
    'Kelas 6',
  ],
  [EducationLevel.SMP]: ['Kelas 7', 'Kelas 8', 'Kelas 9'],
  [EducationLevel.SMA]: ['Kelas 10', 'Kelas 11', 'Kelas 12'],
  [EducationLevel.SMK]: ['Kelas 10 SMK', 'Kelas 11 SMK', 'Kelas 12 SMK'],
  [EducationLevel.UMUM]: [
    'Eksplorasi Umum',
    'Bahasa Inggris & Slang',
    'Curhat & Kehidupan',
  ],
};

export const SUBJECTS_BY_LEVEL: Record<EducationLevel, string[]> = {
  [EducationLevel.SD]: [
    'Matematika',
    'IPAS (Sains & Sosial)',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'PPKn',
    'Coding & Logika Anak',
  ],
  [EducationLevel.SMP]: [
    'Matematika',
    'IPA (Fisika & Biologi)',
    'IPS',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Informatika',
    'PPKn',
  ],
  [EducationLevel.SMA]: [
    'Matematika',
    'Fisika',
    'Kimia',
    'Biologi',
    'Informatika',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Ekonomi & Sosiologi',
  ],
  [EducationLevel.SMK]: [
    'Matematika Kejuruan',
    'PPLG / Rekayasa Perangkat Lunak',
    'TJKT / Teknik Jaringan',
    'Teknik Elektronika & IoT',
    'Projek Kreatif & Kewirausahaan',
    'Bahasa Inggris Vokasi',
  ],
  [EducationLevel.UMUM]: [
    'Pengetahuan Umum & Sains Populer',
    'Bahasa Inggris (Slang, Idiom & Academic)',
    'Belajar Coding & Web Modern',
    'Curhat, Motivasi & Produktivitas',
  ],
};

export const CYBER_RANKS = [
  { minXp: 0, title: 'Pelajar Pemula I' },
  { minXp: 250, title: 'Penjelajah Ilmu II' },
  { minXp: 600, title: 'Pemikir Kritis III' },
  { minXp: 1200, title: 'Cendekiawan Muda IV' },
  { minXp: 2000, title: 'Bintang Akademia V' },
];

export function calculateCyberRank(xp: number): string {
  let rank = CYBER_RANKS[0].title;
  for (const r of CYBER_RANKS) {
    if (xp >= r.minXp) rank = r.title;
  }
  return rank;
}

export function calculateLevelFromXp(xp: number): number {
  return Math.max(1, Math.floor(xp / 150) + 1);
}

export const INITIAL_LEVELS: LevelItem[] = [
  // ================= SD =================
  {
    id: 'sd-lvl-1',
    levelNumber: 1,
    title: 'Operasi Bilangan & Nilai Tempat',
    subtitle: 'Memahami ratusan, puluhan, satuan, dan penjumlahan cepat',
    subject: 'Matematika SD',
    educationLevel: EducationLevel.SD,
    classRange: 'Kelas 1 - 3',
    xpReward: 50,
    estimatedMinutes: 10,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Belajar Bersama Temanmu Matematika untuk Sekolah Dasar Kelas II & III',
      authorOrPublisher: 'Tim Gakko Tosho / Pusat Perbukuan Kemendikdasmen RI',
      year: '2022',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
      companionBookTitle: 'Matematika SD/MI Kurikulum Merdeka (SIBI Kemendikdasmen)',
      companionBookUrl: KEMENDIKDASMEN_CATALOG_URL,
    },
    summaryPoints: [
      'Setiap angka memiliki nilai tempat: ratusan (100), puluhan (10), dan satuan (1).',
      'Contoh: Bilangan 345 terdiri dari 3 ratusan (300) + 4 puluhan (40) + 5 satuan (5).',
      'Saat menjumlahkan dua bilangan, jumlahkan mulai dari satuan di sebelah kanan.',
    ],
    practiceQuestion: {
      question:
        'Pada bilangan 482, angka 8 menempati nilai tempat apa dan berapa nilainya?',
      options: [
        'Ratusan, nilainya 800',
        'Puluhan, nilainya 80',
        'Satuan, nilainya 8',
        'Ribuan, nilainya 8000',
      ],
      correctIndex: 1,
      explanation:
        'Angka 8 berada di posisi kedua dari kanan, sehingga menempati nilai tempat puluhan dengan nilai 80.',
    },
    simulation: {
      type: 'FRACTION_VISUAL',
      title: 'Simulasi Blok Nilai Tempat & Proporsi',
      parameterLabel: 'Jumlah Unit Puluhan',
      unit: 'puluhan',
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 4,
      targetValue: 8,
      formulaDisplay: 'Nilai = N × 10 satuan',
      explanation:
        'Geser pengatur puluhan hingga mencapai target 8 puluhan (80 satuan) untuk memverifikasi dekomposisi bilangan.',
    },
  },
  {
    id: 'sd-lvl-2',
    levelNumber: 2,
    title: 'Eksplorasi Pecahan & Perbandingan',
    subtitle: 'Visualisasi pembilang, penyebut, dan pecahan senilai',
    subject: 'Matematika SD',
    educationLevel: EducationLevel.SD,
    classRange: 'Kelas 4 - 6',
    xpReward: 65,
    estimatedMinutes: 12,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Matematika untuk SD/MI Kelas IV & V (Edisi Revisi Kurikulum Merdeka)',
      authorOrPublisher: 'Hobri dkk. — Pusat Perbukuan BSKAP Kemendikdasmen RI',
      year: '2022',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
      companionBookTitle: 'OpenStax Prealgebra 2e — Fractions & Proportions',
      companionBookUrl: 'https://openstax.org/details/books/prealgebra-2e',
    },
    summaryPoints: [
      'Pecahan a/b memiliki pembilang (a = bagian terpilih) dan penyebut (b = total bagian utuh).',
      'Pecahan senilai memiliki proporsi yang sama, misalnya 1/2 senilai dengan 2/4 dan 4/8.',
      'Untuk menjumlahkan pecahan berbeda penyebut, samakan penyebutnya terlebih dahulu dengan KPK.',
    ],
    practiceQuestion: {
      question: 'Manakah pecahan di bawah ini yang senilai dengan 3/4?',
      options: ['6/8', '5/8', '3/8', '9/16'],
      correctIndex: 0,
      explanation:
        'Jika pembilang dan penyebut 3/4 sama-sama dikalikan 2, diperoleh (3×2)/(4×2) = 6/8.',
    },
    simulation: {
      type: 'RATIO_LAB',
      title: 'Laboratorium Pecahan Senilai',
      parameterLabel: 'Bagian Terisi (per 8 bagian)',
      unit: '/ 8',
      min: 1,
      max: 8,
      step: 1,
      defaultValue: 2,
      targetValue: 6,
      formulaDisplay: '3 / 4 = 6 / 8 = 75%',
      explanation:
        'Atur jumlah bagian dari 8 blok hingga bernilai tepat 3/4 (yaitu 6 dari 8 bagian).',
    },
  },
  {
    id: 'sd-lvl-3',
    levelNumber: 3,
    title: 'Siklus Air & Ekosistem Bumi',
    subtitle: 'Evaporasi, kondensasi, presipitasi, dan rantai makanan',
    subject: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    educationLevel: EducationLevel.SD,
    classRange: 'Kelas 4 - 6',
    xpReward: 70,
    estimatedMinutes: 15,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Ilmu Pengetahuan Alam dan Sosial (IPAS) untuk SD/MI Kelas V',
      authorOrPublisher: 'Amalia Fitri Ghaniem dkk. — Pusat Perbukuan Kemendikdasmen RI',
      year: '2021',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
      companionBookTitle: 'Buku Panduan Sains Dasar SD — SIBI Kemendikdasmen',
      companionBookUrl: KEMENDIKDASMEN_CATALOG_URL,
    },
    summaryPoints: [
      'Evaporasi adalah penguapan air laut dan sungai akibat panas matahari.',
      'Kondensasi mengubah uap air di atmosfer menjadi titik-titik awan.',
      'Presipitasi adalah turunnya air hujan kembali ke permukaan bumi.',
    ],
    practiceQuestion: {
      question:
        'Proses berubahnya uap air di udara menjadi titik-titik air pembentuk awan disebut...',
      options: ['Evaporasi', 'Kondensasi', 'Presipitasi', 'Infiltrasi'],
      correctIndex: 1,
      explanation:
        'Kondensasi adalah proses pengembunan uap air menjadi partikel air di awan saat suhu udara mendingin.',
    },
    simulation: {
      type: 'NEWTON_FORCE',
      title: 'Simulasi Suhu & Laju Evaporasi Surya',
      parameterLabel: 'Suhu Permukaan Air',
      unit: '°C',
      min: 20,
      max: 45,
      step: 1,
      defaultValue: 26,
      targetValue: 35,
      formulaDisplay: 'Laju Uap ∝ ΔT Surya',
      explanation:
        'Atur suhu permukaan ke 35°C untuk mengamati pembentukan awan kondensasi optimal.',
    },
  },
  {
    id: 'sd-lvl-4',
    levelNumber: 4,
    title: 'Bahasa Indonesia & Literasi Membaca Cerita',
    subtitle: 'Menemukan ide pokok paragraf, kalimat utama, dan kosakata baku',
    subject: 'Bahasa Indonesia SD',
    educationLevel: EducationLevel.SD,
    classRange: 'Kelas 1 - 6',
    xpReward: 80,
    estimatedMinutes: 10,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Bahasa Indonesia: Bergerak Bersama untuk SD/MI Kelas V',
      authorOrPublisher: 'Evy Verawaty & Zulqarnain — Pusat Perbukuan Kemendikdasmen RI',
      year: '2021',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
    },
    summaryPoints: [
      'Ide pokok adalah gagasan utama yang menjadi dasar pengembangan sebuah paragraf.',
      'Kalimat penjelas berisi rincian, contoh, atau bukti yang mendukung kalimat utama.',
      'Membaca dengan saksama membantu kita memahami pesan penulis secara utuh.',
    ],
    practiceQuestion: {
      question:
        'Gagasan utama yang mendasari pengembangan sebuah paragraf dalam bacaan disebut...',
      options: [
        'Kalimat tambahan',
        'Ide pokok',
        'Daftar pustaka',
        'Catatan kaki',
      ],
      correctIndex: 1,
      explanation:
        'Ide pokok (gagasan utama) adalah inti pembahasan yang menjiwai seluruh isi paragraf.',
    },
    simulation: {
      type: 'CYBER_CIPHER',
      title: 'Latihan Kecepatan & Pemahaman Membaca efektif',
      parameterLabel: 'Target Paragraf Terbaca',
      unit: 'paragraf',
      min: 2,
      max: 10,
      step: 1,
      defaultValue: 4,
      targetValue: 8,
      formulaDisplay: 'Pemahaman = Ide Pokok × 8 Paragraf',
      explanation:
        'Atur target latihan analisis ke 8 paragraf untuk menuntaskan latihan literasi bacaan.',
    },
  },

  // ================= SMP =================
  {
    id: 'smp-lvl-1',
    levelNumber: 1,
    title: 'Persamaan Linear & Keseimbangan Aljabar',
    subtitle: 'Menyelesaikan variabel tunggal dan pemodelan masalah nyata',
    subject: 'Matematika SMP',
    educationLevel: EducationLevel.SMP,
    classRange: 'Kelas 7 - 8',
    xpReward: 75,
    estimatedMinutes: 15,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Matematika untuk SMP/MTs Kelas VII & VIII (Kurikulum Merdeka)',
      authorOrPublisher: 'Dicky Susanto dkk. — Pusat Perbukuan BSKAP Kemendikdasmen RI',
      year: '2022',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
      companionBookTitle: 'OpenStax Elementary Algebra 2e',
      companionBookUrl: 'https://openstax.org/details/books/elementary-algebra-2e',
    },
    summaryPoints: [
      'Persamaan linear satu variabel berbentuk ax + b = c dengan a ≠ 0.',
      'Prinsip keseimbangan: operasi yang dilakukan di ruas kiri harus dilakukan juga di ruas kanan.',
      'Untuk 3x + 5 = 20, kurangi kedua ruas dengan 5 sehingga 3x = 15, lalu bagi 3 menjadi x = 5.',
    ],
    practiceQuestion: {
      question:
        'Jika 4x - 7 = 21, berapakah nilai x yang memenuhi persamaan tersebut?',
      options: ['x = 5', 'x = 6', 'x = 7', 'x = 8'],
      correctIndex: 2,
      explanation:
        'Tambahkan 7 pada kedua ruas: 4x = 28. Kemudian bagi kedua ruas dengan 4: x = 28 / 4 = 7.',
    },
    simulation: {
      type: 'ALGEBRA_BALANCE',
      title: 'Neraca Kesetimbangan Variabel x',
      parameterLabel: 'Nilai Variabel x',
      unit: 'unit',
      min: 1,
      max: 12,
      step: 1,
      defaultValue: 3,
      targetValue: 7,
      formulaDisplay: '4x - 7 = 21  ⇒  4(7) - 7 = 21',
      explanation:
        'Ubah nilai x hingga ruas kiri (4x - 7) bernilai tepat 21 sehingga neraca aljabar seimbang.',
    },
  },
  {
    id: 'smp-lvl-2',
    levelNumber: 2,
    title: 'Hukum Newton, Gaya & Percepatan',
    subtitle: 'Analisis resultan gaya, inersia, dan dinamika gerak lurus',
    subject: 'Ilmu Pengetahuan Alam (IPA) SMP',
    educationLevel: EducationLevel.SMP,
    classRange: 'Kelas 8',
    xpReward: 85,
    estimatedMinutes: 18,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Ilmu Pengetahuan Alam untuk SMP/MTs Kelas VIII',
      authorOrPublisher: 'Okky Fajar Tri Maryana dkk. — Pusat Perbukuan Kemendikdasmen RI',
      year: '2021',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
      companionBookTitle: 'OpenStax College Physics 2e — Force and Newtons Laws',
      companionBookUrl: 'https://openstax.org/details/books/college-physics-2e',
    },
    summaryPoints: [
      'Hukum I Newton (Inersia): benda tetap diam atau bergerak lurus beraturan jika ΣF = 0.',
      'Hukum II Newton: percepatan berbanding lurus dengan resultan gaya dan berbanding terbalik dengan massa (a = ΣF / m).',
      'Hukum III Newton: setiap gaya aksi menghasilkan gaya reaksi yang sama besar dan berlawanan arah.',
    ],
    practiceQuestion: {
      question:
        'Sebuah benda bermassa 5 kg didorong dengan gaya resultan 30 N di lantai licin. Berapa percepatannya?',
      options: ['4 m/s²', '6 m/s²', '15 m/s²', '150 m/s²'],
      correctIndex: 1,
      explanation:
        'Berdasarkan Hukum II Newton: a = F / m = 30 N / 5 kg = 6 m/s².',
    },
    simulation: {
      type: 'NEWTON_FORCE',
      title: 'Laboratorium Dinamika Gaya (m = 5 kg)',
      parameterLabel: 'Gaya Dorong (F)',
      unit: 'N',
      min: 5,
      max: 50,
      step: 5,
      defaultValue: 15,
      targetValue: 30,
      formulaDisplay: 'a = F / 5 kg = 6.0 m/s²',
      explanation:
        'Atur gaya dorong F pada 30 N agar benda bermassa 5 kg mencapai target percepatan 6 m/s².',
    },
  },
  {
    id: 'smp-lvl-3',
    levelNumber: 3,
    title: 'Rangkaian Listrik & Hukum Ohm',
    subtitle: 'Hubungan tegangan, kuat arus, dan hambatan pada sirkuit seri-paralel',
    subject: 'IPA Fisika SMP',
    educationLevel: EducationLevel.SMP,
    classRange: 'Kelas 9',
    xpReward: 90,
    estimatedMinutes: 18,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Ilmu Pengetahuan Alam untuk SMP/MTs Kelas IX',
      authorOrPublisher: 'Cece Sutia dkk. — Pusat Perbukuan BSKAP Kemendikdasmen RI',
      year: '2022',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
    },
    summaryPoints: [
      'Hukum Ohm menyatakan V = I × R (Tegangan = Kuat Arus × Hambatan).',
      'Pada rangkaian seri, arus listrik di setiap komponen sama besar, sedangkan tegangan terbagi.',
      'Pada rangkaian paralel, tegangan tiap cabang sama besar dan hambatan pengganti lebih kecil.',
    ],
    practiceQuestion: {
      question:
        'Sebuah lampu memiliki hambatan 6 Ohm dan dihubungkan ke baterai 12 Volt. Berapa kuat arus yang mengalir?',
      options: ['0,5 Ampere', '2 Ampere', '6 Ampere', '72 Ampere'],
      correctIndex: 1,
      explanation: 'Gunakan rumus I = V / R = 12 Volt / 6 Ohm = 2 Ampere.',
    },
    simulation: {
      type: 'CIRCUIT_LOGIC',
      title: 'Simulator Sirkuit Hukum Ohm (R = 6 Ω)',
      parameterLabel: 'Tegangan Sumber (V)',
      unit: 'Volt',
      min: 3,
      max: 24,
      step: 3,
      defaultValue: 6,
      targetValue: 12,
      formulaDisplay: 'I = V / 6 Ω = 2.0 A',
      explanation:
        'Sesuaikan tegangan baterai menjadi 12 Volt untuk menghasilkan arus stabil 2,0 Ampere pada beban 6 Ω.',
    },
  },
  {
    id: 'smp-lvl-4',
    levelNumber: 4,
    title: 'Berpikir Komputasional & Algoritma Dasar',
    subtitle: 'Dekomposisi, pengenalan pola, abstraksi, dan logika pemrograman',
    subject: 'Informatika SMP',
    educationLevel: EducationLevel.SMP,
    classRange: 'Kelas 7 - 9',
    xpReward: 95,
    estimatedMinutes: 15,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Informatika untuk SMP/MTs Kelas VII, VIII & IX',
      authorOrPublisher: 'Maresha Caroline Wijanto dkk. — Pusat Perbukuan Kemendikdasmen RI',
      year: '2021',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
      companionBookTitle: 'CS50x Introduction to Computer Science — Harvard University',
      companionBookUrl: 'https://cs50.harvard.edu/x/',
    },
    summaryPoints: [
      'Algoritma adalah urutan langkah logis dan sistematis untuk menyelesaikan suatu masalah.',
      'Percabangan (IF-ELSE) memilih jalur eksekusi berdasarkan kondisi bernilai benar (True) atau salah (False).',
      'Perulangan (Loop) mengeksekusi blok instruksi secara berulang selama kondisi terpenuhi.',
    ],
    practiceQuestion: {
      question:
        'Gerbang logika manakah yang hanya menghasilkan output TRUE (1) jika KEDUA inputnya bernilai TRUE (1)?',
      options: ['OR', 'AND', 'NOT', 'XOR'],
      correctIndex: 1,
      explanation:
        'Gerbang AND mengharuskan seluruh input bernilai 1 agar output bernilai 1.',
    },
    simulation: {
      type: 'CYBER_CIPHER',
      title: 'Simulator Iterasi Algoritma Pencarian Biner',
      parameterLabel: 'Langkah Iterasi Biner',
      unit: 'langkah',
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 3,
      targetValue: 7,
      formulaDisplay: 'N_max = 2^k = 128 elemen',
      explanation:
        'Atur langkah pencarian biner (binary search) ke 7 langkah untuk mencakup kapasitas 128 data terurut.',
    },
  },

  // ================= SMA =================
  {
    id: 'sma-lvl-1',
    levelNumber: 1,
    title: 'Kalkulus Diferensial & Laju Perubahan',
    subtitle: 'Limit fungsi, turunan pertama, gradien garis singgung, dan optimasi',
    subject: 'Matematika Tingkat Lanjut SMA',
    educationLevel: EducationLevel.SMA,
    classRange: 'Kelas 11 - 12',
    xpReward: 110,
    estimatedMinutes: 20,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Matematika Tingkat Lanjut untuk SMA/MA Kelas XI & XII',
      authorOrPublisher: 'Al Azhary Masta dkk. — Pusat Perbukuan BSKAP Kemendikdasmen RI',
      year: '2022',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
      companionBookTitle: 'OpenStax Calculus Volume 1 — Derivatives',
      companionBookUrl: 'https://openstax.org/details/books/calculus-volume-1',
    },
    summaryPoints: [
      "Turunan fungsi f(x) = ax^n adalah f'(x) = n·a·x^(n-1).",
      "Turunan pertama f'(x) merepresentasikan kemiringan (gradien) garis singgung kurva di titik x.",
      "Titik stasioner (maksimum/minimum lokal) tercapai ketika f'(x) = 0.",
    ],
    practiceQuestion: {
      question:
        "Jika f(x) = 3x² - 12x + 9, pada nilai x berapakah fungsi tersebut mencapai titik stasioner (f'(x) = 0)?",
      options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'],
      correctIndex: 1,
      explanation:
        "Turunan pertama adalah f'(x) = 6x - 12. Saat f'(x) = 0, maka 6x - 12 = 0 sehingga x = 2.",
    },
    simulation: {
      type: 'ALGEBRA_BALANCE',
      title: 'Eksplorasi Titik Stasioner Kurva f(x) = 3x² - 12x + 9',
      parameterLabel: 'Koordinat x',
      unit: 'titik',
      min: -2,
      max: 6,
      step: 1,
      defaultValue: 0,
      targetValue: 2,
      formulaDisplay: "f'(x) = 6x - 12 = 0  ⇒  x = 2",
      explanation:
        "Geser koordinat x ke nilai 2 hingga gradien garis singgung f'(x) tepat bernilai 0 (titik puncak minimum).",
    },
  },
  {
    id: 'sma-lvl-2',
    levelNumber: 2,
    title: 'Informatika, Jaringan & Keamanan Data',
    subtitle: 'Arsitektur internet, enkripsi data, dan pengembangan algoritma',
    subject: 'Informatika SMA',
    educationLevel: EducationLevel.SMA,
    classRange: 'Kelas 10 - 12',
    xpReward: 120,
    estimatedMinutes: 20,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Informatika untuk SMA/MA Kelas X, XI & XII',
      authorOrPublisher: 'Mushthofa dkk. — Pusat Perbukuan BSKAP Kemendikdasmen RI',
      year: '2021',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
      companionBookTitle: 'Eloquent JavaScript 4th Edition — Marijn Haverbeke',
      companionBookUrl: 'https://eloquentjavascript.net/',
    },
    summaryPoints: [
      'Fungsi hash satu arah memvalidasi integritas data dan melindungi kata sandi pengguna.',
      'Protokol HTTPS mengenkripsi komunikasi antara peramban dan server menggunakan TLS.',
      'Struktur data graf dan pohon digunakan untuk memodelkan rute jaringan internet.',
    ],
    practiceQuestion: {
      question:
        'Mengapa sistem aplikasi modern menyimpan hash kata sandi beserta "salt" acak, bukan menyimpan teks kata sandi asli?',
      options: [
        'Agar ukuran database menjadi lebih besar',
        'Agar jika database bocor, pihak luar tetap tidak mengetahui kata sandi asli pengguna',
        'Agar pengguna tidak perlu mengetik kata sandi saat login',
        'Agar koneksi internet menjadi 10 kali lebih cepat',
      ],
      correctIndex: 1,
      explanation:
        'Hashing + salt memastikan kata sandi asli tidak pernah tersimpan dalam bentuk teks biasa.',
    },
    simulation: {
      type: 'CYBER_CIPHER',
      title: 'Simulator Kompleksitas Kunci Enkripsi',
      parameterLabel: 'Eksponen Kompleksitas (2^N)',
      unit: 'bit',
      min: 8,
      max: 16,
      step: 1,
      defaultValue: 10,
      targetValue: 14,
      formulaDisplay: 'Kombinasi = 2^14 = 16.384 iterasi',
      explanation:
        'Atur faktor kerja derivasi kunci ke 14 bit (16.384 iterasi) sesuai standar keamanan aplikasi modern.',
    },
  },
  {
    id: 'sma-lvl-3',
    levelNumber: 3,
    title: 'Kesetimbangan Kimia & Larutan Penyangga',
    subtitle: 'Pergeseran Le Chatelier, pH fisiologis darah, dan stoikiometri reaksi',
    subject: 'Kimia & Biologi SMA',
    educationLevel: EducationLevel.SMA,
    classRange: 'Kelas 11 - 12',
    xpReward: 115,
    estimatedMinutes: 22,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Kimia untuk SMA/MA Kelas XI & XII (Kurikulum Merdeka)',
      authorOrPublisher: 'Munasprianto Ramli dkk. — Pusat Perbukuan Kemendikdasmen RI',
      year: '2022',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
      companionBookTitle: 'OpenStax Chemistry 2e — Chemical Equilibrium',
      companionBookUrl: 'https://openstax.org/details/books/chemistry-2e',
    },
    summaryPoints: [
      'Asas Le Chatelier: jika sistem kesetimbangan diberi gangguan, sistem bergeser untuk meminimalkan gangguan tersebut.',
      'Efek Bohr: peningkatan CO2 dan penurunan pH darah memudahkan pelepasan O2 dari hemoglobin ke jaringan aktif.',
      'Larutan penyangga (buffer) mempertahankan pH darah manusia pada rentang fisiologis 7,35 – 7,45.',
    ],
    practiceQuestion: {
      question:
        'Menurut Efek Bohr, apa yang terjadi pada hemoglobin saat otot bekerja keras dan menghasilkan banyak CO2 (pH turun)?',
      options: [
        'Hemoglobin mengikat O2 lebih erat dan enggan melepasnya',
        'Hemoglobin lebih mudah melepaskan O2 ke jaringan otot yang membutuhkan',
        'Kadar oksigen dalam paru-paru langsung berhenti',
        'pH darah berubah menjadi sangat basa di atas 12',
      ],
      correctIndex: 1,
      explanation:
        'Penurunan pH (suasana lebih asam akibat CO2) menurunkan afinitas Hb terhadap O2 sehingga oksigen dilepaskan secara optimal ke jaringan otot.',
    },
    simulation: {
      type: 'RATIO_LAB',
      title: 'Simulator pH Darah & Pelepasan Oksigen (skala ×10)',
      parameterLabel: 'Indeks pH Fisiologis (×10)',
      unit: 'pH×10',
      min: 68,
      max: 78,
      step: 1,
      defaultValue: 74,
      targetValue: 72,
      formulaDisplay: 'Hb(O2)4 + H+ ⇌ HbH+ + 4O2 (pH 7.2)',
      explanation:
        'Turunkan indeks pH dari 74 (7,4 istirahat) ke 72 (7,2 olahraga aktif) untuk mengamati pelepasan oksigen ke jaringan.',
    },
  },
  {
    id: 'sma-lvl-4',
    levelNumber: 4,
    title: 'Fisika Modern & Efek Fotolistrik',
    subtitle: 'Kuantisasi energi foton Planck-Einstein dan dualisme gelombang-partikel',
    subject: 'Fisika SMA',
    educationLevel: EducationLevel.SMA,
    classRange: 'Kelas 12',
    xpReward: 130,
    estimatedMinutes: 25,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Fisika untuk SMA/MA Kelas XII (Kurikulum Merdeka)',
      authorOrPublisher: 'Lia Laela Sarah dkk. — Pusat Perbukuan BSKAP Kemendikdasmen RI',
      year: '2022',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
      companionBookTitle: 'OpenStax University Physics Volume 3 — Photons & Matter Waves',
      companionBookUrl: 'https://openstax.org/details/books/university-physics-volume-3',
    },
    summaryPoints: [
      'Energi satu foton cahaya berbanding lurus dengan frekuensinya: E = h · f.',
      'Elektron hanya terlepas dari permukaan logam jika energi foton melebihi fungsi kerja logam (E > W₀).',
      'Energi kinetik maksimum fotoelektron adalah Ek_maks = h·f - W₀.',
    ],
    practiceQuestion: {
      question:
        'Jika permukaan logam memiliki fungsi kerja W₀ = 2,2 eV dan disinari foton berenergi 3,5 eV, berapakah energi kinetik maksimum elektron yang terlepas?',
      options: ['0,7 eV', '1,3 eV', '2,2 eV', '5,7 eV'],
      correctIndex: 1,
      explanation:
        'Berdasarkan persamaan Einstein: Ek_maks = E_foton - W₀ = 3,5 eV - 2,2 eV = 1,3 eV.',
    },
    simulation: {
      type: 'CIRCUIT_LOGIC',
      title: 'Eksperimen Foton Einstein (W₀ = 22×0.1 eV)',
      parameterLabel: 'Energi Foton Datang (×0.1 eV)',
      unit: '×0.1 eV',
      min: 15,
      max: 45,
      step: 5,
      defaultValue: 20,
      targetValue: 35,
      formulaDisplay: 'Ek = 3.5 eV - 2.2 eV = 1.3 eV',
      explanation:
        'Naikkan energi foton ke 35 (3,5 eV) untuk melampaui ambang fungsi kerja logam 2,2 eV dan melepaskan fotoelektron.',
    },
  },

  // ================= SMK =================
  {
    id: 'smk-lvl-1',
    levelNumber: 1,
    title: 'Pengembangan Perangkat Lunak, Web & Basis Data (PPLG)',
    subtitle: 'Arsitektur aplikasi web modern, REST API, dan pemrograman terstruktur',
    subject: 'Kejuruan PPLG / RPL SMK',
    educationLevel: EducationLevel.SMK,
    classRange: 'Kelas 10 - 12 SMK',
    xpReward: 115,
    estimatedMinutes: 20,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Dasar-Dasar Pengembangan Perangkat Lunak dan Gim (PPLG) untuk SMK/MAK Kelas X',
      authorOrPublisher: 'Okta Purnawirawan dkk. — Pusat Perbukuan BSKAP Kemendikdasmen RI',
      year: '2022',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
      companionBookTitle: 'MDN Web Docs & Eloquent JavaScript 4th Ed',
      companionBookUrl: 'https://developer.mozilla.org/',
    },
    summaryPoints: [
      'Pengembangan perangkat lunak mengikuti siklus hidup (SDLC): analisis kebutuhan, desain, pengkodean, pengujian, dan pemeliharaan.',
      'Frontend menangani antarmuka pengguna (HTML, CSS, JavaScript/React), sedangkan Backend mengelola logika bisnis, API, dan database.',
      'Query SQL dan struktur JSON digunakan untuk pertukaran data antara aplikasi klien dan server.',
    ],
    practiceQuestion: {
      question:
        'Dalam arsitektur aplikasi web modern (Client-Server), metode HTTP manakah yang secara standar digunakan untuk MENGIRIM data baru ke server API?',
      options: ['GET', 'POST', 'DELETE', 'HEAD'],
      correctIndex: 1,
      explanation:
        'Metode HTTP POST digunakan untuk mengirimkan payload data baru (misalnya form pendaftaran atau penyimpanan data) ke server.',
    },
    simulation: {
      type: 'CIRCUIT_LOGIC',
      title: 'Simulator Kapasitas Request Server API (RPS)',
      parameterLabel: 'Jumlah Worker Instance',
      unit: 'worker',
      min: 1,
      max: 8,
      step: 1,
      defaultValue: 2,
      targetValue: 6,
      formulaDisplay: 'Throughput = 6 Worker × 250 req/s = 1.500 RPS',
      explanation:
        'Atur jumlah worker server ke 6 unit untuk menangani beban trafik 1.500 request per detik tanpa antrean.',
    },
  },
  {
    id: 'smk-lvl-2',
    levelNumber: 2,
    title: 'Teknik Jaringan Komputer & Telekomunikasi (TJKT)',
    subtitle: 'Pengalamatan IPv4, Subnetting CIDR, routing paket, dan administrasi server',
    subject: 'Kejuruan TJKT SMK',
    educationLevel: EducationLevel.SMK,
    classRange: 'Kelas 10 - 12 SMK',
    xpReward: 120,
    estimatedMinutes: 20,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Dasar-Dasar Teknik Jaringan Komputer dan Telekomunikasi untuk SMK/MAK Kelas X',
      authorOrPublisher: 'Kustanto dkk. — Pusat Perbukuan BSKAP Kemendikdasmen RI',
      year: '2022',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
      companionBookTitle: 'Computer Networks: A Systems Approach (Open Textbook)',
      companionBookUrl: 'https://book.systemsapproach.org/',
    },
    summaryPoints: [
      'Alamat IPv4 terdiri dari 32 bit yang dibagi menjadi 4 oktet (contoh: 192.168.1.1/24).',
      'Prefix /24 menyediakan 2^(32-24) - 2 = 254 alamat host aktif dalam satu subnet.',
      'Model OSI terdiri dari 7 lapisan: Physical, Data Link, Network, Transport, Session, Presentation, dan Application.',
    ],
    practiceQuestion: {
      question:
        'Pada jaringan lokal dengan prefix subnet /24 (Subnet Mask 255.255.255.0), berapa jumlah maksimal alamat IP host valid yang dapat digunakan perangkat?',
      options: ['62 host', '126 host', '254 host', '510 host'],
      correctIndex: 2,
      explanation:
        'Pada /24 tersisa 8 bit host: 2^8 - 2 (dikurangi Network ID dan Broadcast) = 256 - 2 = 254 host.',
    },
    simulation: {
      type: 'CYBER_CIPHER',
      title: 'Kalkulator Subnetting & Bit Host IPv4',
      parameterLabel: 'Jumlah Bit Host (32 - Prefix)',
      unit: 'bit host',
      min: 4,
      max: 10,
      step: 1,
      defaultValue: 6,
      targetValue: 8,
      formulaDisplay: 'Host Aktif = 2^8 - 2 = 254 Perangkat (/24)',
      explanation:
        'Atur bit host ke 8 bit (setara prefix /24) untuk mengalokasikan ruang bagi 254 komputer laboratorium SMK.',
    },
  },
  {
    id: 'smk-lvl-3',
    levelNumber: 3,
    title: 'Sistem Mikrokontroler, Sensor & Otomasi Industri',
    subtitle: 'Pembacaan sensor analog-digital (ADC), aktuator PWM, dan Internet of Things (IoT)',
    subject: 'Teknik Elektronika & Mekatronika SMK',
    educationLevel: EducationLevel.SMK,
    classRange: 'Kelas 10 - 12 SMK',
    xpReward: 120,
    estimatedMinutes: 22,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Dasar-Dasar Teknik Elektronika untuk SMK/MAK Kelas X',
      authorOrPublisher: 'Farid Mulyana dkk. — Pusat Perbukuan BSKAP Kemendikdasmen RI',
      year: '2022',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
    },
    summaryPoints: [
      'ADC (Analog-to-Digital Converter) mengubah sinyal tegangan sensor kontinu menjadi nilai digital diskrit.',
      'PWM (Pulse Width Modulation) mengatur daya rata-rata ke motor atau LED melalui persentase Duty Cycle (0% – 100%).',
      'Mikrokontroler membaca input sensor, memproses logika program, lalu menggerakkan aktuator.',
    ],
    practiceQuestion: {
      question:
        'Jika sinyal PWM diatur dengan Duty Cycle sebesar 50% pada tegangan kerja mikrokontroler 5 Volt, berapakah tegangan efektif rata-rata yang diterima beban?',
      options: ['1,0 Volt', '2,5 Volt', '4,0 Volt', '5,0 Volt'],
      correctIndex: 1,
      explanation:
        'Tegangan rata-rata V_avg = Duty Cycle × V_max = 50% × 5 Volt = 2,5 Volt.',
    },
    simulation: {
      type: 'RATIO_LAB',
      title: 'Simulator Kendali Duty Cycle PWM Motor DC',
      parameterLabel: 'Duty Cycle PWM',
      unit: '%',
      min: 10,
      max: 100,
      step: 10,
      defaultValue: 40,
      targetValue: 80,
      formulaDisplay: 'V_out = 80% × 5V = 4.0 Volt Efektif',
      explanation:
        'Naikkan Duty Cycle PWM ke 80% untuk menghasilkan tegangan kerja efektif 4,0 Volt pada motor.',
    },
  },
  {
    id: 'smk-lvl-4',
    levelNumber: 4,
    title: 'Projek Kreatif, Kewirausahaan & Bisnis Digital SMK',
    subtitle: 'Perhitungan Harga Pokok Produksi (HPP), Break-Even Point (BEP), dan pemasaran digital',
    subject: 'Projek Kreatif & Kewirausahaan (PKK) SMK',
    educationLevel: EducationLevel.SMK,
    classRange: 'Kelas 11 - 12 SMK',
    xpReward: 110,
    estimatedMinutes: 18,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Dasar-Dasar Pemasaran & Projek Kreatif Kewirausahaan SMK/MAK',
      authorOrPublisher: 'Aris Purwantinah dkk. — Pusat Perbukuan BSKAP Kemendikdasmen RI',
      year: '2022',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
    },
    summaryPoints: [
      'Titik Impas / Break-Even Point (BEP) tercapai ketika total pendapatan sama dengan total biaya (Laba Bersih = 0).',
      'Rumus BEP Unit = Biaya Tetap (Fixed Cost) / (Harga Jual per Unit - Biaya Variabel per Unit).',
      'Inovasi produk vokasi menggabungkan kualitas teknis, solusi masalah pelanggan, dan kemasan nilai jual.',
    ],
    practiceQuestion: {
      question:
        'Sebuah tim wirausaha siswa SMK memiliki biaya tetap produksi Rp500.000. Jika biaya variabel per produk Rp15.000 dan harga jual Rp25.000, berapa unit minimal harus terjual agar mencapai BEP (Titik Impas)?',
      options: ['25 unit', '50 unit', '75 unit', '100 unit'],
      correctIndex: 1,
      explanation:
        'Margin kontribusi per unit = Rp25.000 - Rp15.000 = Rp10.000. BEP Unit = Rp500.000 / Rp10.000 = 50 unit.',
    },
    simulation: {
      type: 'ALGEBRA_BALANCE',
      title: 'Simulator Titik Impas (BEP) Produksi Siswa SMK',
      parameterLabel: 'Jumlah Produk Terjual',
      unit: 'unit',
      min: 10,
      max: 100,
      step: 10,
      defaultValue: 30,
      targetValue: 50,
      formulaDisplay: 'BEP = 500.000 / (25.000 - 15.000) = 50 Unit',
      explanation:
        'Geser jumlah penjualan ke 50 unit untuk mencapai titik impas (Break-Even Point).',
    },
  },

  // ================= UMUM / RANDOM =================
  {
    id: 'umum-lvl-1',
    levelNumber: 1,
    title: 'English Slang, Idioms & Academic Vocabulary',
    subtitle: 'Menguasai kosakata formal, phrasal verbs, dan ekspresi natural masa kini',
    subject: 'Bahasa Inggris & Komunikasi Global',
    educationLevel: EducationLevel.UMUM,
    classRange: 'Semua Kalangan',
    xpReward: 90,
    estimatedMinutes: 15,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Bahasa Inggris: Work in Progress & English for Change (Kurikulum Merdeka)',
      authorOrPublisher: 'Budi Hermawan dkk. — Pusat Perbukuan Kemendikbudristek RI',
      year: '2022',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
    },
    summaryPoints: [
      'Academic vocabulary (analyze, hypothesis, concept, significant) digunakan pada penulisan esai dan presentasi ilmiah.',
      'Phrasal verbs & idioms (figure out, break the ice, hit the books) membuat percakapan terdengar natural.',
      'Slang positif modern (vibe, chill, lowkey, highkey, tbh) dipakai pada obrolan santai sehari-hari.',
    ],
    practiceQuestion: {
      question:
        'Dalam konteks akademik Bahasa Inggris, kata kerja manakah yang paling tepat menggantikan frasa "look closely at data to understand it"?',
      options: ['Analyze', 'Ignore', 'Postpone', 'Guess'],
      correctIndex: 0,
      explanation:
        '"Analyze" adalah kosakata akademik formal yang berarti memeriksa data atau konsep secara mendalam dan sistematis.',
    },
    simulation: {
      type: 'CYBER_CIPHER',
      title: 'Eksplorasi Kekayaan Kosakata Indonesia & Inggris',
      parameterLabel: 'Level Penguasaan Kosakata',
      unit: 'tier',
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 4,
      targetValue: 8,
      formulaDisplay: 'Mastery = Tier 8 (Baku + Gaul + Academic English)',
      explanation:
        'Geser penguasaan kosakata ke Tier 8 untuk menggabungkan ragam baku, slang positif, dan istilah akademik.',
    },
  },
  {
    id: 'umum-lvl-2',
    levelNumber: 2,
    title: 'Teknik Belajar Efektif, Memory Palace & Manajemen Waktu',
    subtitle: 'Trik menghafal cepat dengan Jembatan Keledai, Pomodoro, dan Active Recall',
    subject: 'Strategi Belajar & Produktivitas',
    educationLevel: EducationLevel.UMUM,
    classRange: 'Semua Kalangan',
    xpReward: 95,
    estimatedMinutes: 15,
    isUnlocked: true,
    isCompleted: false,
    bookSource: {
      title: 'Panduan Pembelajaran dan Asesmen Kurikulum Merdeka',
      authorOrPublisher: 'BSKAP Kemendikbudristek RI',
      year: '2022',
      catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
    },
    summaryPoints: [
      'Jembatan Keledai (Mnemonic) mengubah daftar rumit menjadi kalimat unik yang mudah diingat otak.',
      'Teknik Pomodoro (25 menit fokus belajar + 5 menit istirahat) menjaga fokus tanpa bikin burnout.',
      'Active Recall & Analogi cerita membantu memindahkan materi dari memori jangka pendek ke jangka panjang.',
    ],
    practiceQuestion: {
      question:
        'Manakah contoh penerapan teknik Jembatan Keledai (Mnemonic) yang paling tepat untuk menghafal warna pelangi?',
      options: [
        'MEJIKUHIBINIU (Merah, Jingga, Kuning, Hijau, Biru, Nila, Ungu)',
        'Membaca buku tanpa henti selama 6 jam berturut-turut',
        'Menghafal nomor halaman buku saja tanpa membaca isinya',
        'Menyalin seluruh isi buku teks secara acak',
      ],
      correctIndex: 0,
      explanation:
        'MEJIKUHIBINIU adalah akronim jembatan keledai klasik yang merangkum urutan spektrum warna pelangi.',
    },
    simulation: {
      type: 'RATIO_LAB',
      title: 'Simulator Siklus Fokus Belajar Pomodoro',
      parameterLabel: 'Durasi Fokus Efektif',
      unit: 'menit',
      min: 10,
      max: 50,
      step: 5,
      defaultValue: 15,
      targetValue: 25,
      formulaDisplay: 'Pomodoro Ideal = 25 Menit Fokus + 5 Menit Chill',
      explanation:
        'Atur durasi fokus pada 25 menit sesuai standar teknik Pomodoro agar otak tetap segar.',
    },
  },
];

export const CODING_LESSONS: CodingLessonItem[] = [
  {
    id: 'code-js-1',
    title: 'Dasar Logika JavaScript: Variabel, Fungsi & Perhitungan',
    language: 'JavaScript',
    levelTag: 'Pemula (SMP / SMA / SMK)',
    summary:
      'Memahami cara mendeklarasikan variabel dengan const/let, membuat fungsi reusable, dan menampilkan hasil ke konsol.',
    starterCode: `// Hitung total XP belajar siswa dalam seminggu
function hitungTotalXp(modulSelesai, bonusHarian) {
  const xpPerModul = 50;
  const total = (modulSelesai * xpPerModul) + bonusHarian;
  return total;
}

const hasil = hitungTotalXp(4, 30);
console.log("Total XP Minggu Ini:", hasil, "XP");`,
    expectedExplanation:
      'Fungsi hitungTotalXp mengalikan jumlah modul selesai dengan 50 XP lalu menambahkan bonus harian.',
    sampleOutput: 'Total XP Minggu Ini: 230 XP',
    challengePrompt:
      'Coba ubah angka parameter pada hitungTotalXp(4, 30) menjadi (6, 50) lalu klik Jalankan Kode!',
    xpReward: 45,
    bookReference: {
      title: 'Eloquent JavaScript (4th Edition) — Chapter 1 & 3: Values & Functions',
      author: 'Marijn Haverbeke (No Starch Press)',
      url: 'https://eloquentjavascript.net/',
    },
  },
  {
    id: 'code-py-1',
    title: 'Pemrograman Python: List, Perulangan & Analisis Nilai Siswa',
    language: 'Python',
    levelTag: 'Menengah (SMP / SMA / SMK)',
    summary:
      'Menggunakan struktur data List dan fungsi bawaan Python untuk menghitung rata-rata serta menyaring nilai di atas KKM.',
    starterCode: `# Analisis daftar nilai ujian Informatika
nilai_siswa = [78, 85, 92, 88, 95]
rata_rata = sum(nilai_siswa) / len(nilai_siswa)
lulus_istimewa = [n for n in nilai_siswa if n >= 85]

print(f"Rata-rata Kelas: {rata_rata:.1f}")
print(f"Nilai >= 85: {lulus_istimewa}")`,
    expectedExplanation:
      'Python memudahkan pengolahan data menggunakan fungsi sum(), len(), dan teknik List Comprehension.',
    sampleOutput: 'Rata-rata Kelas: 87.6\nNilai >= 85: [85, 92, 88, 95]',
    challengePrompt:
      'Tambahkan nilai baru 100 ke dalam list nilai_siswa lalu amati perubahan nilai rata-ratanya!',
    xpReward: 50,
    bookReference: {
      title: 'Automate the Boring Stuff with Python & Python Official Tutorial',
      author: 'Al Sweigart / Python Software Foundation',
      url: 'https://automatetheboringstuff.com/',
    },
  },
  {
    id: 'code-web-1',
    title: 'Web Modern: Struktur HTML5 Semantik & Flexbox CSS',
    language: 'HTML & CSS',
    levelTag: 'Semua Jenjang (SD Kelas Atas – SMK)',
    summary:
      'Merancang komponen kartu profil responsif menggunakan elemen HTML5 semantik dan tata letak CSS Flexbox.',
    starterCode: `<article class="kartu-belajar">
  <h2>Room Belajar Mimi V15</h2>
  <p>Belajar terarah dengan modul buku resmi & coding interaktif.</p>
  <button>Mulai Eksplorasi</button>
</article>

/* CSS */
.kartu-belajar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: 16px;
}`,
    expectedExplanation:
      'Tag <article>, <h2>, <p>, dan <button> memberikan arti semantik yang jelas serta mudah diatur dengan Flexbox.',
    sampleOutput:
      '[Pratinjau DOM Aktif] Komponen <article class="kartu-belajar"> berhasil dirender dengan tata letak flex column (gap: 12px).',
    challengePrompt:
      'Ubah teks di dalam elemen <h2> atau <p> sesuai nama proyek web impianmu lalu jalankan pratinjau!',
    xpReward: 40,
    bookReference: {
      title: 'MDN Web Docs — Structuring the Web with HTML & CSS Layout',
      author: 'Mozilla Developer Network',
      url: 'https://developer.mozilla.org/en-US/docs/Learn',
    },
  },
  {
    id: 'code-ts-1',
    title: 'Full-Stack SMK PPLG: Fetch REST API & Async/Await TypeScript',
    language: 'TypeScript & Web API',
    levelTag: 'Mahir (SMA & SMK PPLG/TJKT)',
    summary:
      'Mengambil data katalog buku secara asinkron menggunakan async/await dan mendefinisikan tipe interface TypeScript.',
    starterCode: `interface BukuKurikulum {
  judul: string;
  jenjang: 'SD' | 'SMP' | 'SMA' | 'SMK';
  halaman: number;
}

async function muatBukuResmi(buku: BukuKurikulum) {
  return \`Buku "\${buku.judul}" (\${buku.jenjang}) siap diunduh (\${buku.halaman} hlm).\`;
}

muatBukuResmi({
  judul: "Dasar-Dasar PPLG Kelas X",
  jenjang: "SMK",
  halaman: 248
}).then(console.log);`,
    expectedExplanation:
      'TypeScript menjamin keamanan tipe data (type-safety) pada objek buku sebelum diproses oleh fungsi async.',
    sampleOutput:
      'Buku "Dasar-Dasar PPLG Kelas X" (SMK) siap diunduh (248 hlm).',
    challengePrompt:
      'Ubah properti judul atau jenjang pada pemanggilan muatBukuResmi lalu uji hasilnya!',
    xpReward: 60,
    bookReference: {
      title: 'Dasar-Dasar Pengembangan Perangkat Lunak dan Gim (PPLG) Kelas X SMK',
      author: 'Pusat Perbukuan Kemendikdasmen RI',
      url: KEMENDIKDASMEN_CATALOG_URL,
    },
  },
];

export const CODING_RESOURCE_BOOKS: CodingResourceBook[] = [
  {
    id: 'book-code-1',
    title: 'Dasar-Dasar Pengembangan Perangkat Lunak dan Gim (PPLG) Kelas X SMK/MAK',
    author: 'Okta Purnawirawan, dkk.',
    publisher: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
    category: 'Buku Resmi SMK / Kurikulum Merdeka',
    description:
      'Buku teks utama resmi Kemendikdasmen untuk siswa SMK jurusan Rekayasa Perangkat Lunak / PPLG mencakup algoritma, basis data, dan pengembangan web.',
    url: KEMENDIKDASMEN_CATALOG_URL,
  },
  {
    id: 'book-code-2',
    title: 'Informatika untuk SMP/MTs & SMA/MA (Kelas VII – XII)',
    author: 'Tim Penulis Informatika Kemendikdasmen',
    publisher: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
    category: 'Buku Resmi SMP & SMA',
    description:
      'Seri buku resmi Informatika Kurikulum Merdeka yang membahas berpikir komputasional, algoritma pemrograman, analisis data, dan dampak sosial informatika.',
    url: KEMENDIKDASMEN_CATALOG_URL,
  },
  {
    id: 'book-code-3',
    title: 'Eloquent JavaScript, 4th Edition (2024): A Modern Introduction to Programming',
    author: 'Marijn Haverbeke',
    publisher: 'No Starch Press (Open Access Book)',
    category: 'JavaScript & Web Modern',
    description:
      'Buku pemrograman JavaScript legendaris yang sudah terbit secara internasional dan dapat dibaca gratis secara penuh di web resminya.',
    url: 'https://eloquentjavascript.net/',
  },
  {
    id: 'book-code-4',
    title: 'Automate the Boring Stuff with Python (2nd Edition)',
    author: 'Al Sweigart',
    publisher: 'No Starch Press (Open Access)',
    category: 'Python & Otomasi Praktis',
    description:
      'Buku panduan Python terpopuler untuk pemula hingga menengah yang mengajarkan dasar Python lewat proyek nyata yang seru dan aplikatif.',
    url: 'https://automatetheboringstuff.com/',
  },
  {
    id: 'book-code-5',
    title: 'MDN Web Docs — Kurikulum Belajar Web Developer (HTML, CSS, JS)',
    author: 'Mozilla Developer Network',
    publisher: 'Mozilla Foundation',
    category: 'Dokumentasi & Modul Web Standar',
    description:
      'Referensi utama para pengembang web dunia untuk mempelajari HTML5, CSS3, DOM JavaScript, dan Web API secara terstruktur.',
    url: 'https://developer.mozilla.org/en-US/docs/Learn',
  },
  {
    id: 'book-code-6',
    title: 'CS50x: Introduction to Computer Science',
    author: 'Prof. David J. Malan',
    publisher: 'Harvard University OpenCourseWare',
    category: 'Ilmu Komputer & Algoritma',
    description:
      'Materi kuliah pengantar ilmu komputer dari Harvard University yang mencakup C, Python, SQL, HTML/CSS/JS, dan struktur data.',
    url: 'https://cs50.harvard.edu/x/',
  },
];

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  // SD
  {
    id: 'q-sd-1',
    educationLevel: EducationLevel.SD,
    classLabel: 'Kelas 4',
    subject: 'Matematika',
    question:
      'Sebuah taman berbentuk persegi memiliki panjang sisi 12 meter. Berapakah keliling taman tersebut?',
    options: ['24 meter', '36 meter', '48 meter', '144 meter'],
    correctIndex: 2,
    explanation: 'Keliling persegi adalah 4 × sisi = 4 × 12 meter = 48 meter.',
    xpReward: 30,
  },
  {
    id: 'q-sd-2',
    educationLevel: EducationLevel.SD,
    classLabel: 'Kelas 5',
    subject: 'IPAS (Sains)',
    question:
      'Bagian tumbuhan yang berfungsi menyerap air dan mineral dari dalam tanah lalu mengangkutnya melalui pembuluh xilem adalah...',
    options: ['Daun', 'Akar', 'Bunga', 'Biji'],
    correctIndex: 1,
    explanation:
      'Akar menyerap air dan zat hara dari tanah untuk diteruskan ke batang dan daun melalui pembuluh kayu (xilem).',
    xpReward: 30,
  },
  {
    id: 'q-sd-3',
    educationLevel: EducationLevel.SD,
    classLabel: 'Kelas 6',
    subject: 'Matematika',
    question:
      'Hasil dari 3/4 + 1/2 dalam bentuk pecahan paling sederhana adalah...',
    options: ['4/6', '5/4', '3/8', '7/4'],
    correctIndex: 1,
    explanation: 'Samakan penyebut menjadi 4: 3/4 + 2/4 = 5/4 (atau 1 1/4).',
    xpReward: 35,
  },
  {
    id: 'q-sd-4',
    educationLevel: EducationLevel.SD,
    classLabel: 'Kelas 5',
    subject: 'Bahasa Indonesia',
    question:
      'Gagasan utama yang menjadi inti pembahasan dalam sebuah paragraf disebut...',
    options: [
      'Ide pokok',
      'Kalimat sapaan',
      'Daftar isi',
      'Kata penghubung',
    ],
    correctIndex: 0,
    explanation:
      'Ide pokok adalah gagasan utama yang mendasari keseluruhan isi sebuah paragraf.',
    xpReward: 35,
  },

  // SMP
  {
    id: 'q-smp-1',
    educationLevel: EducationLevel.SMP,
    classLabel: 'Kelas 7',
    subject: 'Matematika Aljabar',
    question:
      'Penyelesaian dari persamaan linear 5(x - 2) = 3x + 4 adalah...',
    options: ['x = 5', 'x = 6', 'x = 7', 'x = 8'],
    correctIndex: 2,
    explanation: '5x - 10 = 3x + 4 ⇒ 2x = 14 ⇒ x = 7.',
    xpReward: 40,
  },
  {
    id: 'q-smp-2',
    educationLevel: EducationLevel.SMP,
    classLabel: 'Kelas 8',
    subject: 'IPA Fisika',
    question:
      'Sebuah benda bermassa 4 kg bergerak dengan percepatan 3 m/s². Besar resultan gaya yang bekerja pada benda adalah...',
    options: ['7 N', '12 N', '16 N', '24 N'],
    correctIndex: 1,
    explanation: 'Sesuai Hukum II Newton: ΣF = m × a = 4 kg × 3 m/s² = 12 N.',
    xpReward: 40,
  },
  {
    id: 'q-smp-3',
    educationLevel: EducationLevel.SMP,
    classLabel: 'Kelas 9',
    subject: 'Informatika',
    question: 'Berapakah nilai desimal dari bilangan biner 10110₂?',
    options: ['18', '20', '22', '26'],
    correctIndex: 2,
    explanation:
      '10110₂ = (1×16) + (0×8) + (1×4) + (1×2) + (0×1) = 16 + 4 + 2 = 22.',
    xpReward: 45,
  },
  {
    id: 'q-smp-4',
    educationLevel: EducationLevel.SMP,
    classLabel: 'Kelas 8',
    subject: 'IPA Biologi',
    question:
      'Pembuluh angkut pada tumbuhan yang bertugas mengedarkan hasil fotosintesis (glukosa) dari daun ke seluruh bagian tubuh tumbuhan adalah...',
    options: ['Xilem', 'Floem', 'Epidermis', 'Kambium'],
    correctIndex: 1,
    explanation:
      'Floem (pembuluh tapis) mengangkut hasil fotosintesis dari daun ke seluruh jaringan tumbuhan.',
    xpReward: 40,
  },

  // SMA
  {
    id: 'q-sma-1',
    educationLevel: EducationLevel.SMA,
    classLabel: 'Kelas 11',
    subject: 'Matematika Kalkulus',
    question:
      'Turunan pertama dari fungsi f(x) = 4x³ - 6x² + 5x - 9 pada titik x = 2 adalah...',
    options: ['21', '25', '29', '33'],
    correctIndex: 2,
    explanation:
      "f'(x) = 12x² - 12x + 5. Substitusi x = 2: f'(2) = 12(4) - 12(2) + 5 = 48 - 24 + 5 = 29.",
    xpReward: 50,
  },
  {
    id: 'q-sma-2',
    educationLevel: EducationLevel.SMA,
    classLabel: 'Kelas 12',
    subject: 'Informatika',
    question:
      'Kompleksitas waktu algoritma pencarian biner (Binary Search) pada array terurut berukuran n elemen adalah...',
    options: ['O(n²)', 'O(n)', 'O(log n)', 'O(2^n)'],
    correctIndex: 2,
    explanation:
      'Binary search membagi dua ruang pencarian di setiap langkah sehingga memiliki kompleksitas waktu logaritmik O(log n).',
    xpReward: 55,
  },
  {
    id: 'q-sma-3',
    educationLevel: EducationLevel.SMA,
    classLabel: 'Kelas 11',
    subject: 'Kimia Fisik',
    question:
      'Pada reaksi kesetimbangan eksoterm N₂(g) + 3H₂(g) ⇌ 2NH₃(g) (ΔH = -92 kJ), tindakan yang akan menggeser kesetimbangan ke arah pembentukan amonia (NH₃) adalah...',
    options: [
      'Menaikkan suhu sistem secara drastis',
      'Menurunkan suhu dan memperbesar tekanan sistem',
      'Memperkecil tekanan dan memperbesar volume',
      'Mengurangi konsentrasi gas N₂',
    ],
    correctIndex: 1,
    explanation:
      'Karena reaksi ke kanan bersifat eksoterm dan memiliki jumlah mol gas lebih kecil (2 mol vs 4 mol), penurunan suhu dan peningkatan tekanan menggeser kesetimbangan ke kanan (NH₃).',
    xpReward: 55,
  },
  {
    id: 'q-sma-4',
    educationLevel: EducationLevel.SMA,
    classLabel: 'Kelas 12',
    subject: 'Fisika Modern',
    question:
      'Sebuah partikel bergerak dengan momentum p. Menurut hipotesis de Broglie, panjang gelombang partikel tersebut memenuhi persamaan...',
    options: ['λ = h · p', 'λ = h / p', 'λ = p / h', 'λ = h · c²'],
    correctIndex: 1,
    explanation:
      'Panjang gelombang de Broglie dirumuskan sebagai λ = h / p = h / (m·v), di mana h adalah konstanta Planck.',
    xpReward: 50,
  },

  // SMK
  {
    id: 'q-smk-1',
    educationLevel: EducationLevel.SMK,
    classLabel: 'Kelas 10 SMK',
    subject: 'PPLG / Pemrograman Web',
    question:
      'Dalam pengembangan web modern, perintah SQL manakah yang digunakan untuk mengambil seluruh baris data dari tabel "buku_kurikulum"?',
    options: [
      'SELECT * FROM buku_kurikulum;',
      'UPDATE buku_kurikulum SET *; ',
      'DELETE FROM buku_kurikulum;',
      'INSERT INTO buku_kurikulum VALUES (*);',
    ],
    correctIndex: 0,
    explanation:
      'Pernyataan SELECT * FROM nama_tabel digunakan untuk membaca (query) seluruh kolom dari tabel pada database relasional.',
    xpReward: 50,
  },
  {
    id: 'q-smk-2',
    educationLevel: EducationLevel.SMK,
    classLabel: 'Kelas 11 SMK',
    subject: 'TJKT / Jaringan Komputer',
    question:
      'Lapisan pada model referensi OSI yang bertanggung jawab atas pengalamatan logis (IP Address) dan penentuan jalur routing paket antar jaringan adalah...',
    options: [
      'Physical Layer (Lapisan 1)',
      'Data Link Layer (Lapisan 2)',
      'Network Layer (Lapisan 3)',
      'Application Layer (Lapisan 7)',
    ],
    correctIndex: 2,
    explanation:
      'Network Layer (Layer 3 OSI) menangani pengalamatan IP dan proses routing paket data lintas jaringan.',
    xpReward: 55,
  },
  {
    id: 'q-smk-3',
    educationLevel: EducationLevel.SMK,
    classLabel: 'Kelas 11 SMK',
    subject: 'Teknik Elektronika & IoT',
    question:
      'Sebuah ADC 10-bit pada mikrokontroler memiliki rentang nilai pembacaan digital dari 0 hingga...',
    options: ['255', '511', '1023', '4095'],
    correctIndex: 2,
    explanation:
      'Resolusi ADC 10-bit menghasilkan 2^10 = 1024 tingkat nilai, yaitu dari 0 sampai 1023.',
    xpReward: 55,
  },
  {
    id: 'q-smk-4',
    educationLevel: EducationLevel.SMK,
    classLabel: 'Kelas 12 SMK',
    subject: 'Projek Kreatif & Kewirausahaan',
    question:
      'Biaya yang jumlah totalnya tetap tidak berubah meskipun volume produksi bertambah atau berkurang dalam kapasitas tertentu disebut...',
    options: [
      'Biaya Variabel (Variable Cost)',
      'Biaya Tetap (Fixed Cost)',
      'Harga Pokok Penjualan',
      'Laba Kotor',
    ],
    correctIndex: 1,
    explanation:
      'Biaya Tetap (Fixed Cost) seperti sewa tempat atau penyusutan alat tidak bergantung langsung pada jumlah unit yang diproduksi.',
    xpReward: 50,
  },

  // UMUM / RANDOM
  {
    id: 'q-umum-1',
    educationLevel: EducationLevel.UMUM,
    classLabel: 'Eksplorasi Umum',
    subject: 'Strategi Belajar & Mnemonic',
    question:
      'Teknik mengingat daftar konsep dengan cara merangkai suku kata awal menjadi kata unik yang mudah diingat (seperti MEJIKUHIBINIU) disebut...',
    options: [
      'Jembatan Keledai (Mnemonic)',
      'Kalkulasi Diferensial',
      'Reduksi Oksidasi',
      'Kompilasi Biner',
    ],
    correctIndex: 0,
    explanation:
      'Jembatan keledai (mnemonic) membantu otak mengaitkan informasi baru menggunakan akronim atau asosiasi unik.',
    xpReward: 45,
  },
  {
    id: 'q-umum-2',
    educationLevel: EducationLevel.UMUM,
    classLabel: 'Bahasa Inggris & Slang',
    subject: 'English Vocabulary',
    question:
      'Dalam Bahasa Inggris, idiom "hit the books" memiliki arti yang paling tepat yaitu...',
    options: [
      'Memukul buku secara fisik',
      'Mulai belajar dengan sungguh-sungguh',
      'Menjual buku di toko',
      'Menutup buku karena mengantuk',
    ],
    correctIndex: 1,
    explanation:
      'Idiom "hit the books" berarti belajar dengan serius (biasanya menjelang ujian atau mengerjakan tugas).',
    xpReward: 45,
  },
];

export const INITIAL_BADGES: BadgeItem[] = [
  {
    id: 'badge-first-login',
    title: 'Langkah Pertama di Room Belajar',
    description: 'Berhasil bergabung ke Room Belajar bersama Mimi V15.',
    iconName: 'ShieldCheck',
    category: 'EKSPLORASI',
    xpBonus: 50,
    isUnlocked: true,
    progress: 1,
    maxProgress: 1,
    unlockedAt: 'Hari ini',
  },
  {
    id: 'badge-module-master',
    title: 'Penjelajah Modul & Buku Resmi',
    description: 'Menyelesaikan minimal 2 modul buku Kemendikdasmen beserta simulasinya.',
    iconName: 'BookOpen',
    category: 'AKADEMIK',
    xpBonus: 100,
    isUnlocked: false,
    progress: 0,
    maxProgress: 2,
  },
  {
    id: 'badge-quiz-sharpshooter',
    title: 'Pemahaman Konsep Tajam',
    description: 'Menjawab minimal 4 soal latihan kuis dengan tepat.',
    iconName: 'Target',
    category: 'AKADEMIK',
    xpBonus: 120,
    isUnlocked: false,
    progress: 0,
    maxProgress: 4,
  },
  {
    id: 'badge-mimi-dialog',
    title: 'Sahabat Curhat & Diskusi Mimi V15',
    description: 'Ngobrol, curhat, atau berdiskusi bersama Mimi V15 sebanyak 3 kali.',
    iconName: 'MessageSquare',
    category: 'EKSPLORASI',
    xpBonus: 80,
    isUnlocked: false,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'badge-arena-champion',
    title: 'Bintang Tantangan Belajar',
    description: 'Memenangkan sesi uji konsep melawan teman tanding di menu Tantangan.',
    iconName: 'Swords',
    category: 'ARENA',
    xpBonus: 150,
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'badge-milestone-architect',
    title: 'Perancang Target Belajar',
    description: 'Mencatat 3 target belajar mandiri pada jurnal harianmu.',
    iconName: 'Compass',
    category: 'STREAK',
    xpBonus: 90,
    isUnlocked: false,
    progress: 1,
    maxProgress: 3,
  },
];

export const INITIAL_RIVALS: RivalProfile[] = [
  {
    id: 'rival-1',
    name: 'Bima Pratama',
    title: 'Teman Belajar Matematika & IPAS',
    school: 'SDN Nusantara 01',
    educationLevel: EducationLevel.SD,
    xp: 480,
    winRate: 74,
    specialty: 'Pecahan, Operasi Hitung & Sains Dasar',
    difficulty: 'Mudah',
    xpStake: 60,
  },
  {
    id: 'rival-2',
    name: 'Sinta Kirana',
    title: 'Partner Diskusi Fisika & Aljabar',
    school: 'SMP Negeri 15',
    educationLevel: EducationLevel.SMP,
    xp: 920,
    winRate: 82,
    specialty: 'Persamaan Linear, Hukum Newton & Logika',
    difficulty: 'Menengah',
    xpStake: 90,
  },
  {
    id: 'rival-3',
    name: 'Dimas Mahardika',
    title: 'Rekan Olimpiade Kalkulus & Sains',
    school: 'SMA Negeri 15',
    educationLevel: EducationLevel.SMA,
    xp: 1540,
    winRate: 89,
    specialty: 'Kalkulus Diferensial, Kimia & Fisika Modern',
    difficulty: 'Tinggi',
    xpStake: 125,
  },
  {
    id: 'rival-4',
    name: 'Reza Mahendra',
    title: 'Partner Coding PPLG & Jaringan TJKT',
    school: 'SMK Negeri 15 Vokasi',
    educationLevel: EducationLevel.SMK,
    xp: 1680,
    winRate: 87,
    specialty: 'Full-Stack Web, Python, Subnetting & IoT',
    difficulty: 'Tinggi',
    xpStake: 130,
  },
];

export const INITIAL_MILESTONES: LearningMilestone[] = [
  {
    id: 'ms-init-1',
    title: 'Mulai sesi belajar pertama di Room Belajar Mimi V15',
    xpGain: 35,
    createdAt: 'Hari ini',
    completed: true,
    category: 'Room Belajar',
  },
];

export function getSuggestedPromptsForLevel(
  level: EducationLevel,
  selectedClass: string,
  selectedSubject?: string
): string[] {
  const subj = selectedSubject || 'Matematika';
  if (level === EducationLevel.SD) {
    return [
      `Halo Mimi! ✨ Gimana kabarnya hari ini?`,
      `Mimi, kasih clue & analogi seru tentang Siklus Air di buku IPAS dong!`,
      `Mimi, pecah jadi 3 langkah + 3 opsi A/B/C buat soal pecahan 3/4 + 1/2 yuk!`,
      `Mimi Profesor, kasih aku jembatan keledai biar cepat hafal materi ${subj} (${selectedClass})!`,
      `Mimi, ajarin peribahasa Indonesia & sapaan bahasa daerah Nusantara yang seru dong!`,
    ];
  }
  if (level === EducationLevel.SMP) {
    return [
      `Halo bestie Mimi! ✨ Ada cerita seru apa hari ini?`,
      `Mimi, pecah 3 langkah + 3 opsi A/B/C buat soal Matematika 4x - 7 = 21 dong!`,
      `Kasih clue, sumber buku Kemendikbud, & analogi seru tentang Fotosintesis Kelas 8!`,
      `Mimi Profesor, bagi hack trik hafal & jembatan keledai buat mapel ${subj} (${selectedClass})!`,
      `Spill kosakata English slang, idiom keren, & ungkapan bahasa daerah Nusantara dong!`,
    ];
  }
  if (level === EducationLevel.SMK) {
    return [
      `Halo Mimi! Gasskeun temenin aku bahas materi praktik ${selectedClass} yuk 🚀`,
      `Kasih clue, sumber buku Kemendikbud, & analogi gokil tentang Frontend vs Backend PPLG!`,
      `Pecah 3 langkah + 3 opsi A/B/C buat hitung Matematika BEP usaha SMK dong!`,
      `Mimi Profesor, kasih hack trik hafal cepat buat materi ${subj} (${selectedClass})!`,
      `Kasih aku daftar English idioms & academic vocabulary buat dunia kerja/vokasi!`,
    ];
  }
  if (level === EducationLevel.UMUM) {
    return [
      `Halo bestie Mimi! Hari ini rasanya agak capek, pengen curhat santai dong 💜`,
      `Kasih aku racikan English slang, idiom, academic vocabulary, & ungkapan Nusantara!`,
      `Mimi Profesor, ajarin teknik Memory Palace & jembatan keledai biar gak gampang lupa!`,
      `Kumaha damang Mimi? Ngobrol santai soal hobi, musik, dan motivasi hari ini yuk!`,
      `Ajarin konsep dasar belajar coding dari nol pakai analogi sehari-hari dong!`,
    ];
  }
  return [
    `Halo bestie Mimi! ✨ Temenin aku belajar ${subj} (${selectedClass}) hari ini yuk!`,
    `Mimi, pecah 3 langkah + 3 opsi A/B/C buat cari titik stasioner f(x) = 3x² - 12x + 9`,
    `Kasih clue, sumber buku Kemendikbud, & analogi seru buat materi ${subj} ${selectedClass}!`,
    `Mimi Profesor, kasih hack trik hafal & mnemonic keren buat ${subj} (${selectedClass})!`,
    `Spill English academic vocabulary, idiom, & peribahasa buat esai SMA dong!`,
  ];
}
