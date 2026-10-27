/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * INTERNAL CURRICULUM & QUESTION DATABASE — MIMI V15 (KURIKULUM MERDEKA INDONESIA)
 * Disintesis menjadi basis pengetahuan internal lokal (SD Kelas 1-6, SMP Kelas 7-9,
 * SMA/SMK Kelas 10-12, dan Umum 2 Kategori: Pengetahuan Umum & Bahasa Inggris Umum).
 * Tanpa menampilkan tautan eksternal di UI.
 */

import { EducationLevel } from '../types/mimi';
import { AdaptiveQuestion } from './questionBankInggris';

export interface KurikulumUnitBlueprint {
  id: string;
  educationLevel: EducationLevel;
  kelas: string;
  mapel: string;
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

export const SYSTEM_INSTRUCTION_MIMI_V15 =
  'Kamu Mimi bestie pelajar 17 tahun, pinter, Gen Z, jelasin cepat & gampang pakai Kurikulum Merdeka Indonesia.';

/**
 * Hanya 2 Kategori untuk Level UMUM / RANDOM (HAGO / Millionaire / Cerdas Cermat Style)
 */
export const UMUM_CATEGORIES = ['Pengetahuan Umum', 'Bahasa Inggris Umum'] as const;

export const KURIKULUM_LENGKAP_UNITS: KurikulumUnitBlueprint[] = [
  // ============================================================================
  // 1. JENJANG SD (KELAS 1 - 6)
  // ============================================================================
  // SD KELAS 1 MATEMATIKA: HANYA 1-20 PENJUMLAHAN & PENGURANGAN (TANPA ALJABAR!)
  {
    id: 'kl-sd1-mtk-1',
    educationLevel: EducationLevel.SD,
    kelas: 'Kelas 1',
    mapel: 'Matematika',
    title: 'Membilang & Penjumlahan 1 sampai 20 (SD Kelas 1)',
    subtitle: 'Mengenal lambang bilangan 1–20, pasangan bilangan 10, dan penjumlahan benda konkret',
    bookTitle: 'Buku Pelajaran Matematika Kelas 1 Kurikulum Merdeka',
    bookAuthor: 'Kurikulum Merdeka Indonesia — Edisi Terverifikasi Mimi V15',
    summaryPoints: [
      'Membilang benda dari 1 sampai 20: bilangan 11 sampai 20 terdiri dari 1 puluhan (10) dan satuan (1–9).',
      'Pasangan bilangan berjumlah 10: (1 dan 9), (2 dan 8), (3 dan 7), (4 dan 6), serta (5 dan 5).',
      'Strategi genap 10 untuk 8 + 5: pecah 5 menjadi 2 dan 3, lalu (8 + 2) + 3 = 10 + 3 = 13.',
    ],
    question: 'Di meja belajar ada 8 pensil warna merah dan 6 pensil warna biru. Berapa jumlah seluruh pensil warna?',
    options: ['14 pensil', '12 pensil', '15 pensil', '13 pensil'],
    correctIndex: 0,
    explanation: '8 ditambah 2 menjadi 10, lalu ditambah sisa 4 menjadi 14 pensil warna.',
    simTitle: 'Simulator Penjumlahan Benda 1–20 (SD Kelas 1)',
    simParam: 'Jumlah Apel di Keranjang',
    simUnit: 'apel',
    simMin: 1,
    simMax: 20,
    simStep: 1,
    simDefault: 8,
    simTarget: 14,
    simFormula: '8 Apel + 6 Apel = 14 Apel',
    simExplanation: 'Geser jumlah apel ke angka 14 untuk menyelesaikan penjumlahan 8 + 6.',
  },
  {
    id: 'kl-sd1-mtk-2',
    educationLevel: EducationLevel.SD,
    kelas: 'Kelas 1',
    mapel: 'Matematika',
    title: 'Pengurangan Sederhana 1 sampai 20 (SD Kelas 1)',
    subtitle: 'Menghitung sisa benda yang diambil atau dimakan dalam rentang angka 1–20',
    bookTitle: 'Buku Pelajaran Matematika Kelas 1 Kurikulum Merdeka',
    bookAuthor: 'Kurikulum Merdeka Indonesia — Edisi Terverifikasi Mimi V15',
    summaryPoints: [
      'Pengurangan artinya jumlah benda berkurang karena diberikan kepada teman atau dimakan.',
      'Cara hitung mundur: untuk menghitung 15 - 4, hitung mundur 4 langkah dari 15 (14, 13, 12, 11).',
      'Cara kurangi dari 10: untuk 13 - 5, ambil 5 dari 10 (sisa 5), lalu tambahkan 3 menjadi 8.',
    ],
    question: 'Ibu membeli 16 buah jeruk. Sore hari dimakan bersama keluarga sebanyak 6 buah. Berapa sisa jeruk Ibu?',
    options: ['10 jeruk', '9 jeruk', '11 jeruk', '12 jeruk'],
    correctIndex: 0,
    explanation: '16 dikurangi 6 satuan menyisakan 1 puluhan yaitu 10 jeruk.',
    simTitle: 'Simulator Pengurangan Benda 1–20 (SD Kelas 1)',
    simParam: 'Sisa Jeruk di Piring',
    simUnit: 'jeruk',
    simMin: 1,
    simMax: 20,
    simStep: 1,
    simDefault: 6,
    simTarget: 10,
    simFormula: '16 Jeruk - 6 Jeruk = 10 Jeruk',
    simExplanation: 'Geser pengatur ke angka 10 untuk melihat sisa 16 dikurangi 6.',
  },

  // SD KELAS 2 MATEMATIKA: PENJUMLAHAN 1-100 & PERKALIAN DASAR 1-5
  {
    id: 'kl-sd2-mtk-1',
    educationLevel: EducationLevel.SD,
    kelas: 'Kelas 2',
    mapel: 'Matematika',
    title: 'Penjumlahan 1–100 & Perkalian Dasar 1–5 (SD Kelas 2)',
    subtitle: 'Menjumlahkan bilangan dua angka dan memahami konsep perkalian sebagai penjumlahan berulang',
    bookTitle: 'Buku Pelajaran Matematika Kelas 2 Kurikulum Merdeka',
    bookAuthor: 'Kurikulum Merdeka Indonesia — Edisi Terverifikasi Mimi V15',
    summaryPoints: [
      'Penjumlahan bersusun 1–100: jumlahkan angka satuan terlebih dahulu, lalu jumlahkan angka puluhannya.',
      'Perkalian adalah penjumlahan berulang dengan angka yang sama: 4 × 5 artinya 5 + 5 + 5 + 5 = 20.',
      'Tabel perkalian 1 sampai 5 membantu menghitung jumlah benda dalam beberapa kotak secara cepat.',
    ],
    question: 'Ada 5 piring di meja. Setiap piring berisi 4 kue bolu. Berapa jumlah seluruh kue bolu (5 × 4)?',
    options: ['20 kue bolu', '16 kue bolu', '25 kue bolu', '9 kue bolu'],
    correctIndex: 0,
    explanation: '5 × 4 = 4 + 4 + 4 + 4 + 4 = 20 kue bolu.',
    simTitle: 'Simulator Perkalian Dasar 1–5 (SD Kelas 2)',
    simParam: 'Total Kue Bolu (5 × n)',
    simUnit: 'kue',
    simMin: 5,
    simMax: 25,
    simStep: 5,
    simDefault: 10,
    simTarget: 20,
    simFormula: '5 Piring × 4 Kue = 20 Kue Bolu',
    simExplanation: 'Geser ke angka 20 untuk membuktikan hasil perkalian 5 × 4.',
  },

  // SD KELAS 3 MATEMATIKA: PERKALIAN, PEMBAGIAN DASAR & PECAHAN SEDERHANA
  {
    id: 'kl-sd3-mtk-1',
    educationLevel: EducationLevel.SD,
    kelas: 'Kelas 3',
    mapel: 'Matematika',
    title: 'Perkalian, Pembagian Dasar & Pecahan Sederhana (SD Kelas 3)',
    subtitle: 'Hubungan perkalian-pembagian serta mengenal pecahan 1/2, 1/3, dan 1/4',
    bookTitle: 'Buku Pelajaran Matematika Kelas 3 Kurikulum Merdeka',
    bookAuthor: 'Kurikulum Merdeka Indonesia — Edisi Terverifikasi Mimi V15',
    summaryPoints: [
      'Pembagian adalah pengurangan berulang dan kebalikan dari perkalian: jika 4 × 6 = 24, maka 24 ÷ 4 = 6.',
      'Pecahan sederhana 1/2 (setengah), 1/3 (sepertiga), dan 1/4 (seperempat) menyatakan bagian dari satu benda utuh yang dibagi sama besar.',
      'Angka di atas garis pecahan disebut pembilang, dan angka di bawah garis disebut penyebut.',
    ],
    question: 'Ayah memiliki 24 kelereng yang akan dibagikan sama rata kepada 4 orang anaknya. Berapa kelereng yang diterima setiap anak?',
    options: ['6 kelereng', '4 kelereng', '8 kelereng', '12 kelereng'],
    correctIndex: 0,
    explanation: '24 ÷ 4 = 6 karena 4 × 6 = 24.',
    simTitle: 'Simulator Pembagian & Pecahan Sederhana (SD Kelas 3)',
    simParam: 'Kelereng per Anak',
    simUnit: 'butir',
    simMin: 2,
    simMax: 10,
    simStep: 2,
    simDefault: 4,
    simTarget: 6,
    simFormula: '24 Kelereng ÷ 4 Anak = 6 Kelereng/Anak',
    simExplanation: 'Geser ke 6 butir untuk membagi 24 kelereng secara adil kepada 4 anak.',
  },

  // SD KELAS 4-6 MATEMATIKA: FPB, KPK, DESIMAL, PECAHAN CAMPURAN
  {
    id: 'kl-sd46-mtk-1',
    educationLevel: EducationLevel.SD,
    kelas: 'Kelas 4',
    mapel: 'Matematika',
    title: 'FPB, KPK, Desimal & Pecahan Campuran (SD Kelas 4–6)',
    subtitle: 'Operasi pecahan campuran, konversi desimal-persen, serta penerapan FPB dan KPK dalam soal cerita',
    bookTitle: 'Buku Pelajaran Matematika Kelas 4–6 Kurikulum Merdeka',
    bookAuthor: 'Kurikulum Merdeka Indonesia — Edisi Terverifikasi Mimi V15',
    summaryPoints: [
      'FPB (Faktor Persekutuan Terbesar) dipakai untuk membagi beberapa jenis barang ke dalam paket sama banyak.',
      'KPK (Kelipatan Persekutuan Terkecil) dipakai untuk menyamakan penyebut pecahan dan menghitung jadwal bertemu kembali.',
      'Pecahan campuran 1 3/4 setara dengan pecahan biasa 7/4 atau bilangan desimal 1,75 (175%).',
    ],
    question: 'Berapakah Kelipatan Persekutuan Terkecil (KPK) dari bilangan 6 dan 8?',
    options: ['24', '12', '16', '48'],
    correctIndex: 0,
    explanation: 'Kelipatan 6 = {6, 12, 18, 24, ...} dan kelipatan 8 = {8, 16, 24, ...}. Kelipatan terkecil yang sama adalah 24.',
    simTitle: 'Laboratorium FPB, KPK & Pecahan Desimal SD',
    simParam: 'Kelipatan Bersama (KPK)',
    simUnit: 'angka',
    simMin: 6,
    simMax: 30,
    simStep: 6,
    simDefault: 12,
    simTarget: 24,
    simFormula: 'KPK(6, 8) = 2³ × 3 = 24',
    simExplanation: 'Geser nilai ke 24 untuk menemukan KPK dari bilangan 6 dan 8.',
  },

  // SD BAHASA INGGRIS KELAS 4-6: THIS IS, THAT IS, VOCAB HEWAN
  {
    id: 'kl-sd4-eng-1',
    educationLevel: EducationLevel.SD,
    kelas: 'Kelas 4',
    mapel: 'Bahasa Inggris',
    title: 'Demonstratives (This is / That is) & Animal Vocabulary',
    subtitle: 'Menunjuk benda dekat/jauh serta mengenal kosakata hewan dan benda di ruang kelas',
    bookTitle: 'My Next Words Grade 4–6 — Kurikulum Merdeka',
    bookAuthor: 'Kurikulum Merdeka Indonesia — Edisi Terverifikasi Mimi V15',
    summaryPoints: [
      '"This is..." digunakan untuk menunjuk 1 benda/hewan yang dekat (Contoh: This is a book).',
      '"That is..." digunakan untuk menunjuk 1 benda/hewan yang jauh (Contoh: That is a giraffe).',
      '"These are..." untuk benda jamak dekat, sedangkan "Those are..." untuk benda jamak jauh.',
    ],
    question: 'Look at that tall tree over there! ___ is a monkey climbing the tree (1 hewan di tempat jauh).',
    options: ['That', 'This', 'These', 'Those'],
    correctIndex: 0,
    explanation: 'Karena jumlah hewan hanya 1 (a monkey) dan posisinya jauh (over there), gunakan "That".',
    simTitle: 'Interactive English Vocab & Demonstrative Builder',
    simParam: 'Jumlah Kalimat Tepat',
    simUnit: 'kalimat',
    simMin: 2,
    simMax: 10,
    simStep: 2,
    simDefault: 4,
    simTarget: 8,
    simFormula: 'Near = This/These | Far = That/Those',
    simExplanation: 'Atur target ke 8 kalimat untuk menguasai perbedaan This, That, These, dan Those.',
  },

  // ============================================================================
  // 2. JENJANG SMP (KELAS 7 - 9)
  // ============================================================================
  // SMP KELAS 7-9 MATEMATIKA: ALJABAR, PLSV, PYTHAGORAS
  {
    id: 'kl-smp-mtk-1',
    educationLevel: EducationLevel.SMP,
    kelas: 'Kelas 8',
    mapel: 'Matematika',
    title: 'Bentuk Aljabar, PLSV & Teorema Pythagoras (SMP Kelas 7–9)',
    subtitle: 'Menyelesaikan Persamaan Linear Satu Variabel (PLSV), SPLDV, dan hipotenusa segitiga siku-siku',
    bookTitle: 'Buku Pelajaran Matematika SMP Kelas 7–9 Kurikulum Merdeka',
    bookAuthor: 'Kurikulum Merdeka Indonesia — Edisi Terverifikasi Mimi V15',
    summaryPoints: [
      'Operasi Aljabar: hanya suku-suku sejenis yang dapat dijumlahkan atau dikurangkan, misalnya 5x + 3y - 2x = 3x + 3y.',
      'Persamaan Linear Satu Variabel (PLSV): pada 4x - 6 = 18, tambahkan 6 di kedua ruas menjadi 4x = 24, sehingga x = 6.',
      'Teorema Pythagoras: pada segitiga siku-siku berlaku c² = a² + b² (contoh tripel Pythagoras: 3-4-5, 5-12-13, 8-15-17).',
    ],
    question: 'Sebuah segitiga siku-siku memiliki panjang sisi siku-siku 9 cm dan 12 cm. Berapakah panjang sisi miringnya (hipotenusa)?',
    options: ['15 cm', '14 cm', '16 cm', '18 cm'],
    correctIndex: 0,
    explanation: 'c = √(9² + 12²) = √(81 + 144) = √225 = 15 cm.',
    simTitle: 'Simulator PLSV & Teorema Pythagoras SMP',
    simParam: 'Panjang Sisi Miring (c)',
    simUnit: 'cm',
    simMin: 5,
    simMax: 20,
    simStep: 5,
    simDefault: 10,
    simTarget: 15,
    simFormula: 'c = √(9² + 12²) = √225 = 15 cm',
    simExplanation: 'Geser nilai hipotenusa ke 15 cm sesuai rumus Pythagoras c² = a² + b².',
  },

  // SMP KELAS 8 BAHASA INGGRIS: WAJIB PAST CONTINUOUS, COMPARATIVE, SIMPLE PAST, PRESENT PERFECT (BUKAN MATERI SD!)
  {
    id: 'kl-smp8-eng-1',
    educationLevel: EducationLevel.SMP,
    kelas: 'Kelas 8',
    mapel: 'Bahasa Inggris',
    title: 'Past Continuous, Comparative Degree & Simple Past (SMP Kelas 8)',
    subtitle: 'Memahami aksi yang sedang berlangsung di masa lampau, perbandingan sifat (Comparative & Superlative), serta Recount Text',
    bookTitle: 'English for Nusantara untuk SMP/MTs Kelas VIII',
    bookAuthor: 'Kurikulum Merdeka Indonesia — Edisi Terverifikasi Mimi V15',
    summaryPoints: [
      'Past Continuous Tense (was/were + V-ing) menyatakan kejadian yang sedang berlangsung di waktu tertentu di masa lampau (Contoh: While I was studying, my brother called).',
      'Comparative Degree membandingkan dua hal menggunakan "-er than" atau "more ... than" (Contoh: faster than, more diligent than).',
      'Simple Past (V2) & Present Perfect (have/has + V3) digunakan untuk menceritakan pengalaman dan aksi yang berdampak hingga kini.',
    ],
    question: '[Comparative & Past Continuous SMP Kelas 8] While Raka ___ his physics project last night, he realized that a digital sensor is ___ than an analog thermometer.',
    options: [
      'was testing / more accurate',
      'is testing / most accurate',
      'tested / accurate',
      'were testing / accurater',
    ],
    correctIndex: 0,
    explanation: 'Subjek tunggal Raka setelah "While ... last night" menggunakan Past Continuous (was testing), dan perbandingan 2 benda dengan kata sifat 3 suku kata menggunakan "more accurate than".',
    simTitle: 'Simulator Grammar SMP Kelas 8: Past Continuous & Comparative',
    simParam: 'Akurasi Struktur Grammar',
    simUnit: 'skor',
    simMin: 20,
    simMax: 100,
    simStep: 20,
    simDefault: 60,
    simTarget: 100,
    simFormula: 'While + S + was/were + V-ing | Adj-er / more Adj + than',
    simExplanation: 'Atur skor ke 100 untuk memverifikasi pola Past Continuous dan Comparative Degree Kelas 8.',
  },

  // ============================================================================
  // 3. JENJANG SMA & SMK (KELAS 10 - 12)
  // ============================================================================
  // SMA/SMK MATEMATIKA: LOGARITMA, TRIGONOMETRI & KALKULUS DASAR
  {
    id: 'kl-sma-mtk-1',
    educationLevel: EducationLevel.SMA,
    kelas: 'Kelas 10',
    mapel: 'Matematika',
    title: 'Eksponen, Logaritma & Perbandingan Trigonometri (SMA/SMK Kelas 10–12)',
    subtitle: 'Sifat operasi logaritma, sudut istimewa sin-cos-tan, serta pengantar turunan fungsi aljabar',
    bookTitle: 'Buku Pelajaran Matematika SMA/SMK Kelas 10–12 Kurikulum Merdeka',
    bookAuthor: 'Kurikulum Merdeka Indonesia — Edisi Terverifikasi Mimi V15',
    summaryPoints: [
      'Sifat Logaritma: ᵃlog(b × c) = ᵃlog b + ᵃlog c, dan ᵃlog(b / c) = ᵃlog b - ᵃlog c.',
      'Trigonometri Siku-Siku (Demi-Sami-Desa): sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1.',
      'Turunan pertama fungsi f(x) = a·xⁿ adalah f\'(x) = n·a·xⁿ⁻¹.',
    ],
    question: 'Nilai dari ²log 16 + ³log 27 - ⁵log 25 adalah...',
    options: ['5', '4', '6', '7'],
    correctIndex: 0,
    explanation: '²log 16 = 4 (karena 2⁴ = 16), ³log 27 = 3 (karena 3³ = 27), dan ⁵log 25 = 2 (karena 5² = 25). Maka 4 + 3 - 2 = 5.',
    simTitle: 'Laboratorium Logaritma & Trigonometri SMA/SMK',
    simParam: 'Eksponen Basis 2 (2ⁿ)',
    simUnit: 'pangkat',
    simMin: 1,
    simMax: 6,
    simStep: 1,
    simDefault: 3,
    simTarget: 4,
    simFormula: '²log(2⁴) = ²log 16 = 4',
    simExplanation: 'Geser eksponen ke 4 sehingga ²log 16 bernilai tepat 4.',
  },

  // SMA/SMK BAHASA INDONESIA: TEKS ARGUMENTASI & EKSPOSISI ANALITIS
  {
    id: 'kl-sma-indo-1',
    educationLevel: EducationLevel.SMA,
    kelas: 'Kelas 11',
    mapel: 'Bahasa Indonesia',
    title: 'Teks Argumentasi, Penalaran Kritis & Karya Ilmiah (SMA/SMK Kelas 10–12)',
    subtitle: 'Menyusun tesis, argumen berbasis data valid, serta membedakan fakta dan opini dalam teks argumentasi',
    bookTitle: 'Cerdas Cergas Berbahasa dan Bersastra Indonesia SMA/SMK Kelas 10–12',
    bookAuthor: 'Kurikulum Merdeka Indonesia — Edisi Terverifikasi Mimi V15',
    summaryPoints: [
      'Struktur Teks Argumentasi meliputi: Pendahuluan (Tesis/Pendapat Utama), Tubuh Argumen (Bukti & Data Fakta), serta Kesimpulan.',
      'Paragraf Deduktif menempatkan kalimat utama di awal paragraf, sedangkan Paragraf Induktif menempatkan simpulan utama di akhir paragraf.',
      'Argumen yang kuat wajib didukung fakta terukur, data statistik, atau hasil penelitian yang objektif.',
    ],
    question: 'Bagian dalam struktur teks argumentasi yang berisi paparan data, fakta lapangan, dan bukti ilmiah untuk memperkuat pendapat penulis disebut...',
    options: ['Tubuh Argumen', 'Orientasi Naratif', 'Koda Cerita', 'Abstrak Fiksi'],
    correctIndex: 0,
    explanation: 'Tubuh argumen berisi rangkaian alasan logis beserta bukti dan data faktual yang mendukung tesis.',
    simTitle: 'Simulator Kekuatan Bukti Teks Argumentasi',
    simParam: 'Jumlah Data Fakta Pendukung',
    simUnit: 'bukti',
    simMin: 1,
    simMax: 5,
    simStep: 1,
    simDefault: 2,
    simTarget: 4,
    simFormula: 'Tesis + 4 Data Faktual = Argumen Kredibel',
    simExplanation: 'Atur ke 4 bukti faktual agar paragraf argumentasi menjadi kuat dan meyakinkan.',
  },

  // ============================================================================
  // 4. JENJANG UMUM / RANDOM (HANYA 2 KATEGORI: Pengetahuan Umum & Bahasa Inggris Umum)
  // ============================================================================
  {
    id: 'kl-umum-pu-1',
    educationLevel: EducationLevel.UMUM,
    kelas: 'Umum',
    mapel: 'Pengetahuan Umum',
    title: 'Cerdas Cermat Pengetahuan Umum: Sains, Sejarah & Rekor Dunia (HAGO & Millionaire Style)',
    subtitle: 'Kumpulan wawasan populer Nusantara, penemuan sains, geografi dunia, dan fakta unik',
    bookTitle: 'Ensiklopedia Cerdas Cermat Pengetahuan Umum Nusantara & Dunia',
    bookAuthor: 'Database Internal Mimi V15 — Edisi Cerdas Cermat',
    summaryPoints: [
      'Sejarah Nusantara: Perang Diponegoro berlangsung tahun 1825–1830 dipimpin Pangeran Diponegoro; Proklamasi Kemerdekaan RI dibacakan 17 Agustus 1945.',
      'Sains & Astronomi: Fotosintesis menghasilkan oksigen (O₂) dan glukosa; Hukum Newton menjelaskan kelembaman, percepatan gaya (F = m·a), dan aksi-reaksi.',
      'Geografi & Dunia: Samudra terluas adalah Samudra Pasifik; sungai terpanjang di Indonesia adalah Sungai Kapuas di Kalimantan Barat.',
    ],
    question: 'Sungai manakah yang menyandang predikat sebagai sungai terpanjang di Indonesia yang membentang sepanjang 1.143 km di Pulau Kalimantan?',
    options: ['Sungai Kapuas', 'Sungai Musi', 'Sungai Bengawan Solo', 'Sungai Brantas'],
    correctIndex: 0,
    explanation: 'Sungai Kapuas di Kalimantan Barat adalah sungai terpanjang di Indonesia dengan panjang sekitar 1.143 km.',
    simTitle: 'Simulator Skor Cerdas Cermat Pengetahuan Umum',
    simParam: 'Level Tantangan Millionaire',
    simUnit: 'tier',
    simMin: 1,
    simMax: 10,
    simStep: 1,
    simDefault: 5,
    simTarget: 10,
    simFormula: 'Tier 10 = Grandmaster Cerdas Cermat Umum',
    simExplanation: 'Geser ke Tier 10 untuk menguji wawasan puncak ala Who Wants to Be a Millionaire.',
  },
  {
    id: 'kl-umum-eng-1',
    educationLevel: EducationLevel.UMUM,
    kelas: 'Umum',
    mapel: 'Bahasa Inggris Umum',
    title: 'Cerdas Cermat Bahasa Inggris Umum: Idioms, Vocab & Daily Conversation',
    subtitle: 'Tantangan kosakata populer, phrasal verbs, idiom sehari-hari, dan grammar praktis ala kuis interaktif',
    bookTitle: 'Kuis Cerdas Cermat Bahasa Inggris Umum & Komunikasi Global',
    bookAuthor: 'Database Internal Mimi V15 — Edisi English Challenge',
    summaryPoints: [
      'Idiom Populer: "Break a leg" = Semoga sukses; "Hit the books" = Belajar sungguh-sungguh; "Piece of cake" = Sangat mudah.',
      'Phrasal Verbs: "Figure out" = memahami/menemukan solusi; "Give up" = menyerah; "Look forward to" = menantikan dengan antusias.',
      'Sinonim & Kosakata: "Significant" = penting/berarti; "Resilient" = tangguh; "Collaborate" = bekerja sama.',
    ],
    question: 'Jika seseorang berkata "The English quiz was a piece of cake!", apa maksud dari idiom "a piece of cake" tersebut?',
    options: [
      'Kuis tersebut sangat mudah dikerjakan',
      'Kuis tersebut berhadiah sepotong kue ulang tahun',
      'Kuis tersebut sangat sulit dan membingungkan',
      'Kuis tersebut dibatalkan oleh panitia',
    ],
    correctIndex: 0,
    explanation: 'Idiom "a piece of cake" dalam Bahasa Inggris berarti sesuatu yang sangat mudah dilakukan.',
    simTitle: 'Simulator Mastery Bahasa Inggris Umum',
    simParam: 'Penguasaan Idiom & Vocab',
    simUnit: 'level',
    simMin: 1,
    simMax: 10,
    simStep: 1,
    simDefault: 5,
    simTarget: 9,
    simFormula: 'Level 9 = Fluent Idioms & Smart Vocabulary',
    simExplanation: 'Geser ke Level 9 untuk menguasai ekspresi Bahasa Inggris Umum secara natural.',
  },
];

/**
 * Bank Soal Tambahan dengan Variasi Redaksi Pertanyaan (SD, SMP, SMA/SMK, & Umum 2 Kategori)
 */
export const KURIKULUM_LENGKAP_QUESTIONS: AdaptiveQuestion[] = [
  // ── SD KELAS 1 MATEMATIKA (HANYA 1-20 PENJUMLAHAN & PENGURANGAN, TANPA ALJABAR!) ──
  {
    id: 'klq-sd1-mtk-1',
    q: 'Rani memetik 9 bunga mawar di taman, lalu memetik lagi 5 bunga melati. Berapa jumlah seluruh bunga yang dipetik Rani?',
    options: ['14 bunga', '13 bunga', '15 bunga', '12 bunga'],
    answer: 0,
    type: 'penjumlahan1_20',
    level: 'pemula',
    subject: 'mtk',
    classKey: 'sd1',
    explanation: '9 ditambah 1 jadi 10, lalu ditambah 4 sama dengan 14 bunga.',
  },
  {
    id: 'klq-sd1-mtk-2',
    q: 'Di dalam akuarium ada 17 ikan hias. Sebanyak 5 ikan dipindahkan ke kolam kecil. Berapa sisa ikan di dalam akuarium?',
    options: ['12 ikan', '11 ikan', '13 ikan', '10 ikan'],
    answer: 0,
    type: 'pengurangan1_20',
    level: 'menengah',
    subject: 'mtk',
    classKey: 'sd1',
    explanation: '17 dikurangi 5 sama dengan 12 ikan hias.',
  },
  {
    id: 'klq-sd1-mtk-3',
    q: 'Budi punya 11 kelereng, lalu Kakak memberinya 7 kelereng lagi. Berapa jumlah kelereng Budi sekarang?',
    options: ['18 kelereng', '17 kelereng', '19 kelereng', '16 kelereng'],
    answer: 0,
    type: 'penjumlahan1_20',
    level: 'mahir',
    subject: 'mtk',
    classKey: 'sd1',
    explanation: '11 + 7 = 18 kelereng.',
  },

  // ── SMP KELAS 8 BAHASA INGGRIS (PAST CONTINUOUS, COMPARATIVE, SIMPLE PAST, PRESENT PERFECT) ──
  {
    id: 'klq-smp8-eng-1',
    q: '[Past Continuous Tense] What ___ you doing at 8 o’clock last night when I called your phone?',
    options: ['were', 'was', 'are', 'did'],
    answer: 0,
    type: 'pastContinuous',
    level: 'pemula',
    subject: 'inggris',
    classKey: 'kelas8',
    explanation: 'Pada Past Continuous Tense ("at 8 o\'clock last night"), subjek "you" berpasangan dengan to be lampau "were".',
  },
  {
    id: 'klq-smp8-eng-2',
    q: '[Comparative Degree] Mount Semeru is 3,676 meters high, while Mount Bromo is 2,329 meters high. Therefore, Mount Semeru is ___ than Mount Bromo.',
    options: ['higher', 'highest', 'more high', 'as high'],
    answer: 0,
    type: 'comparative',
    level: 'menengah',
    subject: 'inggris',
    classKey: 'kelas8',
    explanation: 'Kata sifat 1 suku kata "high" dalam bentuk Comparative Degree (lebih tinggi daripada) ditambah akhiran "-er" menjadi "higher than".',
  },
  {
    id: 'klq-smp8-eng-3',
    q: '[Comparative Degree] According to the students, solving a real-world coding project is ___ than memorizing long theories.',
    options: ['more interesting', 'interestinger', 'most interesting', 'as interesting'],
    answer: 0,
    type: 'comparative',
    level: 'mahir',
    subject: 'inggris',
    classKey: 'kelas8',
    explanation: 'Kata sifat "interesting" memiliki lebih dari dua suku kata, sehingga bentuk perbandingannya adalah "more interesting than".',
  },
  {
    id: 'klq-smp8-eng-4',
    q: '[Past Continuous & Simple Past] The students ___ a biology experiment in the laboratory when the school bell rang.',
    options: ['were conducting', 'was conducting', 'conduct', 'are conducting'],
    answer: 0,
    type: 'pastContinuous',
    level: 'ahli',
    subject: 'inggris',
    classKey: 'kelas8',
    explanation: 'Subjek jamak "The students" yang sedang melakukan kegiatan di masa lampau saat bel berbunyi menggunakan "were + V-ing (were conducting)".',
  },

  // ── SMA/SMK KELAS 10-12: LOGARITMA, TRIGONOMETRI & TEKS ARGUMENTASI ──
  {
    id: 'klq-sma-mtk-1',
    q: '[Logaritma SMA/SMK] Jika diketahui ²log 3 = a dan ³log 5 = b, maka nilai dari ²log 15 dinyatakan dalam a dan b adalah...',
    options: ['a(1 + b)', 'a + b', 'a · b', '1 + ab'],
    answer: 0,
    type: 'logaritma',
    level: 'mahir',
    subject: 'mtk',
    classKey: 'sma10',
    explanation: '²log 15 = ²log(3 × 5) = ²log 3 + ²log 5. Karena ²log 5 = ²log 3 × ³log 5 = a·b, maka ²log 15 = a + ab = a(1 + b).',
  },
  {
    id: 'klq-sma-mtk-2',
    q: '[Trigonometri SMA/SMK] Sebuah tangga bersandar pada dinding dengan sudut kemiringan 60° terhadap lantai. Jika panjang tangga 6 meter, tinggi ujung tangga dari lantai (6 × sin 60°) adalah...',
    options: ['3√3 meter', '3 meter', '6√3 meter', '2√3 meter'],
    answer: 0,
    type: 'trigonometri',
    level: 'menengah',
    subject: 'mtk',
    classKey: 'sma11',
    explanation: 'Tinggi dinding = panjang tangga × sin 60° = 6 × (1/2 √3) = 3√3 meter.',
  },
  {
    id: 'klq-sma-indo-1',
    q: '[Teks Argumentasi SMA/SMK] Kalimat manakah di bawah ini yang merupakan kalimat fakta pendukung yang valid dalam teks argumentasi bertema energi terbarukan?',
    options: [
      'Berdasarkan data Kementerian ESDM, potensi energi surya di Indonesia mencapai lebih dari 200 gigawatt.',
      'Menurut saya pribadi, panel surya terlihat sangat keren jika dipasang di semua atap rumah.',
      'Sepertinya tahun depan semua kendaraan akan terbang menggunakan tenaga angin.',
      'Energi matahari mungkin adalah satu-satunya solusi yang paling mudah dibuat oleh siapa saja.',
    ],
    answer: 0,
    type: 'teksArgumentasi',
    level: 'menengah',
    subject: 'indo',
    classKey: 'sma11',
    explanation: 'Kalimat fakta memuat data terukur dan sumber lembaga resmi yang dapat diverifikasi kebenarannya.',
  },

  // ── LEVEL UMUM / RANDOM — KATEGORI 1: PENGETAHUAN UMUM (HAGO / MILLIONAIRE / CERDAS CERMAT) ──
  {
    id: 'klq-umum-pu-1',
    q: '[Millionaire Pengetahuan Umum] Perang besar di Pulau Jawa pada tahun 1825–1830 yang dipimpin oleh Pangeran Ontowiryo dikenal dalam sejarah Indonesia sebagai...',
    options: ['Perang Diponegoro', 'Perang Padri', 'Perang Puputan Margarana', 'Perang Banjar'],
    answer: 0,
    type: 'sejarahNusantara',
    level: 'pemula',
    subject: 'umum',
    classKey: 'umum',
    explanation: 'Pangeran Ontowiryo adalah nama kecil Pangeran Diponegoro yang memimpin Perang Jawa (Perang Diponegoro) tahun 1825–1830.',
  },
  {
    id: 'klq-umum-pu-2',
    q: '[HAGO Cerdas Cermat] Gas apakah di atmosfer Bumi yang diserap oleh tumbuhan hijau melalui stomata daun sebagai bahan baku utama proses fotosintesis?',
    options: ['Karbon dioksida (CO₂)', 'Oksigen (O₂)', 'Helium (He)', 'Argon (Ar)'],
    answer: 0,
    type: 'sainsPopuler',
    level: 'pemula',
    subject: 'umum',
    classKey: 'umum',
    explanation: 'Tumbuhan menyerap karbon dioksida (CO₂) dan air untuk diubah menjadi glukosa serta oksigen dengan bantuan cahaya matahari.',
  },
  {
    id: 'klq-umum-pu-3',
    q: '[Tantangan Cerdas Cermat] Saat kita berada di dalam mobil yang melaju kencang lalu direm mendadak, tubuh kita terdorong ke depan. Fenomena ini adalah contoh nyata dari...',
    options: ['Hukum I Newton (Kelembaman / Inersia)', 'Hukum Archimedes', 'Hukum Pascal', 'Efek Doppler'],
    answer: 0,
    type: 'fisikaPopuler',
    level: 'menengah',
    subject: 'umum',
    classKey: 'umum',
    explanation: 'Hukum I Newton (Hukum Kelembaman/Inersia) menyatakan benda cenderung mempertahankan keadaan geraknya.',
  },
  {
    id: 'klq-umum-pu-4',
    q: '[Trivia Dunia HAGO] Negara manakah di kawasan Asia Tenggara yang tidak pernah dijajah oleh bangsa Eropa dan dikenal dengan julukan Negeri Gajah Putih?',
    options: ['Thailand', 'Vietnam', 'Filipina', 'Myanmar'],
    answer: 0,
    type: 'triviaDunia',
    level: 'menengah',
    subject: 'umum',
    classKey: 'umum',
    explanation: 'Thailand (dahulu Kerajaan Siam) adalah satu-satunya negara di Asia Tenggara yang tidak pernah dijajah bangsa Barat.',
  },
  {
    id: 'klq-umum-pu-5',
    q: '[Millionaire Sains] Planet manakah di Tata Surya kita yang memiliki ukuran paling besar sekaligus satelit alami terbanyak seperti Ganymede dan Europa?',
    options: ['Jupiter', 'Mars', 'Merkurius', 'Venus'],
    answer: 0,
    type: 'astronomi',
    level: 'mahir',
    subject: 'umum',
    classKey: 'umum',
    explanation: 'Jupiter adalah planet terbesar di Tata Surya dan memiliki satelit terkenal yaitu Io, Europa, Ganymede, dan Callisto.',
  },
  {
    id: 'klq-umum-pu-6',
    q: '[Cerdas Cermat Nusantara] Danau vulkanik terbesar di dunia yang terletak di Provinsi Sumatera Utara dan memiliki Pulau Samosir di tengahnya adalah...',
    options: ['Danau Toba', 'Danau Singkarak', 'Danau Sentani', 'Danau Towuti'],
    answer: 0,
    type: 'geografiIndonesia',
    level: 'ahli',
    subject: 'umum',
    classKey: 'umum',
    explanation: 'Danau Toba di Sumatera Utara merupakan danau kaldera vulkanik terbesar di dunia.',
  },

  // ── LEVEL UMUM / RANDOM — KATEGORI 2: BAHASA INGGRIS UMUM (HAGO / MILLIONAIRE / CERDAS CERMAT) ──
  {
    id: 'klq-umum-en-1',
    q: '[Cerdas Cermat Bahasa Inggris] Saat sahabatmu akan tampil di panggung lomba pidato, ungkapan idiom Bahasa Inggris yang berarti "Semoga sukses!" adalah...',
    options: ['Break a leg!', 'Spill the beans!', 'Bite the bullet!', 'Under the weather!'],
    answer: 0,
    type: 'englishIdiom',
    level: 'pemula',
    subject: 'inggris',
    classKey: 'umum',
    explanation: '"Break a leg!" adalah idiom populer untuk mendoakan semoga sukses sebelum tampil atau ujian.',
  },
  {
    id: 'klq-umum-en-2',
    q: '[HAGO English Quiz] Pilihlah kata yang tepat untuk melengkapi kalimat ini: "Even though the puzzle was tricky, we managed to ___ the solution together."',
    options: ['figure out', 'give up', 'turn off', 'run out'],
    answer: 0,
    type: 'phrasalVerb',
    level: 'menengah',
    subject: 'inggris',
    classKey: 'umum',
    explanation: 'Phrasal verb "figure out" berarti berhasil memahami atau menemukan jalan keluar dari suatu masalah.',
  },
  {
    id: 'klq-umum-en-3',
    q: '[Millionaire English Challenge] Manakah antonim (lawan kata) yang paling tepat dari kata "Ancient" (Kuno / Purba)?',
    options: ['Modern', 'Antique', 'Historic', 'Old-fashioned'],
    answer: 0,
    type: 'englishAntonym',
    level: 'menengah',
    subject: 'inggris',
    classKey: 'umum',
    explanation: '"Ancient" berarti sangat tua atau kuno, sehingga lawan katanya adalah "Modern".',
  },
  {
    id: 'klq-umum-en-4',
    q: '[HAGO Speed English] Jika temanmu berkata "I am feeling a bit under the weather today", apa yang sedang ia rasakan?',
    options: [
      'Sedang kurang enak badan / sedikit sakit',
      'Sedang kehujanan di luar rumah',
      'Sedang mengamati ramalan cuaca',
      'Sedang sangat gembira karena liburan',
    ],
    answer: 0,
    type: 'englishIdiom',
    level: 'mahir',
    subject: 'inggris',
    classKey: 'umum',
    explanation: 'Idiom "under the weather" berarti merasa kurang sehat atau tidak enak badan.',
  },
  {
    id: 'klq-umum-en-5',
    q: '[Cerdas Cermat English Grammar] "Neither the teacher nor the students ___ late for the morning assembly today."',
    options: ['were', 'was', 'is', 'has been'],
    answer: 0,
    type: 'subjectVerbAgreement',
    level: 'ahli',
    subject: 'inggris',
    classKey: 'umum',
    explanation: 'Pada korelasi "Neither ... nor ...", kata kerja mengikuti subjek yang paling dekat ("the students" = jamak), sehingga menggunakan "were".',
  },
  {
    id: 'klq-umum-en-6',
    q: '[Millionaire Vocabulary] A person who can speak two languages fluently is called...',
    options: ['Bilingual', 'Monolingual', 'Illiterate', 'Anonymous'],
    answer: 0,
    type: 'vocabulary',
    level: 'pemula',
    subject: 'inggris',
    classKey: 'umum',
    explanation: '"Bilingual" berarti mampu berbicara dalam dua bahasa dengan lancar.',
  },
];
