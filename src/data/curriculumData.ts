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
    'Umum',
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
    'Pengetahuan Umum',
    'Bahasa Inggris Umum',
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

interface SubjectUnitBlueprint {
  title: string;
  subtitle: string;
  bookTitle: string;
  bookAuthor: string;
  summaryPoints: string[];
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  simTitle: string;
  simParam: string;
  simUnit: string;
  simMin: number;
  simMax: number;
  simStep: number;
  simDefault: number;
  simTarget: number;
  simFormula: string;
  simExplanation: string;
}

function getSubjectUnitBlueprints(
  educationLevel: EducationLevel,
  selectedClass: string,
  selectedSubject: string
): SubjectUnitBlueprint[] {
  const subjLower = selectedSubject.toLowerCase();
  const classNumMatch = selectedClass.match(/\d+/);
  const classNum = classNumMatch ? Number(classNumMatch[0]) : 1;

  // 0. LEVEL UMUM / RANDOM (HANYA 2 KATEGORI: Pengetahuan Umum & Bahasa Inggris Umum)
  if (educationLevel === EducationLevel.UMUM || subjLower.includes('pengetahuan umum')) {
    if (subjLower.includes('inggris') || subjLower.includes('english')) {
      return [
        {
          title: 'Cerdas Cermat Bahasa Inggris Umum: Idioms & Phrasal Verbs (HAGO Style)',
          subtitle: 'Menguasai ungkapan populer sehari-hari (Break a leg, Piece of cake, Figure out)',
          bookTitle: 'Database Cerdas Cermat Bahasa Inggris Umum Mimi V15',
          bookAuthor: 'Kurikulum & Kuis Interaktif Mimi V15',
          summaryPoints: [
            '"A piece of cake" berarti sesuatu yang sangat mudah dikerjakan.',
            '"Break a leg!" digunakan untuk mendoakan semoga sukses saat tampil atau ujian.',
            '"Figure out" berarti berhasil memahami atau menemukan solusi dari suatu teka-teki.',
          ],
          question: 'Jika sahabatmu berkata "This English challenge is a piece of cake!", apa arti ungkapan tersebut?',
          options: [
            'Tantangan tersebut sangat mudah diselesaikan',
            'Tantangan tersebut berhadiah kue ulang tahun',
            'Tantangan tersebut sangat rumit',
            'Tantangan tersebut ditunda besok',
          ],
          correctIndex: 0,
          explanation: 'Idiom "a piece of cake" berarti pekerjaan atau soal yang sangat mudah.',
          simTitle: 'Simulator Mastery Idiom & Phrasal Verbs HAGO',
          simParam: 'Skor Penguasaan Idiom',
          simUnit: 'poin',
          simMin: 20,
          simMax: 100,
          simStep: 20,
          simDefault: 60,
          simTarget: 100,
          simFormula: 'Idiom Mastery = 100 Poin (Natural Speaker)',
          simExplanation: 'Geser skor ke 100 poin untuk menuntaskan latihan idiom Bahasa Inggris Umum.',
        },
        {
          title: 'English Vocabulary, Synonyms & Antonyms (Millionaire Style)',
          subtitle: 'Lawan kata, persamaan kata, dan kosakata komunikasi global sehari-hari',
          bookTitle: 'Database Cerdas Cermat Bahasa Inggris Umum Mimi V15',
          bookAuthor: 'Kurikulum & Kuis Interaktif Mimi V15',
          summaryPoints: [
            'Antonim (lawan kata) populer: Ancient (kuno) >< Modern; Generous (dermawan) >< Stingy (pelit).',
            'Sinonim (persamaan kata) populer: Huge = Enormous (sangat besar); Smart = Intelligent / Clever.',
            'Seseorang yang fasih berbicara dua bahasa disebut "Bilingual".',
          ],
          question: 'Manakah antonim (lawan kata) yang paling tepat dari kata "Ancient" (Kuno)?',
          options: ['Modern', 'Antique', 'Old', 'Traditional'],
          correctIndex: 0,
          explanation: '"Ancient" berarti sangat kuno, sehingga lawan katanya adalah "Modern".',
          simTitle: 'Simulator Kosakata & Sinonim-Antonim Inggris',
          simParam: 'Level Kosakata Aktif',
          simUnit: 'tier',
          simMin: 1,
          simMax: 10,
          simStep: 1,
          simDefault: 5,
          simTarget: 9,
          simFormula: 'Vocab Tier 9 = Ready for Millionaire English Quiz',
          simExplanation: 'Atur ke Tier 9 untuk menguasai sinonim dan antonim Bahasa Inggris Umum.',
        },
      ];
    }

    return [
      {
        title: 'Cerdas Cermat Pengetahuan Umum: Sains, Hukum Newton & Fotosintesis (HAGO Style)',
        subtitle: 'Fakta sains populer, astronomi, tubuh manusia, dan fenomena alam sehari-hari',
        bookTitle: 'Ensiklopedia Cerdas Cermat Pengetahuan Umum Mimi V15',
        bookAuthor: 'Database Pengetahuan Internal Mimi V15',
        summaryPoints: [
          'Fotosintesis pada tumbuhan hijau menyerap Karbon Dioksida (CO₂) dan air dengan bantuan cahaya matahari untuk menghasilkan Glukosa dan Oksigen (O₂).',
          'Hukum I Newton (Inersia/Kelembaman) menjelaskan mengapa tubuh terdorong ke depan saat kendaraan direm mendadak.',
          'Jupiter adalah planet terbesar di Tata Surya, sedangkan Venus adalah planet terpanas karena efek rumah kaca atmosfernya.',
        ],
        question: 'Gas apakah yang dilepaskan oleh tumbuhan hijau saat proses fotosintesis dan sangat dibutuhkan manusia untuk bernapas?',
        options: ['Oksigen (O₂)', 'Karbon Dioksida (CO₂)', 'Helium (He)', 'Argon (Ar)'],
        correctIndex: 0,
        explanation: 'Fotosintesis menghasilkan glukosa dan melepaskan gas oksigen (O₂) ke udara.',
        simTitle: 'Simulator Cerdas Cermat Sains & Alam HAGO',
        simParam: 'Skor Wawasan Sains',
        simUnit: 'poin',
        simMin: 20,
        simMax: 100,
        simStep: 20,
        simDefault: 60,
        simTarget: 100,
        simFormula: 'Sains Populer = 100 Poin (Cerdas Cermat Master)',
        simExplanation: 'Geser skor ke 100 poin untuk menyelesaikan tantangan Sains Pengetahuan Umum.',
      },
      {
        title: 'Sejarah Nusantara, Perang Diponegoro & Geografi Dunia (Millionaire Style)',
        subtitle: 'Wawasan sejarah perjuangan bangsa Indonesia, sungai terpanjang, dan rekor dunia',
        bookTitle: 'Ensiklopedia Cerdas Cermat Pengetahuan Umum Mimi V15',
        bookAuthor: 'Database Pengetahuan Internal Mimi V15',
        summaryPoints: [
          'Perang Diponegoro (Perang Jawa 1825–1830) dipimpin oleh Pangeran Diponegoro (Raden Mas Ontowiryo) melawan pemerintah kolonial.',
          'Sungai Kapuas di Kalimantan Barat (1.143 km) adalah sungai terpanjang di Indonesia, dan Danau Toba di Sumatera Utara adalah danau vulkanik terbesar di dunia.',
          'Samudra Pasifik merupakan samudra terluas di permukaan Bumi.',
        ],
        question: 'Perang besar di Pulau Jawa pada tahun 1825–1830 yang dipimpin oleh Pangeran Ontowiryo dikenal sebagai...',
        options: ['Perang Diponegoro', 'Perang Padri', 'Perang Banjar', 'Perang Jagaraga'],
        correctIndex: 0,
        explanation: 'Pangeran Ontowiryo adalah nama kecil Pangeran Diponegoro yang memimpin Perang Jawa (1825–1830).',
        simTitle: 'Simulator Wawasan Nusantara & Dunia (Millionaire)',
        simParam: 'Tingkat Tantangan Kuis',
        simUnit: 'level',
        simMin: 1,
        simMax: 10,
        simStep: 1,
        simDefault: 5,
        simTarget: 10,
        simFormula: 'Level 10 = Grandmaster Pengetahuan Umum',
        simExplanation: 'Atur ke Level 10 untuk menuntaskan ekspedisi wawasan Nusantara dan dunia.',
      },
    ];
  }

  // 1. BAHASA INDONESIA (SD, SMP, SMA)
  if (subjLower.includes('indonesia')) {
    return [
      {
        title: `Ide Pokok, Kalimat Utama & Gagasan Pendukung (${selectedClass})`,
        subtitle: `Menemukan pikiran utama pada paragraf deduktif dan induktif ${selectedClass}`,
        bookTitle: `Bahasa Indonesia Kurikulum Merdeka untuk ${educationLevel} ${selectedClass}`,
        bookAuthor: 'Kurikulum Merdeka Indonesia — Edisi Terverifikasi Mimi V15',
        summaryPoints: [
          'Ide pokok adalah gagasan utama yang menjadi inti pembahasan dalam sebuah paragraf.',
          'Paragraf deduktif meletakkan kalimat utama di awal paragraf, sedangkan induktif di akhir paragraf.',
          'Kalimat penjelas berfungsi menguraikan rincian, bukti, atau contoh dari kalimat utama.',
        ],
        question:
          'Kalimat yang memuat gagasan utama dan menjadi dasar pengembangan seluruh paragraf disebut...',
        options: ['Kalimat Utama', 'Kalimat Sampingan', 'Kata Hubung', 'Kalimat Tanya'],
        correctIndex: 0,
        explanation:
          'Kalimat utama berisi ide pokok paragraf yang kemudian dijelaskan oleh kalimat-kalimat penjelas.',
        simTitle: 'Laboratorium Analisis Kepaduan Paragraf',
        simParam: 'Kepaduan Kalimat Penjelas',
        simUnit: 'poin',
        simMin: 1,
        simMax: 10,
        simStep: 1,
        simDefault: 5,
        simTarget: 9,
        simFormula: 'Paragraf Padu = 1 Ide Pokok + Kalimat Penjelas Koheren (Skor 9)',
        simExplanation:
          'Geser parameter kepaduan ke angka 9 untuk menyusun paragraf Bahasa Indonesia yang kohesif dan koheren.',
      },
      {
        title:
          educationLevel === EducationLevel.SMA || educationLevel === EducationLevel.SMK
            ? `Teks Argumentasi, Penalaran Kritis & Eksposisi (${selectedClass})`
            : `Struktur Teks Narasi, Deskripsi & Eksposisi (${selectedClass})`,
        subtitle:
          educationLevel === EducationLevel.SMA || educationLevel === EducationLevel.SMK
            ? `Menyusun tesis, tubuh argumen berbasis data faktual, serta membedakan fakta dan opini`
            : `Membedakan orientasi, komplikasi, resolusi, serta tesis dan argumentasi`,
        bookTitle: `Bahasa Indonesia Kurikulum Merdeka untuk ${educationLevel} ${selectedClass}`,
        bookAuthor: 'Kurikulum Merdeka Indonesia — Edisi Terverifikasi Mimi V15',
        summaryPoints:
          educationLevel === EducationLevel.SMA || educationLevel === EducationLevel.SMK
            ? [
                'Teks argumentasi bertujuan meyakinkan pembaca melalui Tesis (pendapat awal), Tubuh Argumen (data & fakta valid), dan Simpulan.',
                'Kalimat fakta memuat data objektif terukur, sedangkan opini berisi pandangan atau penilaian subjektif.',
                'Kohesi dan koherensi menjaga kepaduan antar-kalimat dalam esai argumentatif.',
              ]
            : [
                'Teks deskripsi menggambarkan objek secara rinci seolah pembaca melihat dan merasakan langsung.',
                'Teks narasi memiliki alur cerita: Orientasi (pengenalan), Komplikasi (puncak masalah), dan Resolusi (penyelesaian).',
                'Teks eksposisi memaparkan informasi ilmiah melalui Tesis, Argumentasi faktual, dan Penegasan Ulang.',
              ],
        question:
          educationLevel === EducationLevel.SMA || educationLevel === EducationLevel.SMK
            ? 'Bagian dalam struktur teks argumentasi yang memaparkan data, bukti ilmiah, dan fakta pendukung tesis disebut...'
            : 'Bagian dalam struktur teks narasi yang berisi munculnya permasalahan atau konflik antar tokoh disebut...',
        options:
          educationLevel === EducationLevel.SMA || educationLevel === EducationLevel.SMK
            ? ['Orientasi Fiksi', 'Tubuh Argumen', 'Koda Cerita', 'Abstrak']
            : ['Orientasi', 'Komplikasi', 'Resolusi', 'Koda'],
        correctIndex: 1,
        explanation:
          educationLevel === EducationLevel.SMA || educationLevel === EducationLevel.SMK
            ? 'Tubuh argumen berisi rangkaian alasan logis dan data faktual yang membuktikan kebenaran tesis.'
            : 'Komplikasi adalah bagian munculnya hingga memuncaknya masalah/konflik dalam cerita narasi.',
        simTitle: 'Simulator Struktur Alur & Argumen Teks Bahasa Indonesia',
        simParam: 'Kelengkapan Struktur Teks',
        simUnit: 'tahap',
        simMin: 1,
        simMax: 4,
        simStep: 1,
        simDefault: 2,
        simTarget: 4,
        simFormula: 'Struktur Utuh = Tesis/Orientasi + Argumen + Simpulan (4 Tahap)',
        simExplanation:
          'Atur kelengkapan struktur teks ke 4 tahap agar alur dan argumen tersusun utuh.',
      },
      {
        title: `Kaidah Kebahasaan, Kata Baku & EYD Edisi V (${selectedClass})`,
        subtitle: `Penggunaan huruf kapital, tanda baca, kata baku KBBI, dan kalimat efektif`,
        bookTitle: `Pedoman EYD V & Buku Bahasa Indonesia ${educationLevel} ${selectedClass}`,
        bookAuthor: 'Badan Bahasa & Pusat Perbukuan Kemendikdasmen RI',
        summaryPoints: [
          'Kalimat efektif memiliki subjek dan predikat yang jelas, hemat kata, serta sesuai kaidah EYD V.',
          'Contoh kata baku KBBI yang sering keliru: apotek (bukan apotik), praktik (bukan praktek), risiko (bukan resiko).',
          'Imbuhan di- ditulis serangkai untuk kata kerja pasif (dibaca), dan dipisah untuk kata depan penunjuk tempat (di sekolah).',
        ],
        question: 'Manakah penulisan kata baku yang tepat sesuai Kamus Besar Bahasa Indonesia (KBBI)?',
        options: [
          'Apotek, praktik, dan jadwal',
          'Apotik, praktek, dan jadual',
          'Apotek, praktek, dan jadual',
          'Apotik, praktik, dan jadwal',
        ],
        correctIndex: 0,
        explanation:
          'Sesuai KBBI dan EYD V, penulisan kata baku yang benar adalah apotek, praktik, dan jadwal.',
        simTitle: 'Uji Akurasi Kata Baku & Kalimat Efektif EYD V',
        simParam: 'Akurasi Ejaan Baku',
        simUnit: '%',
        simMin: 20,
        simMax: 100,
        simStep: 10,
        simDefault: 60,
        simTarget: 100,
        simFormula: 'EYD V Valid = 100% Kata Baku KBBI & Tanda Baca Tepat',
        simExplanation:
          'Naikkan akurasi ejaan ke 100% untuk memastikan seluruh kalimat memenuhi standar EYD Edisi V.',
      },
      {
        title: `Apresiasi Sastra: Puisi, Majas & Pesan Moral Cerita (${selectedClass})`,
        subtitle: `Mengenal majas metafora, personifikasi, hiperbola, serta amanat karya sastra`,
        bookTitle: `Bahasa Indonesia Kurikulum Merdeka untuk ${educationLevel} ${selectedClass}`,
        bookAuthor: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
        summaryPoints: [
          'Majas personifikasi memberikan sifat manusia pada benda mati (contoh: angin malam berbisik lembut).',
          'Majas metafora menggunakan perbandingan langsung (contoh: perpustakaan adalah gudang ilmu).',
          'Amanat adalah pesan moral atau pelajaran hidup yang ingin disampaikan penulis kepada pembaca.',
        ],
        question:
          'Kalimat "Daun-daun kelapa melambai-lambai menyambut pagi di tepi pantai" menggunakan gaya bahasa (majas)...',
        options: ['Personifikasi', 'Litotes', 'Ironi', 'Alegori'],
        correctIndex: 0,
        explanation:
          'Majas personifikasi mengumpamakan benda tak bernyawa (daun kelapa) seolah-olah bertingkah seperti manusia (melambai-lambai).',
        simTitle: 'Eksplorasi Diksi & Gaya Bahasa Sastra Nusantara',
        simParam: 'Kekuatan Imaji Puisi',
        simUnit: 'level',
        simMin: 1,
        simMax: 5,
        simStep: 1,
        simDefault: 3,
        simTarget: 5,
        simFormula: 'Puisi Indah = Diksi Tepat + Rima Selaras + Majas (Level 5)',
        simExplanation:
          'Geser kekuatan imaji ke Level 5 untuk memadukan diksi, rima, dan majas sastra Indonesia.',
      },
    ];
  }

  // 2. IPAS (SD) / IPA (SMP)
  if (subjLower.includes('ipas') || subjLower.includes('ipa')) {
    return [
      {
        title: `Siklus Air, Perubahan Wujud Zat & Energi (${selectedClass})`,
        subtitle: `Memahami evaporasi, kondensasi, presipitasi, dan konservasi energi di bumi`,
        bookTitle: `Ilmu Pengetahuan Alam dan Sosial (IPAS) ${educationLevel} ${selectedClass}`,
        bookAuthor: 'Amalia Fitri dkk. — Pusat Perbukuan Kemendikdasmen RI',
        summaryPoints: [
          'Evaporasi adalah proses penguapan air laut dan sungai akibat panas matahari.',
          'Kondensasi mengubah uap air di atmosfer menjadi titik-titik air pembentuk awan.',
          'Presipitasi (hujan) mengembalikan air ke permukaan bumi dan diserap tanah melalui infiltrasi.',
        ],
        question:
          'Proses berubahnya uap air di udara menjadi titik-titik air yang membentuk awan pada siklus hidrologi disebut...',
        options: ['Kondensasi', 'Evaporasi', 'Infiltrasi', 'Sublimasi'],
        correctIndex: 0,
        explanation:
          'Kondensasi adalah proses pengembunan uap air menjadi titik-titik air di atmosfer.',
        simTitle: 'Laboratorium Laju Siklus Hidrologi & Suhu Atmosfer',
        simParam: 'Suhu Penyinaran Matahari',
        simUnit: '°C',
        simMin: 20,
        simMax: 40,
        simStep: 2,
        simDefault: 26,
        simTarget: 32,
        simFormula: 'Laju Evaporasi Optimal = 32 °C (Keseimbangan Siklus Air)',
        simExplanation:
          'Atur suhu penyinaran matahari ke 32 °C untuk mengamati keseimbangan evaporasi dan kondensasi awan.',
      },
      {
        title: `Fotosintesis, Ekosistem & Rantai Makanan (${selectedClass})`,
        subtitle: `Hubungan produsen, konsumen, dekomposer, dan proses pembentukan glukosa tumbuhan`,
        bookTitle: `IPAS / IPA Kurikulum Merdeka untuk ${educationLevel} ${selectedClass}`,
        bookAuthor: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
        summaryPoints: [
          'Tumbuhan hijau berperan sebagai produsen karena mampu membuat makanan sendiri melalui fotosintesis.',
          'Fotosintesis membutuhkan cahaya matahari, klorofil, air (H2O), dan karbon dioksida (CO2) untuk menghasilkan glukosa dan oksigen (O2).',
          'Dekomposer (pengurai seperti jamur dan bakteri) menguraikan sisa makhluk hidup menjadi unsur hara tanah.',
        ],
        question: 'Gas utama yang dihasilkan tumbuhan saat fotosintesis dan sangat dibutuhkan manusia untuk bernapas adalah...',
        options: ['Oksigen (O2)', 'Karbon Dioksida (CO2)', 'Nitrogen (N2)', 'Metana'],
        correctIndex: 0,
        explanation:
          'Fotosintesis menghasilkan glukosa sebagai cadangan makanan dan melepaskan gas Oksigen (O2) ke udara.',
        simTitle: 'Simulator Intensitas Cahaya & Laju Fotosintesis',
        simParam: 'Intensitas Cahaya',
        simUnit: 'lux',
        simMin: 100,
        simMax: 1000,
        simStep: 100,
        simDefault: 400,
        simTarget: 800,
        simFormula: '6CO2 + 6H2O + Cahaya (800 lux) -> C6H12O6 + 6O2',
        simExplanation:
          'Geser intensitas cahaya ke 800 lux untuk mencapai laju produksi oksigen fotosintesis yang optimal.',
      },
      {
        title: `Gaya, Gerak, Pesawat Sederhana & Magnet (${selectedClass})`,
        subtitle: `Pengaruh gaya terhadap gerak benda, gaya gesek, gravitasi, dan sifat kutub magnet`,
        bookTitle: `IPAS / IPA Kurikulum Merdeka untuk ${educationLevel} ${selectedClass}`,
        bookAuthor: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
        summaryPoints: [
          'Gaya adalah tarikan atau dorongan yang dapat mengubah bentuk, arah, dan kecepatan gerak benda.',
          'Kutub magnet yang senama (Utara–Utara) akan tolak-menolak, sedangkan kutub tidak senama (Utara–Selatan) tarik-menarik.',
          'Pesawat sederhana (tuas, bidang miring, katrol) memudahkan pekerjaan manusia dengan melipatgandakan gaya.',
        ],
        question: 'Apa yang terjadi apabila kutub Utara magnet didekatkan dengan kutub Selatan magnet lainnya?',
        options: [
          'Saling tarik-menarik',
          'Saling tolak-menolak',
          'Kehilangan sifat magnet',
          'Meleleh seketika',
        ],
        correctIndex: 0,
        explanation:
          'Dua kutub magnet yang berbeda jenis (Utara dan Selatan) akan saling tarik-menarik.',
        simTitle: 'Simulator Resultan Gaya & Percepatan Benda',
        simParam: 'Gaya Dorong (F)',
        simUnit: 'N',
        simMin: 10,
        simMax: 100,
        simStep: 10,
        simDefault: 30,
        simTarget: 60,
        simFormula: 'F = 60 N pada m = 15 kg -> a = 4 m/s²',
        simExplanation:
          'Atur gaya dorong ke 60 N agar benda bermassa 15 kg bergerak dengan percepatan 4 m/s².',
      },
      {
        title: `Sistem Organ Tubuh & Penjelajahan Tata Surya (${selectedClass})`,
        subtitle: `Organ pernapasan, pencernaan manusia, serta rotasi dan revolusi planet`,
        bookTitle: `IPAS / IPA Kurikulum Merdeka untuk ${educationLevel} ${selectedClass}`,
        bookAuthor: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
        summaryPoints: [
          'Pertukaran gas oksigen (O2) dan karbon dioksida (CO2) di dalam paru-paru terjadi pada gelembung alveolus.',
          'Rotasi bumi pada porosnya menyebabkan terjadinya siang dan malam serta gerak semu harian matahari.',
          'Revolusi bumi mengelilingi matahari bersama kemiringan poros bumi menyebabkan pergantian musim.',
        ],
        question: 'Bagian di dalam paru-paru manusia yang berfungsi sebagai tempat pertukaran gas oksigen dan karbon dioksida adalah...',
        options: ['Alveolus', 'Trakea', 'Kerongkongan', 'Diafragma'],
        correctIndex: 0,
        explanation:
          'Alveolus dikelilingi pembuluh kapiler tipis sehingga memungkinkan difusi O2 dan CO2 secara efisien.',
        simTitle: 'Simulator Kapasitas Vital Paru-Paru & Frekuensi Napas',
        simParam: 'Volume Udara Pernapasan',
        simUnit: 'mL',
        simMin: 500,
        simMax: 3500,
        simStep: 500,
        simDefault: 1500,
        simTarget: 3000,
        simFormula: 'Kapasitas Inspirasi Maksimal = 3000 mL Oksigen Segar',
        simExplanation:
          'Geser volume udara ke 3000 mL untuk mensimulasikan kapasitas inspirasi penuh saat olahraga.',
      },
    ];
  }

  // 3. BAHASA INGGRIS (Strict grade separation: SD vs SMP vs SMA/SMK)
  if (subjLower.includes('inggris') || subjLower.includes('english')) {
    if (educationLevel === EducationLevel.SD) {
      return [
        {
          title:
            classNum <= 3
              ? `Greetings, Numbers 1–20 & Colors (${selectedClass})`
              : `Demonstratives: This is, That is & Things Around Us (${selectedClass})`,
          subtitle:
            classNum <= 3
              ? 'Sapaan bahasa Inggris sehari-hari, warna, dan angka dasar SD'
              : 'Menunjuk benda dekat dan jauh (This is / That is / These are / Those are)',
          bookTitle: `My Next Words Grade ${classNum} — Bahasa Inggris SD Kurikulum Merdeka`,
          bookAuthor: 'EYLC Team — Pusat Perbukuan Kemendikdasmen RI',
          summaryPoints:
            classNum <= 3
              ? [
                  '"Good morning" diucapkan saat pagi hari, "Good afternoon" siang/sore, dan "Good evening" malam hari.',
                  'Kosakata warna dasar: Red (merah), Blue (biru), Yellow (kuning), Green (hijau).',
                  'Menanyakan kabar teman: "How are you?" dijawab "I am fine, thank you."',
                ]
              : [
                  '"This is" digunakan untuk menunjuk 1 benda yang dekat (contoh: This is a cat).',
                  '"That is" digunakan untuk menunjuk 1 benda yang jauh (contoh: That is a giraffe).',
                  '"These are" (dekat) dan "Those are" (jauh) digunakan untuk benda jamak (lebih dari satu).',
                ],
          question:
            classNum <= 3
              ? 'Jika kamu bertemu gurumu pada pagi hari pukul 07.00, sapaan Bahasa Inggris yang tepat adalah...'
              : 'Kita ingin menunjuk seekor gajah yang berada JAUH di seberang kandang. Kalimat yang tepat adalah...',
          options:
            classNum <= 3
              ? ['Good morning, Teacher!', 'Good night, Teacher!', 'Goodbye!', 'See you tomorrow!']
              : ['That is an elephant.', 'This is an elephant.', 'These are elephants.', 'I am an elephant.'],
          correctIndex: 0,
          explanation:
            classNum <= 3
              ? '"Good morning" adalah sapaan yang digunakan pada pagi hari.'
              : '"That is" dipakai untuk menunjuk satu benda/hewan yang jaraknya jauh dari pembicara.',
          simTitle: 'English Vocabulary Mastery Lab SD',
          simParam: 'Kosakata Dikuasai',
          simUnit: 'kata',
          simMin: 5,
          simMax: 30,
          simStep: 5,
          simDefault: 10,
          simTarget: 25,
          simFormula: 'SD English Mastery = 25 Active Daily Words',
          simExplanation: 'Geser target kosakata ke 25 kata untuk menguasai percakapan dasar Bahasa Inggris SD.',
        },
        {
          title: `Animal World, Family Members & My Classroom (${selectedClass})`,
          subtitle: 'Mengenal nama hewan (Animals), anggota keluarga, dan benda di ruang kelas',
          bookTitle: `My Next Words Grade ${classNum} — Bahasa Inggris SD Kurikulum Merdeka`,
          bookAuthor: 'EYLC Team — Pusat Perbukuan Kemendikdasmen RI',
          summaryPoints: [
            'Kosakata hewan populer: Elephant (gajah), Lion (singa), Rabbit (kelinci), Bird (burung), Butterfly (kupu-kupu).',
            'Anggota keluarga inti: Father (ayah), Mother (ibu), Brother (saudara laki-laki), Sister (saudara perempuan).',
            'Artikel "an" dipakai sebelum bunyi huruf vokal (an apple, an elephant), sedangkan "a" sebelum bunyi konsonan (a book, a cat).',
          ],
          question: 'Hewan yang memiliki belalai panjang dalam Bahasa Inggris disebut...',
          options: ['An elephant', 'A rabbit', 'A monkey', 'Achicken'],
          correctIndex: 0,
          explanation: '"Elephant" berarti gajah dan menggunakan artikel "an" karena diawali bunyi vokal.',
          simTitle: 'Animal & Classroom Vocabulary Builder',
          simParam: 'Skor Pengucapan',
          simUnit: 'poin',
          simMin: 20,
          simMax: 100,
          simStep: 20,
          simDefault: 60,
          simTarget: 100,
          simFormula: 'Pronunciation Score = 100 Poin (Fluent Kids)',
          simExplanation: 'Atur skor pengucapan ke 100 poin untuk menyelesaikan latihan kosakata hewan & kelas.',
        },
      ];
    }

    if (educationLevel === EducationLevel.SMP) {
      return [
        {
          title: `Past Continuous, Simple Past & Recount Text (${selectedClass})`,
          subtitle: 'Menceritakan kejadian yang sedang berlangsung di masa lampau (was/were + V-ing) serta Verb 2 pada Recount Text',
          bookTitle: `English for Nusantara untuk SMP/MTs ${selectedClass}`,
          bookAuthor: 'Kurikulum Merdeka Indonesia — Edisi Terverifikasi Mimi V15',
          summaryPoints: [
            'Past Continuous Tense (was/were + Verb-ing) menyatakan kegiatan yang sedang berlangsung di masa lampau saat kejadian lain terjadi.',
            'Simple Past Tense (Verb 2) digunakan untuk kejadian yang sudah selesai di masa lampau (yesterday, last week, two days ago).',
            'Contoh gabungan: "While I was studying English last night, my best friend called me."',
          ],
          question:
            'Complete the sentence: "While Rani and her classmates ___ the science exhibition yesterday, the principal arrived."',
          options: ['were visiting', 'was visiting', 'visit', 'visits'],
          correctIndex: 0,
          explanation:
            'Subjek jamak "Rani and her classmates" setelah "While ... yesterday" menggunakan Past Continuous Tense: "were + Verb-ing" (were visiting).',
          simTitle: 'Past Continuous & Simple Past Timeline Lab',
          simParam: 'Ketepatan Konjugasi Tense SMP',
          simUnit: '%',
          simMin: 20,
          simMax: 100,
          simStep: 20,
          simDefault: 60,
          simTarget: 100,
          simFormula: 'Past Continuous = S + was/were + V-ing | Simple Past = S + V2',
          simExplanation: 'Geser akurasi ke 100% untuk menguasai perbedaan Past Continuous dan Simple Past Tense SMP.',
        },
        {
          title: `Comparative Degree, Present Perfect & Passive Voice (${selectedClass})`,
          subtitle: 'Perbandingan sifat (Comparative & Superlative), have/has + Verb 3, serta kalimat pasif (be + Verb 3)',
          bookTitle: `English for Nusantara untuk SMP/MTs ${selectedClass}`,
          bookAuthor: 'Kurikulum Merdeka Indonesia — Edisi Terverifikasi Mimi V15',
          summaryPoints: [
            'Comparative Degree membandingkan dua hal: tambahkan "-er than" untuk kata sifat pendek (taller than, faster than) atau "more ... than" untuk kata sifat panjang (more diligent than).',
            'Present Perfect Tense (have/has + Verb 3) menyatakan kegiatan yang sudah dilakukan dan hasilnya masih terasa sekarang.',
            'Passive Voice fokus pada objek yang dikenai tindakan dengan pola: Subject + to be (is/am/are/was/were) + Verb 3.',
          ],
          question:
            'Complete the Comparative Degree sentence: "A high-speed train is ___ than a regular city bus."',
          options: ['faster', 'fastest', 'more fast', 'as fast'],
          correctIndex: 0,
          explanation:
            'Kata sifat 1 suku kata "fast" saat membandingkan dua benda ("than") menjadi "faster".',
          simTitle: 'Comparative, Present Perfect & Passive Voice Lab',
          simParam: 'Level Penguasaan Grammar SMP',
          simUnit: 'level',
          simMin: 1,
          simMax: 5,
          simStep: 1,
          simDefault: 3,
          simTarget: 5,
          simFormula: 'Comparative = Adj-er / more Adj + than | Passive = be + V3',
          simExplanation: 'Naikkan level ke 5 untuk menguasai Comparative Degree, Present Perfect, dan Passive Voice SMP.',
        },
      ];
    }

    return [
      {
        title: `Conditional Sentences (Type 1, 2, 3) & Subjunctive (${selectedClass})`,
        subtitle: 'Kalimat pengandaian masa depan, masa kini tak nyata, dan penyesalan masa lampau',
        bookTitle: `Bahasa Inggris: Work in Progress untuk SMA/SMK ${selectedClass}`,
        bookAuthor: 'Budi Hermawan dkk. — Pusat Perbukuan Kemendikdasmen RI',
        summaryPoints: [
          'Conditional Type 1 (Real Present/Future): If + Simple Present, Will + Verb 1.',
          'Conditional Type 2 (Unreal Present): If + Simple Past (were/V2), Would + Verb 1.',
          'Conditional Type 3 (Unreal Past): If + Past Perfect (had + V3), Would have + Verb 3.',
        ],
        question:
          'Complete the Conditional Type 3 sentence: "If he had studied harder last semester, he ___ the scholarship exam."',
        options: ['would have passed', 'will pass', 'would pass', 'passed'],
        correctIndex: 0,
        explanation:
          'If-clause menggunakan Past Perfect ("had studied"), sehingga klausa utama wajib menggunakan "would have + Verb 3" ("would have passed").',
        simTitle: 'Conditional Logic & Probability Matrix',
        simParam: 'Tipe Pengandaian',
        simUnit: 'tipe',
        simMin: 1,
        simMax: 3,
        simStep: 1,
        simDefault: 1,
        simTarget: 3,
        simFormula: 'Type 3: If + S + had V3, S + would have V3',
        simExplanation: 'Geser ke Tipe 3 untuk menganalisis struktur pengandaian masa lampau (Conditional Type 3).',
      },
      {
        title: `Analytical Exposition & Academic Reading Comprehension (${selectedClass})`,
        subtitle: 'Menyusun argumen logis (Thesis, Arguments, Reiteration) dan kosakata akademik',
        bookTitle: `Bahasa Inggris: Life Today untuk SMA/SMK ${selectedClass}`,
        bookAuthor: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
        summaryPoints: [
          'Analytical Exposition bertujuan meyakinkan pembaca bahwa suatu topik penting dibahas melalui argumen logis.',
          'Struktur teks: Thesis (pengenalan isu), Arguments (poin pendapat + bukti fakta), Reiteration (kesimpulan ulang).',
          'Menggunakan Simple Present Tense, causal conjunctions (therefore, consequently), dan mental verbs.',
        ],
        question:
          ' Bagian penutup pada teks Analytical Exposition yang menegaskan kembali pendapat penulis di bagian Thesis disebut...',
        options: ['Reiteration', 'Complication', 'Orientation', 'Description'],
        correctIndex: 0,
        explanation:
          'Reiteration berfungsi merangkum dan menegaskan kembali posisi penulis yang telah disampaikan pada Thesis.',
        simTitle: 'Academic Essay Argumentation Builder',
        simParam: 'Kekuatan Bukti Argumen',
        simUnit: 'poin',
        simMin: 20,
        simMax: 100,
        simStep: 20,
        simDefault: 60,
        simTarget: 100,
        simFormula: 'Strong Essay = Thesis + Data Arguments + Reiteration (100)',
        simExplanation: 'Atur kekuatan bukti argumen ke 100 poin untuk menghasilkan esai akademik yang persuasif.',
      },
    ];
  }

  // 4. PPKn (Pancasila & Kewarganegaraan)
  if (subjLower.includes('ppkn') || subjLower.includes('pkn') || subjLower.includes('pancasila')) {
    return [
      {
        title: `Nilai-Nilai Luhur Pancasila & Lambang Garuda (${selectedClass})`,
        subtitle: `Pengamalan sila ke-1 sampai sila ke-5 dalam kehidupan sehari-hari dan sekolah`,
        bookTitle: `Pendidikan Pancasila untuk ${educationLevel} ${selectedClass} Kurikulum Merdeka`,
        bookAuthor: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
        summaryPoints: [
          'Lima lambang sila Pancasila: Bintang (Sila 1), Rantai Emas (Sila 2), Pohon Beringin (Sila 3), Kepala Banteng (Sila 4), Padi dan Kapas (Sila 5).',
          'Musyawarah untuk mencapai mufakat merupakan pengamalan nyata Sila ke-4 Pancasila.',
          'Gotong royong dan menjaga persatuan di tengah keberagaman mencerminkan Sila ke-3 Pancasila.',
        ],
        question:
          'Menyelesaikan perbedaan pendapat saat pemilihan ketua kelas dengan cara musyawarah mufakat merupakan pengamalan Pancasila sila ke-...',
        options: ['Sila ke-4 (Kepala Banteng)', 'Sila ke-1 (Bintang)', 'Sila ke-2 (Rantai)', 'Sila ke-5 (Padi & Kapas)'],
        correctIndex: 0,
        explanation:
          'Sila ke-4 berbunyi "Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan" yang dilambangkan Kepala Banteng.',
        simTitle: 'Indeks Harmoni & Pengamalan Nilai Pancasila',
        simParam: 'Skor Gotong Royong & Musyawarah',
        simUnit: 'poin',
        simMin: 20,
        simMax: 100,
        simStep: 20,
        simDefault: 60,
        simTarget: 100,
        simFormula: 'Profil Pelajar Pancasila = 100% Harmoni & Toleransi',
        simExplanation: 'Naikkan skor gotong royong dan musyawarah ke 100 poin untuk menuntaskan simulasi PPKn.',
      },
      {
        title: `Norma, Hak, Kewajiban & Bhinneka Tunggal Ika (${selectedClass})`,
        subtitle: `Keseimbangan antara pelaksanaan kewajiban dan pemenuhan hak warga negara`,
        bookTitle: `Pendidikan Pancasila untuk ${educationLevel} ${selectedClass} Kurikulum Merdeka`,
        bookAuthor: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
        summaryPoints: [
          'Empat macam norma di masyarakat: Norma Agama, Norma Kesusilaan, Norma Kesopanan, dan Norma Hukum.',
          'Hak adalah sesuatu yang patut kita terima, sedangkan kewajiban adalah sesuatu yang harus kita laksanakan dengan tanggung jawab.',
          'Semboyan Bhinneka Tunggal Ika berasal dari kitab Sutasoma karya Mpu Tantular yang berarti "Berbeda-beda tetapi tetap satu jua".',
        ],
        question: 'Norma yang memiliki sanksi tegas dan memaksa berupa denda atau pidana dari aparat negara adalah...',
        options: ['Norma Hukum', 'Norma Kesopanan', 'Norma Kebiasaan', 'Norma Kesusilaan'],
        correctIndex: 0,
        explanation:
          'Norma hukum dibuat oleh lembaga negara yang berwenang dan memiliki sanksi tegas serta mengikat.',
        simTitle: 'Simulator Keseimbangan Hak & Kewajiban Warga',
        simParam: 'Kepatuhan Norma & Kewajiban',
        simUnit: '%',
        simMin: 20,
        simMax: 100,
        simStep: 20,
        simDefault: 60,
        simTarget: 100,
        simFormula: 'Kewajiban Terlaksana (100%) <=> Hak Terpenuhi Adil',
        simExplanation: 'Geser kepatuhan kewajiban ke 100% untuk mencapai keseimbangan hak dan ketertiban bersama.',
      },
    ];
  }

  // 5. IPS / EKONOMI & SOSIOLOGI / PROJEK KEWIRAUSAHAAN
  if (
    subjLower.includes('ips') ||
    subjLower.includes('ekonomi') ||
    subjLower.includes('sosiologi') ||
    subjLower.includes('kewirausahaan')
  ) {
    return [
      {
        title: `Kegiatan Ekonomi, Permintaan, Penawaran & Pasar (${selectedClass})`,
        subtitle: `Memahami produksi, distribusi, konsumsi, serta hukum permintaan dan penawaran`,
        bookTitle: `Ilmu Pengetahuan Sosial / Ekonomi untuk ${educationLevel} ${selectedClass}`,
        bookAuthor: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
        summaryPoints: [
          'Tiga kegiatan ekonomi utama: Produksi (menghasilkan nilai guna), Distribusi (menyalurkan barang), dan Konsumsi (menggunakan barang/jasa).',
          'Hukum Permintaan (Demand): Jika harga barang naik maka jumlah barang yang diminta cenderung turun (ceteris paribus).',
          'Harga Keseimbangan (Equilibrium) terbentuk pada titik potong kurva permintaan dan kurva penawaran.',
        ],
        question:
          'Sesuai hukum permintaan (ceteris paribus), apabila harga suatu barang mengalami kenaikan, maka jumlah permintaan barang tersebut akan...',
        options: ['Menurun', 'Meningkat tajam', 'Tetap tidak berubah', 'Menjadi tak terhingga'],
        correctIndex: 0,
        explanation:
          'Dalam hukum permintaan, harga barang berbanding terbalik dengan jumlah barang yang diminta konsumen.',
        simTitle: 'Simulator Titik Keseimbangan Pasar (Market Equilibrium)',
        simParam: 'Harga Pasar per Unit',
        simUnit: 'ribu Rp',
        simMin: 10,
        simMax: 50,
        simStep: 5,
        simDefault: 15,
        simTarget: 25,
        simFormula: 'Qd = Qs pada Harga Equilibrium Rp25.000',
        simExplanation: 'Geser harga pasar ke 25 (Rp25.000) untuk mencapai titik keseimbangan antara permintaan dan penawaran.',
      },
      {
        title: `Interaksi Sosial, Kondusivitas Masyarakat & Geografi Nusantara (${selectedClass})`,
        subtitle: `Syarat interaksi sosial (kontak & komunikasi), proses asosiatif, dan letak Indonesia`,
        bookTitle: `IPS / Sosiologi Kurikulum Merdeka untuk ${educationLevel} ${selectedClass}`,
        bookAuthor: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
        summaryPoints: [
          'Interaksi sosial hanya dapat terjadi apabila memenuhi dua syarat mutlak: Kontak Sosial dan Komunikasi.',
          'Proses sosial asosiatif mengarah pada persatuan (kerja sama, akomodasi, asimilasi, akulturasi).',
          'Letak geografis Indonesia berada di antara dua benua (Asia dan Australia) serta dua samudra (Hindia dan Pasifik).',
        ],
        question: 'Dua syarat utama terjadinya interaksi sosial di dalam masyarakat adalah...',
        options: [
          'Kontak sosial dan komunikasi',
          'Kekayaan dan jabatan',
          'Persaingan dan pertentangan',
          'Jarak dekat dan usia sama',
        ],
        correctIndex: 0,
        explanation:
          'Menurut sosiologi, interaksi sosial terjadi ketika ada kontak sosial (primer/sekunder) dan komunikasi.',
        simTitle: 'Peta Interaksi Sosial & Konektivitas Antarwilayah',
        simParam: 'Indeks Konektivitas Wilayah',
        simUnit: 'poin',
        simMin: 20,
        simMax: 100,
        simStep: 20,
        simDefault: 60,
        simTarget: 100,
        simFormula: 'Konektivitas Nusantara = 100 Poin (Asosiatif & Produktif)',
        simExplanation: 'Atur indeks konektivitas ke 100 poin untuk mengoptimalkan kerja sama ekonomi dan sosial.',
      },
    ];
  }

  // 6. FISIKA / KIMIA / BIOLOGI / TEKNIK ELEKTRONIKA
  if (
    subjLower.includes('fisika') ||
    subjLower.includes('kimia') ||
    subjLower.includes('biologi') ||
    subjLower.includes('elektronika')
  ) {
    if (subjLower.includes('kimia')) {
      return [
        {
          title: `Struktur Atom, Sistem Periodik Unsur & Ikatan Kimia (${selectedClass})`,
          subtitle: `Partikel subatomik (proton, elektron, neutron), konfigurasi elektron, dan ikatan ion/kovalen`,
          bookTitle: `Kimia untuk SMA/MA ${selectedClass} Kurikulum Merdeka`,
          bookAuthor: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
          summaryPoints: [
            'Nomor atom (Z) menunjukkan jumlah proton sekaligus jumlah elektron pada atom netral.',
            'Nomor massa (A) adalah penjumlahan jumlah proton dan neutron di dalam inti atom (A = p + n).',
            'Ikatan ion terbentuk akibat serah terima elektron antara unsur logam dan non-logam, sedangkan ikatan kovalen melalui pemakaian pasangan elektron bersama.',
          ],
          question:
            'Suatu atom netral memiliki nomor atom 11 dan nomor massa 23. Berapakah jumlah neutron di dalam inti atom tersebut?',
          options: ['12 neutron', '11 neutron', '23 neutron', '34 neutron'],
          correctIndex: 0,
          explanation: 'Jumlah neutron = Nomor Massa (A) - Nomor Atom (Z) = 23 - 11 = 12 neutron.',
          simTitle: 'Laboratorium Keseimbangan pH & Stoikiometri Larutan',
          simParam: 'Derajat Keasaman (pH)',
          simUnit: 'pH',
          simMin: 1,
          simMax: 14,
          simStep: 1,
          simDefault: 3,
          simTarget: 7,
          simFormula: 'Titik Netralisasi Asam-Basa = pH 7.0 (Netral)',
          simExplanation: 'Geser pH larutan ke angka 7 untuk mencapai titik ekuivalen netralisasi asam dan basa.',
        },
      ];
    }
    if (subjLower.includes('biologi')) {
      return [
        {
          title: `Biologi Sel, Enzim, Genetika & Bioteknologi (${selectedClass})`,
          subtitle: `Struktur organel sel eukariotik, sintesis protein, dan hukum pewarisan sifat Mendel`,
          bookTitle: `Biologi untuk SMA/MA ${selectedClass} Kurikulum Merdeka`,
          bookAuthor: 'Pusat Perbukuan BSKAP Kemendikdasmen RI',
          summaryPoints: [
            'Mitokondria berfungsi sebagai tempat respirasi seluler untuk menghasilkan energi dalam bentuk ATP (The Powerhouse of Cell).',
            'Ribosom berperan penting dalam proses sintesis (pembentukan) protein.',
            'Enzim bekerja sebagai biokatalisator spesifik (model Lock and Key) yang mempercepat reaksi metabolisme dengan menurunkan energi aktivasi.',
          ],
          question:
            'Organel sel yang berfungsi menghasilkan energi ATP melalui proses respirasi aerob disebut...',
          options: ['Mitokondria', 'Lisosom', 'Badan Golgi', 'Vakuola'],
          correctIndex: 0,
          explanation: 'Mitokondria adalah organel penghasil energi utama (ATP) di dalam sel eukariotik.',
          simTitle: 'Simulator Aktivitas Enzim terhadap Suhu Optimum',
          simParam: 'Suhu Reaksi Enzim',
          simUnit: '°C',
          simMin: 15,
          simMax: 50,
          simStep: 5,
          simDefault: 25,
          simTarget: 37,
          simFormula: 'Laju Enzim Maksimum Manusia = 37 °C (Suhu Tubuh)',
          simExplanation: 'Atur suhu ke 37 °C untuk mengamati kerja optimum enzim metabolisme tubuh manusia.',
        },
      ];
    }
    return [
      {
        title: `Kinematika, Hukum Newton, Usaha & Energi (${selectedClass})`,
        subtitle: `Analisis gerak lurus berubah beraturan (GLBB), dinamika partikel, dan kekekalan energi`,
        bookTitle: `Fisika untuk SMA/SMK ${selectedClass} Kurikulum Merdeka`,
        bookAuthor: 'Ayuk Ratna Puspaningsih dkk. — Pusat Perbukuan Kemendikdasmen RI',
        summaryPoints: [
          'Hukum II Newton menyatakan percepatan benda sebanding dengan resultan gaya dan berbanding terbalik dengan massanya (a = ΣF / m).',
          'Energi Kinetik (Ek = 1/2 m·v²) bergantung pada massa dan kuadrat kecepatan benda.',
          'Hukum Ohm pada rangkaian listrik menyatakan tegangan sebanding dengan kuat arus dikali hambatan (V = I × R).',
        ],
        question:
          'Sebuah benda bermassa 4 kg bergerak dengan kecepatan 5 m/s. Berapakah energi kinetik benda tersebut?',
        options: ['50 Joule', '20 Joule', '10 Joule', '100 Joule'],
        correctIndex: 0,
        explanation: 'Ek = 1/2 × m × v² = 1/2 × 4 × (5)² = 2 × 25 = 50 Joule.',
        simTitle: 'Laboratorium Dinamika Hukum II Newton & Energi',
        simParam: 'Kecepatan Benda (v)',
        simUnit: 'm/s',
        simMin: 2,
        simMax: 10,
        simStep: 2,
        simDefault: 4,
        simTarget: 6,
        simFormula: 'Ek = 1/2 × 4 kg × (6 m/s)² = 72 Joule',
        simExplanation: 'Atur kecepatan benda ke 6 m/s untuk menghasilkan energi kinetik sebesar 72 Joule.',
      },
    ];
  }

  // 7. INFORMATIKA / CODING / PPLG / TJKT
  if (
    subjLower.includes('informatika') ||
    subjLower.includes('coding') ||
    subjLower.includes('pplg') ||
    subjLower.includes('tjkt')
  ) {
    return [
      {
        title: `Berpikir Komputasional, Algoritma & Struktur Data (${selectedClass})`,
        subtitle: `Dekomposisi masalah, pengenalan pola, abstraksi, serta logika percabangan dan perulangan`,
        bookTitle: `Informatika Kurikulum Merdeka untuk ${educationLevel} ${selectedClass}`,
        bookAuthor: 'Mushthofa dkk. — Pusat Perbukuan BSKAP Kemendikdasmen RI',
        summaryPoints: [
          'Empat pilar Berpikir Komputasional: Dekomposisi (memecah masalah besar), Pengenalan Pola, Abstraksi, dan penyusunan Algoritma.',
          'Percabangan (if-else) mengeksekusi blok kode berdasarkan kondisi boolean (true/false).',
          'Perulangan (for / while loop) menjalankan instruksi berulang secara efisien tanpa duplikasi kode manual.',
        ],
        question:
          'Langkah memecah suatu persoalan kompleks menjadi bagian-bagian kecil yang lebih mudah diselesaikan dalam berpikir komputasional disebut...',
        options: ['Dekomposisi', 'Enkripsi', 'Kompilasi', 'instalasi'],
        correctIndex: 0,
        explanation: 'Dekomposisi adalah teknik menguraikan masalah besar menjadi sub-masalah yang lebih sederhana.',
        simTitle: 'Simulator Efisiensi Algoritma & Kompleksitas Loop',
        simParam: 'Jumlah Iterasi Loop',
        simUnit: 'iterasi',
        simMin: 2,
        simMax: 12,
        simStep: 2,
        simDefault: 4,
        simTarget: 8,
        simFormula: 'Output Loop = 8 Iterasi Terstruktur (0 Error)',
        simExplanation: 'Geser jumlah iterasi ke 8 untuk memverifikasi jalannya algoritma perulangan otomatis.',
      },
    ];
  }

  // 8. MATEMATIKA (Strictly separated by grade: SD 1, SD 2, SD 3, SD 4-6, SMP 7-9, SMA/SMK 10-12)
  if (educationLevel === EducationLevel.SD) {
    if (classNum === 1) {
      return [
        {
          title: 'Mengenal Angka & Penjumlahan 1 sampai 20 (SD Kelas 1)',
          subtitle: 'Membilang benda, mengenal nilai satuan & puluhan sederhana, serta penjumlahan 1–20',
          bookTitle: 'Belajar Bersama Temanmu Matematika untuk SD Kelas I',
          bookAuthor: 'Tim Gakko Tosho — Pusat Perbukuan Kemendikdasmen RI',
          summaryPoints: [
            'Bilangan 1 sampai 20 digunakan untuk menghitung jumlah benda di sekitar kita (pensil, apel, buku).',
            'Bilangan 14 terdiri dari 1 puluhan (10) dan 4 satuan (4).',
            'Strategi menggenapkan ke 10: untuk menghitung 8 + 5, ambil 2 dari 5 agar 8 menjadi 10, lalu 10 + 3 = 13.',
          ],
          question: 'Ibu memberi Budi 7 permen, lalu Ayah memberi lagi 5 permen. Berapa jumlah permen Budi sekarang?',
          options: ['12 permen', '11 permen', '13 permen', '10 permen'],
          correctIndex: 0,
          explanation: '7 ditambah 3 menjadi 10, lalu ditambah sisa 2 menjadi 12 permen.',
          simTitle: 'Simulator Menghitung Benda 1 sampai 20 (SD Kelas 1)',
          simParam: 'Jumlah Apel di Keranjang',
          simUnit: 'apel',
          simMin: 1,
          simMax: 20,
          simStep: 1,
          simDefault: 8,
          simTarget: 15,
          simFormula: '8 Apel Merah + 7 Apel Hijau = 15 Apel',
          simExplanation: 'Geser jumlah apel ke 15 untuk menyelesaikan penjumlahan bilangan 1 sampai 20.',
        },
        {
          title: 'Pengurangan Sederhana 1 sampai 20 (SD Kelas 1)',
          subtitle: 'Menghitung sisa benda yang diambil atau diberikan dengan angka 1–20',
          bookTitle: 'Belajar Bersama Temanmu Matematika untuk SD Kelas I',
          bookAuthor: 'Tim Gakko Tosho — Pusat Perbukuan Kemendikdasmen RI',
          summaryPoints: [
            'Pengurangan artinya jumlah benda berkurang karena dimakan, diberikan, atau terbang.',
            'Contoh: Ada 10 burung di pohon, terbang 4 burung, maka sisanya adalah 10 - 4 = 6 burung.',
            'Kita bisa menghitung mundur menggunakan jari tangan atau garis bilangan 1 sampai 20.',
          ],
          question: 'Di piring ada 15 kue donat. Adik memakan 5 kue donat. Berapa sisa kue donat di piring?',
          options: ['10 kue donat', '9 kue donat', '11 kue donat', '12 kue donat'],
          correctIndex: 0,
          explanation: '15 dikurangi 5 sama dengan 10 kue donat.',
          simTitle: 'Laboratorium Pengurangan Benda 1–20',
          simParam: 'Sisa Balon Setelah Diberikan',
          simUnit: 'balon',
          simMin: 1,
          simMax: 20,
          simStep: 1,
          simDefault: 6,
          simTarget: 10,
          simFormula: '16 Balon - 6 Balon = 10 Balon',
          simExplanation: 'Atur jumlah balon ke 10 untuk membuktikan hasil 16 dikurangi 6.',
        },
      ];
    }

    if (classNum === 2) {
      return [
        {
          title: 'Penjumlahan & Pengurangan 1 sampai 100 serta Perkalian 1–5 (SD Kelas 2)',
          subtitle: 'Menjumlahkan bilangan puluhan dan mengenal perkalian dasar sebagai penjumlahan berulang',
          bookTitle: 'Belajar Bersama Temanmu Matematika untuk SD Kelas II',
          bookAuthor: 'Tim Gakko Tosho — Pusat Perbukuan Kemendikdasmen RI',
          summaryPoints: [
            'Pada penjumlahan bersusun 1–100, jumlahkan angka satuan dengan satuan, dan puluhan dengan puluhan.',
            'Perkalian adalah penjumlahan berulang: 3 × 4 artinya 4 + 4 + 4 = 12.',
            'Perkalian dengan angka 1 menghasilkan bilangan itu sendiri, sedangkan perkalian dengan 2 sama dengan menggandakan angka.',
          ],
          question: 'Di atas meja ada 4 piring. Setiap piring berisi 5 buah jeruk. Berapa jumlah seluruh jeruk (4 × 5)?',
          options: ['20 jeruk', '15 jeruk', '25 jeruk', '9 jeruk'],
          correctIndex: 0,
          explanation: '4 × 5 = 5 + 5 + 5 + 5 = 20 buah jeruk.',
          simTitle: 'Simulator Perkalian Dasar 1–5 (SD Kelas 2)',
          simParam: 'Hasil Perkalian 4 × n',
          simUnit: 'buah',
          simMin: 4,
          simMax: 20,
          simStep: 4,
          simDefault: 8,
          simTarget: 20,
          simFormula: '4 Kotak × 5 Bintang = 20 Bintang',
          simExplanation: 'Geser nilai ke 20 untuk melihat hasil perkalian 4 × 5.',
        },
      ];
    }

    if (classNum === 3) {
      return [
        {
          title: 'Perkalian, Pembagian Dasar & Pecahan Sederhana (SD Kelas 3)',
          subtitle: 'Menguasai pembagian sebagai kebalikan perkalian serta pecahan 1/2, 1/3, dan 1/4',
          bookTitle: 'Belajar Bersama Temanmu Matematika untuk SD Kelas III',
          bookAuthor: 'Tim Gakko Tosho — Pusat Perbukuan Kemendikdasmen RI',
          summaryPoints: [
            'Pembagian adalah pengurangan berulang atau kebalikan dari perkalian: karena 6 × 4 = 24, maka 24 ÷ 6 = 4.',
            'Pecahan 1/4 berarti 1 bagian utuh dibagi menjadi 4 bagian yang sama besar.',
            'Pada pecahan a/b, angka di atas (a) disebut pembilang dan angka di bawah (b) disebut penyebut.',
          ],
          question: 'Ibu memotong sebuah pizza menjadi 4 bagian sama besar. Jika Rina mengambil 1 potong, berapa bagian pizza yang diambil Rina?',
          options: ['1/4 bagian', '1/2 bagian', '3/4 bagian', '4/1 bagian'],
          correctIndex: 0,
          explanation: 'Satu bagian dari empat potongan yang sama besar ditulis sebagai pecahan 1/4.',
          simTitle: 'Simulator Pembagian & Pecahan Sederhana SD Kelas 3',
          simParam: 'Jumlah Potongan Sama Besar',
          simUnit: 'bagian',
          simMin: 2,
          simMax: 8,
          simStep: 1,
          simDefault: 2,
          simTarget: 4,
          simFormula: '1 Kue Utuh ÷ 4 = 1/4 Bagian per Anak',
          simExplanation: 'Geser ke 4 bagian untuk membagi kue menjadi pecahan 1/4 yang sama besar.',
        },
      ];
    }

    return [
      {
        title: `Pecahan Campuran, Desimal, FPB & KPK (${selectedClass})`,
        subtitle: `Operasi hitung pecahan, konversi desimal-persen, serta Faktor Persekutuan Terbesar dan KPK`,
        bookTitle: `Belajar Bersama Temanmu Matematika untuk SD ${selectedClass}`,
        bookAuthor: 'Tim Gakko Tosho — Pusat Perbukuan Kemendikdasmen RI',
        summaryPoints: [
          'Untuk menjumlahkan pecahan berbeda penyebut, samakan penyebutnya terlebih dahulu menggunakan KPK.',
          'Pecahan campuran 2 1/2 dapat diubah menjadi pecahan biasa (2×2 + 1)/2 = 5/2 atau desimal 2,5.',
          'FPB digunakan untuk membagi benda ke dalam kelompok sama banyak, sedangkan KPK untuk mencari waktu kejadian bersama.',
        ],
        question: 'Berapakah hasil penjumlahan pecahan 1/2 + 1/4?',
        options: ['3/4', '2/6', '1/6', '4/4'],
        correctIndex: 0,
        explanation: 'Samakan penyebut menjadi 4: 1/2 = 2/4, sehingga 2/4 + 1/4 = 3/4.',
        simTitle: 'Laboratorium Pecahan, Desimal & KPK SD Kelas 4–6',
        simParam: 'Nilai Pembilang (Per 4)',
        simUnit: 'perempat',
        simMin: 1,
        simMax: 4,
        simStep: 1,
        simDefault: 2,
        simTarget: 3,
        simFormula: '2/4 + 1/4 = 3/4 (0,75 atau 75%)',
        simExplanation: 'Geser pembilang ke 3 untuk memvisualisasikan pecahan 3/4 (setara desimal 0,75).',
      },
    ];
  }

  if (educationLevel === EducationLevel.SMP) {
    return [
      {
        title: `Aljabar, Persamaan Linear & Teorema Pythagoras (${selectedClass})`,
        subtitle: `Menyelesaikan persamaan linear satu/dua variabel (SPLDV) dan segitiga siku-siku`,
        bookTitle: `Matematika untuk SMP/MTs ${selectedClass} Kurikulum Merdeka`,
        bookAuthor: 'Mohammad Tohir dkk. — Pusat Perbukuan Kemendikdasmen RI',
        summaryPoints: [
          'Pada persamaan linear 3x + 5 = 20, kurangi kedua ruas dengan 5 menjadi 3x = 15, sehingga x = 5.',
          'Teorema Pythagoras pada segitiga siku-siku menyatakan kuadrat sisi miring sama dengan jumlah kuadrat sisi siku-sikunya (c² = a² + b²).',
          'Tripel Pythagoras populer yang sering keluar di ujian SMP: (3, 4, 5), (5, 12, 13), (8, 15, 17), dan (7, 24, 25).',
        ],
        question: 'Sebuah segitiga siku-siku memiliki panjang sisi tegak 6 cm dan alas 8 cm. Berapakah panjang sisi miringnya (hipotenusa)?',
        options: ['10 cm', '12 cm', '14 cm', '9 cm'],
        correctIndex: 0,
        explanation: 'c = √(6² + 8²) = √(36 + 64) = √100 = 10 cm.',
        simTitle: 'Laboratorium Persamaan Linear & Pythagoras SMP',
        simParam: 'Nilai Variabel x',
        simUnit: 'satuan',
        simMin: 1,
        simMax: 10,
        simStep: 1,
        simDefault: 3,
        simTarget: 5,
        simFormula: '3x + 5 = 20 -> Saat x = 5, maka 3(5) + 5 = 20 (SEIMBANG)',
        simExplanation: 'Geser variabel x ke angka 5 agar kedua ruas persamaan linear seimbang bernilai 20.',
      },
    ];
  }

  return [
    {
      title: `Logaritma, Trigonometri & Kalkulus Dasar (${selectedClass})`,
      subtitle: `Sifat eksponen-logaritma, perbandingan trigonometri sudut istimewa, serta limit dan turunan fungsi`,
      bookTitle: `Matematika untuk SMA/SMK ${selectedClass} Kurikulum Merdeka`,
      bookAuthor: 'Dicky Susanto dkk. — Pusat Perbukuan Kemendikdasmen RI',
      summaryPoints: [
        'Definisi logaritma: ᵃlog b = c jika dan hanya jika aᶜ = b (contoh: ²log 8 = 3 karena 2³ = 8).',
        'Perbandingan trigonometri siku-siku: sin θ = depan/miring (Demi), cos θ = samping/miring (Sami), tan θ = depan/samping (Desa).',
        'Aturan turunan pertama fungsi aljabar f(x) = a·xⁿ adalah f\'(x) = n·a·xⁿ⁻¹.',
      ],
      question: 'Jika diketahui fungsi f(x) = 3x² - 12x + 7, maka turunan pertama f\'(x) adalah...',
      options: ['6x - 12', '3x - 12', '6x² - 12', '6x + 7'],
      correctIndex: 0,
      explanation: 'Menggunakan rumus turunan d/dx (axⁿ) = n·axⁿ⁻¹, maka turunan 3x² adalah 6x dan turunan -12x adalah -12.',
      simTitle: 'Simulator Gradien Garis Singgung & Titik Stasioner Kalkulus',
      simParam: 'Absis Titik Singgung (x)',
      simUnit: 'satuan',
      simMin: 0,
      simMax: 5,
      simStep: 1,
      simDefault: 0,
      simTarget: 2,
      simFormula: 'f\'(x) = 6x - 12 = 0 -> Titik Stasioner pada x = 2',
      simExplanation: 'Geser nilai x ke angka 2 untuk mencapai titik stasioner saat gradien garis singgung f\'(x) = 0.',
    },
  ];
}

/**
 * Filter & build subject-specific and class-specific units so selecting Bahasa Indonesia, IPAS,
 * Bahasa Inggris, PPKn, IPA, IPS, Fisika, Kimia, Biologi, Informatika, or Matematika
 * ALWAYS displays units matching `selectedSubject` (`selectedMapel`) and `selectedClass` (`selectedKelas`).
 */
export function getFilteredUnitsForSelection(
  educationLevel: EducationLevel,
  selectedClass: string,
  selectedSubject: string,
  completedLevelIds: string[] = []
): LevelItem[] {
  const blueprints = getSubjectUnitBlueprints(
    educationLevel,
    selectedClass,
    selectedSubject
  );

  const safeSlug = `${educationLevel}-${selectedClass}-${selectedSubject}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  const generatedUnits: LevelItem[] = blueprints.map((bp, idx) => {
    const id = `unit-${safeSlug}-${idx + 1}`;
    return {
      id,
      levelNumber: idx + 1,
      title: bp.title,
      subtitle: bp.subtitle,
      subject: selectedSubject,
      mapel: selectedSubject,
      kelas: selectedClass,
      educationLevel,
      classRange: selectedClass,
      xpReward: 55 + idx * 15,
      estimatedMinutes: 12 + idx * 3,
      isUnlocked: true,
      isCompleted: completedLevelIds.includes(id),
      bookSource: {
        title: bp.bookTitle,
        authorOrPublisher: bp.bookAuthor,
        year: '2022',
        catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
        companionBookTitle: `${selectedSubject} ${selectedClass} Kurikulum Merdeka (SIBI Kemendikdasmen)`,
        companionBookUrl: KEMENDIKDASMEN_CATALOG_URL,
      },
      summaryPoints: bp.summaryPoints,
      practiceQuestion: {
        question: bp.question,
        options: bp.options,
        correctIndex: bp.correctIndex,
        explanation: bp.explanation,
      },
      simulation: {
        type: 'ALGEBRA_BALANCE',
        title: bp.simTitle,
        parameterLabel: bp.simParam,
        unit: bp.simUnit,
        min: bp.simMin,
        max: bp.simMax,
        step: bp.simStep,
        defaultValue: bp.simDefault,
        targetValue: bp.simTarget,
        formulaDisplay: bp.simFormula,
        explanation: bp.simExplanation,
      },
    };
  });

  // Ensure 4 units on the Duolingo path for every subject & class combination
  while (generatedUnits.length < 4) {
    const base = generatedUnits[generatedUnits.length % blueprints.length];
    const nextNum = generatedUnits.length + 1;
    const id = `unit-${safeSlug}-${nextNum}`;
    const unitTitles = [
      `Konsep Dasar & Eksplorasi ${selectedSubject} (${selectedClass})`,
      `Latihan Terpadu & Analogi ${selectedSubject} (${selectedClass})`,
      `Studi Kasus & Penerapan ${selectedSubject} (${selectedClass})`,
      `Evaluasi & Tantangan Master ${selectedSubject} (${selectedClass})`,
    ];
    generatedUnits.push({
      ...base,
      id,
      levelNumber: nextNum,
      title: unitTitles[nextNum - 1] || `${base.title} — Bagian ${nextNum}`,
      xpReward: 55 + (nextNum - 1) * 15,
      isCompleted: completedLevelIds.includes(id),
    });
  }

  return generatedUnits;
}

