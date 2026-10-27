/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AdaptiveQuestion, QUESTION_BANK_INGGRIS } from './questionBankInggris';
import { QUESTION_BANK_PKN } from './questionBankPKN';
import { KURIKULUM_LENGKAP_QUESTIONS } from './kurikulumLengkap';

interface RawTopicQuestion {
  q: string;
  options: string[];
  answer: number;
  type: string;
  level: 'pemula' | 'menengah' | 'mahir' | 'ahli';
  subject: 'mtk' | 'ipa' | 'ips' | 'indo' | 'umum';
  explanation: string;
  targetClasses?: string[];
}

// ── KHUSUS SD KELAS 1-3 (IPA, IPS, INDO DASAR) ──
const SD_LOWER_NON_MATH: RawTopicQuestion[] = [
  {
    q: 'Pancaindra manusia yang digunakan untuk melihat keindahan pelangi adalah...',
    options: ['Mata', 'Telinga', 'Hidung', 'Kulit'],
    answer: 0,
    type: 'pancaindra',
    level: 'pemula',
    subject: 'ipa',
    explanation: 'Mata adalah indra penglihatan untuk melihat warna dan benda di sekitar kita.',
    targetClasses: ['sd1', 'sd2', 'sd3'],
  },
  {
    q: 'Agar gigi tetap sehat, bersih, dan tidak berlubang, kita harus rajin...',
    options: [
      'Menggosok gigi setelah makan dan sebelum tidur',
      'Makan permen sebanyak-banyaknya sebelum tidur',
      'Tidak pernah berkumur dengan air bersih',
      'Menggigit benda yang sangat keras',
    ],
    answer: 0,
    type: 'kesehatanTubuh',
    level: 'pemula',
    subject: 'ipa',
    explanation: 'Menggosok gigi secara teratur pagi setelah sarapan dan malam sebelum tidur menjaga kesehatan gigi.',
    targetClasses: ['sd1', 'sd2', 'sd3'],
  },
  {
    q: 'Benda langit yang bersinar terang pada siang hari dan memberikan cahaya hangat bagi Bumi adalah...',
    options: ['Matahari', 'Bulan sabit', 'Bintang kejora', 'Pelangi malam'],
    answer: 0,
    type: 'bendaLangit',
    level: 'menengah',
    subject: 'ipa',
    explanation: 'Matahari tampak bersinar terang di siang hari sebagai sumber energi cahaya dan panas.',
    targetClasses: ['sd1', 'sd2', 'sd3'],
  },
  {
    q: 'Bagian tumbuhan yang berada di dalam tanah dan berfungsi menyerap air adalah...',
    options: ['Akar', 'Bunga', 'Buah', 'Pucuk daun'],
    answer: 0,
    type: 'bagianTumbuhan',
    level: 'mahir',
    subject: 'ipa',
    explanation: 'Akar tumbuhan tumbuh di dalam tanah untuk menyerap air dan zat hara.',
    targetClasses: ['sd1', 'sd2', 'sd3'],
  },
  {
    q: 'Keluarga inti di rumah terdiri dari...',
    options: ['Ayah, Ibu, dan Anak', 'Tetangga sebelah desa', 'Pedagang di pasar', 'Sopir bus kota'],
    answer: 0,
    type: 'keluargaInti',
    level: 'pemula',
    subject: 'ips',
    explanation: 'Keluarga inti terdiri dari ayah, ibu, dan anak (kakak/adik).',
    targetClasses: ['sd1', 'sd2', 'sd3'],
  },
  {
    q: 'Sebelum berangkat ke sekolah di pagi hari, sikap sopan kepada ayah dan ibu adalah...',
    options: [
      'Berpamitan dan mencium tangan orang tua',
      'Langsung lari keluar rumah tanpa bicara',
      'Menangis minta mainan baru',
      'Membuang tas sekolah di lantai',
    ],
    answer: 0,
    type: 'sikapKeluarga',
    level: 'menengah',
    subject: 'ips',
    explanation: 'Berpamitan kepada orang tua sebelum berangkat sekolah adalah perbuatan santun dan terpuji.',
    targetClasses: ['sd1', 'sd2', 'sd3'],
  },
  {
    q: 'Huruf-huruf berikut ini yang semuanya termasuk huruf vokal (huruf hidup) adalah...',
    options: ['a, i, u, e, o', 'b, c, d, f, g', 'k, l, m, n, p', 'r, s, t, v, w'],
    answer: 0,
    type: 'hurufVokal',
    level: 'pemula',
    subject: 'indo',
    explanation: 'Huruf vokal dalam abjad Bahasa Indonesia terdiri dari 5 huruf: a, i, u, e, o.',
    targetClasses: ['sd1', 'sd2', 'sd3'],
  },
  {
    q: 'Saat kita tidak sengaja menjatuhkan pensil milik teman di kelas, kata yang santun kita ucapkan adalah...',
    options: ['Maaf', 'Cepat ambil', 'Awas kamu', 'Jangan pinjam'],
    answer: 0,
    type: 'kataSantun',
    level: 'pemula',
    subject: 'indo',
    explanation: 'Kata "Maaf" diucapkan dengan tulus saat kita melakukan kesalahan.',
    targetClasses: ['sd1', 'sd2', 'sd3'],
  },
  {
    q: 'Kata "B - O - L - A" jika dieja menurut suku katanya menjadi...',
    options: ['bo - la', 'bol - a', 'b - ola', 'bo - l - a'],
    answer: 0,
    type: 'sukuKata',
    level: 'menengah',
    subject: 'indo',
    explanation: 'Kata "bola" terdiri dari dua suku kata yaitu "bo" dan "la".',
    targetClasses: ['sd1', 'sd2', 'sd3'],
  },
];

// ── KHUSUS SD KELAS 4-6 (IPA, IPS, INDO) ──
const SD_UPPER_NON_MATH: RawTopicQuestion[] = [
  {
    q: 'Proses tumbuhan hijau memasak makanannya sendiri dengan bantuan cahaya matahari dan klorofil disebut...',
    options: ['Fotosintesis', 'Evaporasi', 'Adaptasi', 'Metamorfosis'],
    answer: 0,
    type: 'fotosintesis',
    level: 'pemula',
    subject: 'ipa',
    explanation: 'Fotosintesis adalah proses pembuatan makanan pada tumbuhan hijau menggunakan air, CO2, dan cahaya matahari.',
    targetClasses: ['sd4', 'sd5', 'sd6', 'sd'],
  },
  {
    q: 'Dalam siklus air, proses berubahnya uap air di atmosfer menjadi titik-titik air pembentuk awan disebut...',
    options: ['Kondensasi', 'Evaporasi', 'Presipitasi', 'Infiltrasi'],
    answer: 0,
    type: 'siklusAir',
    level: 'menengah',
    subject: 'ipa',
    explanation: 'Kondensasi adalah pengembunan uap air menjadi titik-titik air di awan.',
    targetClasses: ['sd4', 'sd5', 'sd6', 'sd'],
  },
  {
    q: 'Peristiwa jatuhnya buah mangga dari pohonnya ke tanah disebabkan oleh adanya gaya...',
    options: ['Gaya gravitasi Bumi', 'Gaya magnet', 'Gaya pegas', 'Gaya listrik statis'],
    answer: 0,
    type: 'gayaSD',
    level: 'pemula',
    subject: 'ipa',
    explanation: 'Gaya gravitasi Bumi menarik semua benda menuju pusat Bumi.',
    targetClasses: ['sd4', 'sd5', 'sd6', 'sd'],
  },
  {
    q: 'Kegiatan menyalurkan barang hasil produksi dari pabrik atau petani kepada konsumen disebut kegiatan...',
    options: ['Distribusi', 'Produksi', 'Konsumsi', 'Rekreasi'],
    answer: 0,
    type: 'kegiatanEkonomi',
    level: 'pemula',
    subject: 'ips',
    explanation: 'Distribusi adalah kegiatan menyalurkan barang dari produsen ke konsumen.',
    targetClasses: ['sd4', 'sd5', 'sd6', 'sd'],
  },
  {
    q: 'Rumah adat Gadang yang memiliki atap melengkung menyerupai tanduk kerbau berasal dari provinsi...',
    options: ['Sumatera Barat', 'Jawa Tengah', 'Papua', 'Sulawesi Selatan'],
    answer: 0,
    type: 'budayaNusantara',
    level: 'menengah',
    subject: 'ips',
    explanation: 'Rumah Gadang adalah rumah adat tradisional masyarakat Minangkabau di Sumatera Barat.',
    targetClasses: ['sd4', 'sd5', 'sd6', 'sd'],
  },
  {
    q: 'Gagasan utama yang menjadi dasar pengembangan sebuah paragraf dalam bacaan disebut...',
    options: ['Ide pokok', 'Kalimat tambahan', 'Daftar pustaka', 'Catatan kaki'],
    answer: 0,
    type: 'idePokok',
    level: 'pemula',
    subject: 'indo',
    explanation: 'Ide pokok (gagasan utama) adalah inti pembahasan dalam suatu paragraf.',
    targetClasses: ['sd4', 'sd5', 'sd6', 'sd'],
  },
];

// ── SMP & SMA/SMK MULTI SUBJECT (MTK, IPA, IPS, INDO, UMUM) ──
const CURATED_MULTI_SUBJECT: RawTopicQuestion[] = [
  // ── MATEMATIKA SMP (Kelas 7, 8, 9) ──
  {
    q: 'Hasil dari (-18) + 30 - (-12) adalah...',
    options: ['24', '0', '12', '-24'],
    answer: 0,
    type: 'bilanganBulat',
    level: 'pemula',
    subject: 'mtk',
    explanation: '(-18) + 30 = 12, kemudian 12 - (-12) = 12 + 12 = 24.',
    targetClasses: ['kelas7', 'kelas8', 'kelas9'],
  },
  {
    q: 'Bentuk sederhana dari aljabar 5x + 3y - 2x + 4y adalah...',
    options: ['3x + 7y', '7x + 7y', '3x + y', '7x - y'],
    answer: 0,
    type: 'aljabarDasar',
    level: 'pemula',
    subject: 'mtk',
    explanation: 'Kelompokkan suku sejenis: (5x - 2x) + (3y + 4y) = 3x + 7y.',
    targetClasses: ['kelas7', 'kelas8', 'kelas9'],
  },
  {
    q: 'Jika 3x - 7 = 14, maka nilai x yang memenuhi persamaan linear tersebut adalah...',
    options: ['7', '5', '9', '3'],
    answer: 0,
    type: 'persamaanLinear',
    level: 'menengah',
    subject: 'mtk',
    explanation: '3x = 14 + 7 -> 3x = 21 -> x = 21 / 3 = 7.',
    targetClasses: ['kelas7', 'kelas8', 'kelas9'],
  },
  {
    q: 'Sebuah segitiga siku-siku memiliki alas 6 cm dan tinggi 8 cm. Panjang sisi miring (hipotenusa) segitiga tersebut adalah...',
    options: ['10 cm', '12 cm', '14 cm', '9 cm'],
    answer: 0,
    type: 'pythagoras',
    level: 'menengah',
    subject: 'mtk',
    explanation: 'Menggunakan Teorema Pythagoras: c = √(6² + 8²) = √(36 + 64) = √100 = 10 cm.',
    targetClasses: ['kelas8', 'kelas9'],
  },
  {
    q: 'Gradien garis yang memiliki persamaan y = 4x - 9 adalah...',
    options: ['4', '-9', '-4', '9'],
    answer: 0,
    type: 'persamaanGaris',
    level: 'mahir',
    subject: 'mtk',
    explanation: 'Pada persamaan y = mx + c, koefisien x yaitu m adalah gradien garis (m = 4).',
    targetClasses: ['kelas8', 'kelas9'],
  },
  {
    q: 'Akar-akar persamaan kuadrat x² - 7x + 12 = 0 adalah...',
    options: ['x = 3 atau x = 4', 'x = -3 atau x = -4', 'x = 2 atau x = 6', 'x = 1 atau x = 12'],
    answer: 0,
    type: 'persamaanKuadrat',
    level: 'ahli',
    subject: 'mtk',
    explanation: 'Faktorkan (x - 3)(x - 4) = 0, sehingga x = 3 atau x = 4.',
    targetClasses: ['kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },

  // ── MATEMATIKA SMA / SMK (Kelas 10, 11, 12: Logaritma, Trigonometri, Kalkulus Dasar) ──
  {
    q: '[Logaritma] Nilai dari ²log 16 + ³log 27 adalah...',
    options: ['7', '6', '8', '5'],
    answer: 0,
    type: 'logaritma',
    level: 'pemula',
    subject: 'mtk',
    explanation: '²log 16 = ²log(2⁴) = 4 dan ³log 27 = ³log(3³) = 3. Maka 4 + 3 = 7.',
    targetClasses: ['sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: '[Logaritma] Nilai dari ⁵log 100 - ⁵log 4 adalah...',
    options: ['2', '3', '4', '5'],
    answer: 0,
    type: 'logaritma',
    level: 'menengah',
    subject: 'mtk',
    explanation: 'Gunakan sifat logaritma: ⁵log(100 / 4) = ⁵log 25 = ⁵log(5²) = 2.',
    targetClasses: ['sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: '[Trigonometri] Nilai dari sin 30° + cos 60° adalah...',
    options: ['1', '1/2', '0', '√3'],
    answer: 0,
    type: 'trigonometri',
    level: 'pemula',
    subject: 'mtk',
    explanation: 'sin 30° = 1/2 dan cos 60° = 1/2, sehingga 1/2 + 1/2 = 1.',
    targetClasses: ['sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: '[Trigonometri] Pada segitiga siku-siku ABC (siku-siku di B), jika panjang sisi depan sudut A adalah 6 cm dan sisi miring 10 cm, maka nilai sin A adalah...',
    options: ['3/5', '4/5', '3/4', '5/3'],
    answer: 0,
    type: 'trigonometri',
    level: 'menengah',
    subject: 'mtk',
    explanation: 'sin A = depan / miring = 6 / 10 = 3/5.',
    targetClasses: ['sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: "[Kalkulus Dasar] Turunan pertama f'(x) dari fungsi f(x) = 3x² - 12x + 9 adalah...",
    options: ["f'(x) = 6x - 12", "f'(x) = 3x - 12", "f'(x) = 6x² - 12", "f'(x) = 6x + 9"],
    answer: 0,
    type: 'kalkulus',
    level: 'mahir',
    subject: 'mtk',
    explanation: "Gunakan aturan turunan f(x) = ax^n -> f'(x) = n·a·x^(n-1), sehingga turunan 3x² - 12x + 9 adalah 6x - 12.",
    targetClasses: ['sma11', 'sma12', 'smk11', 'smk12', 'sma'],
  },
  {
    q: '[Kalkulus Dasar] Nilai dari limit fungsi lim(x→3) (x² - 9) / (x - 3) adalah...',
    options: ['6', '3', '9', '0'],
    answer: 0,
    type: 'limitKalkulus',
    level: 'ahli',
    subject: 'mtk',
    explanation: 'Faktorkan (x² - 9) = (x - 3)(x + 3). Bagi dengan (x - 3) menghasilkan (x + 3). Substitusi x = 3 -> 3 + 3 = 6.',
    targetClasses: ['sma11', 'sma12', 'smk11', 'smk12', 'sma'],
  },

  // ── IPA (SAINS SMP & SMA: FISIKA, BIOLOGI, KIMIA) ──
  {
    q: 'Satuan Internasional (SI) untuk besaran pokok suhu adalah...',
    options: ['Kelvin (K)', 'Celcius (°C)', 'Fahrenheit (°F)', 'Joule (J)'],
    answer: 0,
    type: 'besaran',
    level: 'pemula',
    subject: 'ipa',
    explanation: 'Satuan Internasional (SI) untuk suhu mutlak adalah Kelvin (K).',
    targetClasses: ['kelas7', 'kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: 'Organel sel tumbuhan yang berfungsi sebagai tempat berlangsungnya proses fotosintesis adalah...',
    options: ['Kloroplas', 'Mitokondria', 'Ribosom', 'Lisosom'],
    answer: 0,
    type: 'biologiSel',
    level: 'pemula',
    subject: 'ipa',
    explanation: 'Kloroplas mengandung zat hijau daun (klorofil) untuk menangkap energi cahaya matahari dalam fotosintesis.',
    targetClasses: ['kelas7', 'kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: 'Sebuah benda bermassa 4 kg diberi gaya dorong 20 N pada lantai licin. Percepatan yang dialami benda menurut Hukum II Newton adalah...',
    options: ['5 m/s²', '80 m/s²', '16 m/s²', '0,2 m/s²'],
    answer: 0,
    type: 'hukumNewton',
    level: 'menengah',
    subject: 'ipa',
    explanation: 'Sesuai Hukum II Newton: a = F / m = 20 N / 4 kg = 5 m/s².',
    targetClasses: ['kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: 'Enzim amilase (ptialin) yang terdapat di dalam rongga mulut berfungsi untuk mengubah amilum (zat tepung) menjadi...',
    options: ['Glukosa / Maltosa (gula sederhana)', 'Asam amino', 'Asam lemak', 'Gliserol'],
    answer: 0,
    type: 'sistemPencernaan',
    level: 'menengah',
    subject: 'ipa',
    explanation: 'Enzim ptialin memecah karbohidrat kompleks (amilum) menjadi gula sederhana (maltosa/glukosa).',
    targetClasses: ['kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'sma'],
  },
  {
    q: 'Pada rangkaian listrik tertutup, jika tegangan baterai 12 Volt dan hambatan lampu 4 Ohm, maka kuat arus listrik yang mengalir adalah...',
    options: ['3 Ampere', '48 Ampere', '8 Ampere', '0,33 Ampere'],
    answer: 0,
    type: 'hukumOhm',
    level: 'mahir',
    subject: 'ipa',
    explanation: 'Hukum Ohm: I = V / R = 12 V / 4 Ω = 3 Ampere.',
    targetClasses: ['kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: 'Persilangan monohibrid dominan penuh antara bunga merah (MM) dan bunga putih (mm) menghasilkan keturunan F1 merah (Mm). Jika F1 disilangkan sesamanya, rasio fenotipe F2 (Merah : Putih) adalah...',
    options: ['3 : 1', '1 : 1', '2 : 2', '9 : 3 : 3 : 1'],
    answer: 0,
    type: 'genetika',
    level: 'ahli',
    subject: 'ipa',
    explanation: 'Persilangan Mm x Mm menghasilkan MM, 2 Mm (ketiganya fenotipe merah), dan mm (putih), sehingga rasio 3 : 1.',
    targetClasses: ['kelas9', 'sma10', 'sma11', 'sma12', 'sma'],
  },

  // ── IPS (GEOGRAFI, SEJARAH, EKONOMI, SOSIOLOGI SMP & SMA) ──
  {
    q: 'Secara astronomis, wilayah Indonesia terletak di antara...',
    options: [
      '6° LU – 11° LS dan 95° BT – 141° BT',
      '6° LS – 11° LU dan 95° BB – 141° BB',
      '0° – 23,5° LU dan 100° BT – 150° BT',
      '10° LU – 10° LS dan 90° BT – 120° BT',
    ],
    answer: 0,
    type: 'geografi',
    level: 'pemula',
    subject: 'ips',
    explanation: 'Letak astronomis Indonesia berada pada 6° LU – 11° LS dan 95° BT – 141° BT yang menyebabkan iklim tropis.',
    targetClasses: ['kelas7', 'kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: 'Tempat bertemunya penjual dan pembeli untuk melakukan transaksi barang atau jasa disebut...',
    options: ['Pasar', 'Gudang', 'Pabrik', 'Pelabuhan'],
    answer: 0,
    type: 'ekonomi',
    level: 'pemula',
    subject: 'ips',
    explanation: 'Pasar adalah institusi/tempat bertemunya permintaan (pembeli) dan penawaran (penjual).',
    targetClasses: ['kelas7', 'kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: 'Hukum Permintaan (Law of Demand) menyatakan bahwa apabila harga suatu barang naik (ceteris paribus), maka jumlah barang yang diminta akan...',
    options: ['Turun / Berkurang', 'Naik / Bertambah', 'Tetap tidak berubah', 'Menjadi tak terhingga'],
    answer: 0,
    type: 'ekonomi',
    level: 'menengah',
    subject: 'ips',
    explanation: 'Hubungan harga dan jumlah permintaan berbanding terbalik: saat harga naik, permintaan turun.',
    targetClasses: ['kelas7', 'kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: 'Organisasi pergerakan nasional modern pertama di Indonesia yang berdiri pada 20 Mei 1908 dan diperingati sebagai Hari Kebangkitan Nasional adalah...',
    options: ['Budi Utomo', 'Sarekat Islam', 'Indische Partij', 'Perhimpunan Indonesia'],
    answer: 0,
    type: 'sejarah',
    level: 'menengah',
    subject: 'ips',
    explanation: 'Budi Utomo didirikan oleh dr. Soetomo dan mahasiswa STOVIA pada 20 Mei 1908.',
    targetClasses: ['kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: 'Kerja sama ekonomi antarnegara di kawasan Asia Tenggara (ASEAN) yang bertujuan membentuk kawasan perdagangan bebas disebut...',
    options: ['AFTA (ASEAN Free Trade Area)', 'OPEC', 'APEC', 'NATO'],
    answer: 0,
    type: 'asean',
    level: 'mahir',
    subject: 'ips',
    explanation: 'AFTA adalah kesepakatan perdagangan bebas negara-negara anggota ASEAN.',
    targetClasses: ['kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: 'Kebijakan bank sentral (Bank Indonesia) untuk mengatur jumlah uang yang beredar di masyarakat guna menjaga kestabilan nilai rupiah disebut kebijakan...',
    options: ['Kebijakan Moneter', 'Kebijakan Fiskal', 'Kebijakan Subsidi Silang', 'Kebijakan Agraria'],
    answer: 0,
    type: 'ekonomiMakro',
    level: 'ahli',
    subject: 'ips',
    explanation: 'Kebijakan moneter dijalankan oleh Bank Sentral, sedangkan kebijakan fiskal (pajak/APBN) oleh Pemerintah.',
    targetClasses: ['kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },

  // ── BAHASA INDONESIA (LITERASI, TEKS, EYD SMP & SMA) ──
  {
    q: 'Teks yang menggambarkan suatu objek, tempat, atau peristiwa secara rinci sehingga pembaca seolah-olah melihat dan merasakan sendiri disebut teks...',
    options: ['Teks Deskripsi', 'Teks Prosedur', 'Teks Eksposisi', 'Teks Negosiasi'],
    answer: 0,
    type: 'jenisTeks',
    level: 'pemula',
    subject: 'indo',
    explanation: 'Teks deskripsi bertujuan melukiskan objek secara konkret melalui pancaindra.',
    targetClasses: ['kelas7', 'kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: 'Penulisan kata depan "di" yang tepat menurut kaidah EYD / PUEBI terdapat pada kalimat...',
    options: [
      'Adik sedang membaca buku di perpustakaan sekolah.',
      'Buku itu sudah di baca oleh kakak kemarin.',
      'Surat itu di tulis dengan sangat rapi.',
      'Ibu membeli sayur diantar oleh ayah.',
    ],
    answer: 0,
    type: 'ejaan',
    level: 'pemula',
    subject: 'indo',
    explanation: 'Kata depan "di" yang menunjukkan keterangan tempat harus ditulis terpisah dari kata yang mengikutinya ("di perpustakaan").',
    targetClasses: ['sd4', 'sd5', 'sd6', 'sd', 'kelas7', 'kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: 'Bagian awal dalam struktur teks cerita fantasi atau narasi yang berisi pengenalan tokoh dan latar disebut...',
    options: ['Orientasi', 'Komplikasi', 'Resolusi', 'Koda'],
    answer: 0,
    type: 'strukturTeks',
    level: 'menengah',
    subject: 'indo',
    explanation: 'Orientasi adalah tahap pengenalan tokoh, waktu, dan tempat sebelum munculnya masalah (komplikasi).',
    targetClasses: ['kelas7', 'kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: 'Kalimat berikut yang mengandung majas personifikasi (benda mati seolah-olah hidup seperti manusia) adalah...',
    options: [
      'Angin malam berbisik lembut membelai dedaunan di tepi pantai.',
      'Suaranya sangat menggelegar membelah angkasa.',
      'Ia adalah bintang kelas yang selalu rendah hati.',
      'Ayah membawa buah tangan dari Surabaya.',
    ],
    answer: 0,
    type: 'majas',
    level: 'menengah',
    subject: 'indo',
    explanation: '"Angin berbisik dan membelai" memberikan sifat manusia kepada benda alam (personifikasi).',
    targetClasses: ['kelas7', 'kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: 'Perhatikan kalimat berikut: "Para hadirin sekalian dimohon berdiri." Agar menjadi kalimat efektif dan tidak boros kata, perbaikan yang tepat adalah...',
    options: ['Hadirin dimohon berdiri.', 'Para hadirin-hadirin dimohon berdiri.', 'Semua para hadirin sekalian berdiri.', 'Hadirin sekalian semuanya dimohon berdiri.'],
    answer: 0,
    type: 'kalimatEfektif',
    level: 'mahir',
    subject: 'indo',
    explanation: 'Kata "hadirin" sudah bermakna jamak, sehingga tidak perlu ditambah "para" atau "sekalian".',
    targetClasses: ['sd6', 'kelas7', 'kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },
  {
    q: 'Dalam teks ulasan (resensi) buku atau karya ilmiah, bagian yang memaparkan keunggulan dan kelemahan karya secara objektif disebut...',
    options: ['Evaluasi / Tafsiran Isi', 'Identitas Karya', 'Orientasi Pengarang', 'Daftar Pustaka'],
    answer: 0,
    type: 'teksUlasan',
    level: 'ahli',
    subject: 'indo',
    explanation: 'Tahap evaluasi mengulas kelebihan dan kekurangan karya secara berimbang.',
    targetClasses: ['kelas8', 'kelas9', 'sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'],
  },

  // ── KELAS UMUM (PENGETAHUAN UMUM HAGO, LOGIKA KERJA, LITERASI DIGITAL, FINANSIAL) ──
  {
    q: 'Jika sebuah proyek kerja dapat diselesaikan oleh 6 orang dalam waktu 12 hari, maka berapa hari waktu yang dibutuhkan jika proyek tersebut dikerjakan oleh 9 orang dengan kecepatan sama?',
    options: ['8 hari', '18 hari', '6 hari', '10 hari'],
    answer: 0,
    type: 'logikaNumerik',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Perbandingan berbalik nilai: (6 x 12) / 9 = 72 / 9 = 8 hari.',
    targetClasses: ['umum'],
  },
  {
    q: 'Dalam literasi keuangan keluarga dan UMKM, dana simpanan darurat (emergency fund) yang ideal disimpan pada instrumen yang bersifat...',
    options: [
      'Likuid (mudah dicairkan kapan saja) dan berisiko rendah',
      'Sulit dicairkan selama 20 tahun',
      'Spekulatif dengan risiko kehilangan modal tinggi',
      'Pinjaman berbunga tinggi',
    ],
    answer: 0,
    type: 'literasiFinansial',
    level: 'menengah',
    subject: 'umum',
    explanation: 'Dana darurat wajib disimpan di tempat yang aman dan cepat dicairkan saat kondisi mendesak.',
    targetClasses: ['umum'],
  },
  {
    q: 'Saat menerima pesan mencurigakan yang meminta kode rahasia OTP perbankan melalui telepon atau tautan asing, tindakan keamanan siber (cybersecurity) yang paling tepat adalah...',
    options: [
      'Menolak memberikan kode OTP karena kode OTP bersifat rahasia pribadi',
      'Segera menyebutkan kode OTP agar mendapat hadiah undian',
      'Mengklik seluruh tautan asing dan memasukkan PIN ATM',
      'Mengirimkan foto kartu identitas dan kata sandi email',
    ],
    answer: 0,
    type: 'keamananDigital',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Kode OTP (One-Time Password) tidak boleh dibagikan kepada siapa pun termasuk pihak yang mengaku petugas.',
    targetClasses: ['umum'],
  },
  {
    q: 'Perhatikan pola deret angka logika berikut: 3, 6, 12, 24, 48, ... Angka selanjutnya yang tepat adalah...',
    options: ['96', '72', '60', '84'],
    answer: 0,
    type: 'deretLogika',
    level: 'menengah',
    subject: 'umum',
    explanation: 'Setiap suku dikalikan 2 (rasio geometri r = 2): 48 x 2 = 96.',
    targetClasses: ['umum'],
  },
  {
    q: 'Dalam komunikasi profesional di dunia kerja, metode "STAR" sering digunakan saat wawancara kerja untuk menjelaskan pengalaman. Kepanjangan dari STAR adalah...',
    options: [
      'Situation, Task, Action, Result',
      'Start, Talk, Ask, Repeat',
      'System, Time, Analysis, Report',
      'Skill, Talent, Attitude, Respect',
    ],
    answer: 0,
    type: 'karierUmum',
    level: 'mahir',
    subject: 'umum',
    explanation: 'Metode STAR menjelaskan Situasi, Tugas/Tantangan, Aksi yang diambil, dan Hasil nyata yang dicapai.',
    targetClasses: ['umum'],
  },
  {
    q: 'Semua ilmuwan gemar membaca buku. Sebagian peserta seminar hari ini adalah ilmuwan. Kesimpulan logis (silogisme) yang pasti benar adalah...',
    options: [
      'Sebagian peserta seminar hari ini gemar membaca buku',
      'Semua peserta seminar pasti ilmuwan',
      'Tidak ada peserta seminar yang gemar membaca buku',
      'Semua orang yang gemar membaca buku hadir di seminar',
    ],
    answer: 0,
    type: 'silogisme',
    level: 'ahli',
    subject: 'umum',
    explanation: 'Karena sebagian peserta seminar adalah ilmuwan dan semua ilmuwan gemar membaca, maka sebagian peserta seminar gemar membaca.',
    targetClasses: ['umum'],
  },
  {
    q: '[Trivia HAGO] Planet manakah di Tata Surya yang dikenal sebagai "Planet Merah" karena permukaannya kaya akan besi oksida?',
    options: ['Mars', 'Venus', 'Jupiter', 'Merkurius'],
    answer: 0,
    type: 'triviaSainsHago',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Planet Mars tampak berwarna kemerahan karena debu besi oksida (karat) yang menyelimuti permukaannya.',
    targetClasses: ['umum'],
  },
  {
    q: '[Trivia HAGO] Negara manakah yang memiliki garis pantai terpanjang di Asia Tenggara dan merupakan negara kepulauan terbesar di dunia?',
    options: ['Indonesia', 'Filipina', 'Malaysia', 'Thailand'],
    answer: 0,
    type: 'triviaGeografiHago',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Indonesia adalah negara kepulauan terbesar di dunia dengan lebih dari 17.000 pulau.',
    targetClasses: ['umum'],
  },
  {
    q: '[Trivia HAGO] Hewan mamalia laut apakah yang memegang rekor sebagai hewan terbesar yang pernah hidup di Bumi?',
    options: ['Paus Biru (Blue Whale)', 'Hiu Paus', 'Gajah Afrika', 'Cumi-cumi Raksasa'],
    answer: 0,
    type: 'triviaAlamHago',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Paus Biru merupakan mamalia laut dan hewan terbesar di Bumi dengan panjang mencapai 30 meter.',
    targetClasses: ['umum'],
  },
  {
    q: '[Trivia HAGO] Unsur kimia dengan lambang "Au" pada tabel periodik merujuk pada logam mulia...',
    options: ['Emas (Aurum)', 'Perak (Argentum)', 'Tembaga (Cuprum)', 'Aluminium'],
    answer: 0,
    type: 'triviaKimiaHago',
    level: 'menengah',
    subject: 'umum',
    explanation: 'Lambang Au berasal dari bahasa Latin "Aurum" yang berarti emas.',
    targetClasses: ['umum'],
  },
  {
    q: '[Trivia HAGO] Siapakah ilmuwan penemu bola lampu pijar praktis yang mengubah sejarah peradaban modern?',
    options: ['Thomas Alva Edison', 'Alexander Graham Bell', 'Wright Bersaudara', 'Galileo Galilei'],
    answer: 0,
    type: 'triviaSejarahHago',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Thomas Alva Edison mengembangkan lampu pijar komersial yang tahan lama pada tahun 1879.',
    targetClasses: ['umum'],
  },
  {
    q: '[Teka-Teki Logika HAGO] Ayah Rina memiliki 5 anak perempuan: Nana, Nini, Nunu, Nene. Siapakah nama anak perempuan kelima?',
    options: ['Rina', 'Nono', 'Nina', 'Nani'],
    answer: 0,
    type: 'tekaTekiHago',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Pada kalimat pertama sudah disebutkan "Ayah Rina", sehingga anak kelima adalah Rina!',
    targetClasses: ['umum'],
  },
  {
    q: '[Trivia HAGO] Benua manakah yang memiliki jumlah penduduk paling banyak di dunia saat ini?',
    options: ['Benua Asia', 'Benua Afrika', 'Benua Eropa', 'Benua Amerika'],
    answer: 0,
    type: 'triviaDuniaHago',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Benua Asia dihuni oleh sekitar 60% dari total populasi manusia di dunia.',
    targetClasses: ['umum'],
  },
  {
    q: '[Trivia HAGO] Alat musik tradisional Angklung yang telah diakui UNESCO sebagai Warisan Budaya Dunia berasal dari daerah...',
    options: ['Jawa Barat', 'Sumatera Barat', 'Sulawesi Utara', 'Bali'],
    answer: 0,
    type: 'triviaBudayaHago',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Angklung adalah alat musik bambu tradisional masyarakat Sunda di Jawa Barat.',
    targetClasses: ['umum'],
  },
];

/**
 * Generates strictly grade-appropriate Math questions following curriculumLevel.json:
 * - SD Kelas 1 (sd1): ONLY penjumlahan 1-20, pengurangan sederhana 1-20, mengenal angka 1-20. NO aljabar, NO pecahan, NO perkalian susah!
 * - SD Kelas 2 (sd2): penjumlahan 1-100, pengurangan 1-100, perkalian dasar 1-5. NO aljabar!
 * - SD Kelas 3 (sd3): perkalian, pembagian dasar, pecahan sederhana (1/2, 1/3, 1/4). NO aljabar!
 * - SD Kelas 4-6 (sd4, sd5, sd6, sd): pecahan campuran, desimal, FPB & KPK. NO aljabar!
 * - SMP Kelas 7-9 (kelas7, kelas8, kelas9): aljabar, persamaan linear, pythagoras.
 * - SMA/SMK Kelas 10-12 (sma10..smk12, sma): logaritma, trigonometri, kalkulus dasar.
 */
function generateMathTemplates(): AdaptiveQuestion[] {
  const results: AdaptiveQuestion[] = [];
  const levels: ('pemula' | 'menengah' | 'mahir' | 'ahli')[] = ['pemula', 'menengah', 'mahir', 'ahli'];

  // 1. SD KELAS 1 (sd1): HANYA penjumlahan 1-20, pengurangan sederhana 1-20, mengenal angka 1-20
  for (let i = 1; i <= 25; i++) {
    const a = (i % 10) + 1; // 1..10
    const b = ((i * 3) % 9) + 1; // 1..9, so a + b <= 19 (strictly 1-20!)
    const sum = a + b;
    const big = Math.max(a + 4, b + 2); // <= 14
    const small = Math.min(a, b);
    const diff = big - small;
    const numWordMap: Record<number, string> = {
      5: 'lima',
      7: 'tujuh',
      8: 'delapan',
      9: 'sembilan',
      11: 'sebelas',
      12: 'dua belas',
      14: 'empat belas',
      15: 'lima belas',
      17: 'tujuh belas',
      19: 'sembilan belas',
      20: 'dua puluh',
    };
    const wordKeys = Object.keys(numWordMap).map(Number);
    const targetNum = wordKeys[i % wordKeys.length];

    levels.forEach((lvl) => {
      // Penjumlahan 1-20
      results.push({
        id: `sd1-mtk-add-${lvl}-${i}`,
        q: `Berapakah hasil penjumlahan dari ${a} + ${b}?`,
        options: [
          String(sum),
          String(sum + 1),
          String(Math.max(1, sum - 1)),
          String(sum + 2),
        ],
        answer: 0,
        type: 'penjumlahanSD1',
        level: lvl,
        subject: 'mtk',
        classKey: 'sd1',
        explanation: `Jika kita menghitung maju dari angka ${a} sebanyak ${b} langkah, hasilnya adalah ${sum}.`,
      });

      // Pengurangan sederhana 1-20
      results.push({
        id: `sd1-mtk-sub-${lvl}-${i}`,
        q: `Ibu mempunyai ${big} buah apel, lalu diberikan kepada adik ${small} buah apel. Berapa sisa apel Ibu sekarang? (${big} - ${small} = ...)`,
        options: [
          String(diff),
          String(diff + 1),
          String(diff + 2),
          String(Math.max(0, diff - 1)),
        ],
        answer: 0,
        type: 'penguranganSD1',
        level: lvl,
        subject: 'mtk',
        classKey: 'sd1',
        explanation: `${big} dikurangi ${small} sama dengan ${diff}.`,
      });

      // Mengenal angka 1-20
      results.push({
        id: `sd1-mtk-num-${lvl}-${i}`,
        q: `Lambang bilangan dari "${numWordMap[targetNum]}" adalah angka...`,
        options: [
          String(targetNum),
          String(targetNum + 1),
          String(Math.max(1, targetNum - 2)),
          String(targetNum + 3),
        ],
        answer: 0,
        type: 'mengenalAngkaSD1',
        level: lvl,
        subject: 'mtk',
        classKey: 'sd1',
        explanation: `Kata "${numWordMap[targetNum]}" ditulis dengan lambang angka ${targetNum}.`,
      });
    });
  }

  // 2. SD KELAS 2 (sd2): Penjumlahan 1-100, Pengurangan 1-100, Perkalian 1-5
  for (let i = 1; i <= 25; i++) {
    const p1 = (i % 40) + 12; // 12..51
    const p2 = ((i * 7) % 35) + 10; // 10..44 -> p1 + p2 <= 95 (1-100)
    const m1 = (i % 5) + 1; // 1..5
    const m2 = ((i * 2) % 5) + 1; // 1..5

    levels.forEach((lvl) => {
      results.push({
        id: `sd2-mtk-add100-${lvl}-${i}`,
        q: `Hasil penjumlahan dari ${p1} + ${p2} adalah...`,
        options: [
          String(p1 + p2),
          String(p1 + p2 + 10),
          String(p1 + p2 - 1),
          String(p1 + p2 + 2),
        ],
        answer: 0,
        type: 'penjumlahanSD2',
        level: lvl,
        subject: 'mtk',
        classKey: 'sd2',
        explanation: `Jumlahkan puluhan dan satuannya: ${p1} + ${p2} = ${p1 + p2}.`,
      });

      results.push({
        id: `sd2-mtk-mul5-${lvl}-${i}`,
        q: `Berapakah hasil perkalian dasar ${m1} × ${m2}?`,
        options: [
          String(m1 * m2),
          String(m1 * m2 + 2),
          String(m1 + m2),
          String(m1 * m2 + 5),
        ],
        answer: 0,
        type: 'perkalianSD2',
        level: lvl,
        subject: 'mtk',
        classKey: 'sd2',
        explanation: `${m1} × ${m2} artinya penjumlahan berulang angka ${m2} sebanyak ${m1} kali = ${m1 * m2}.`,
      });
    });
  }

  // 3. SD KELAS 3 (sd3): Perkalian, Pembagian dasar, Pecahan sederhana (1/2, 1/3, 1/4)
  for (let i = 1; i <= 25; i++) {
    const f1 = (i % 8) + 2; // 2..9
    const f2 = ((i * 3) % 8) + 2; // 2..9
    const prod = f1 * f2;
    const denom = (i % 5) + 3; // 3..7

    levels.forEach((lvl) => {
      results.push({
        id: `sd3-mtk-div-${lvl}-${i}`,
        q: `Hasil pembagian dari ${prod} : ${f1} adalah...`,
        options: [
          String(f2),
          String(f2 + 1),
          String(f2 + 2),
          String(Math.max(1, f2 - 1)),
        ],
        answer: 0,
        type: 'pembagianSD3',
        level: lvl,
        subject: 'mtk',
        classKey: 'sd3',
        explanation: `Karena ${f1} × ${f2} = ${prod}, maka ${prod} : ${f1} = ${f2}.`,
      });

      results.push({
        id: `sd3-mtk-frac-${lvl}-${i}`,
        q: `Hasil penjumlahan pecahan sederhana berpenyebut sama: 1/${denom} + 1/${denom} adalah...`,
        options: [
          `2/${denom}`,
          `1/${denom * 2}`,
          `2/${denom * 2}`,
          `3/${denom}`,
        ],
        answer: 0,
        type: 'pecahanSederhanaSD3',
        level: lvl,
        subject: 'mtk',
        classKey: 'sd3',
        explanation: `Jika penyebut pecahan sudah sama (${denom}), jumlahkan pembilangnya: (1 + 1)/${denom} = 2/${denom}.`,
      });
    });
  }

  // 4. SD KELAS 4-6 (sd4, sd5, sd6, sd): Pecahan campuran, Desimal, FPB & KPK
  const sdUpperClasses = ['sd4', 'sd5', 'sd6', 'sd'];
  const fpbKpkPairs = [
    { a: 6, b: 8, fpb: 2, kpk: 24 },
    { a: 12, b: 18, fpb: 6, kpk: 36 },
    { a: 8, b: 12, fpb: 4, kpk: 24 },
    { a: 10, b: 15, fpb: 5, kpk: 30 },
    { a: 9, b: 12, fpb: 3, kpk: 36 },
    { a: 14, b: 21, fpb: 7, kpk: 42 },
  ];

  sdUpperClasses.forEach((cls) => {
    for (let i = 1; i <= 20; i++) {
      const pair = fpbKpkPairs[i % fpbKpkPairs.length];
      const whole = (i % 4) + 1;
      levels.forEach((lvl) => {
        results.push({
          id: `${cls}-mtk-kpk-${lvl}-${i}`,
          q: `Kelipatan Persekutuan Terkecil (KPK) dan Faktor Persekutuan Terbesar (FPB) dari bilangan ${pair.a} dan ${pair.b} berturut-turut adalah...`,
          options: [
            `KPK = ${pair.kpk} dan FPB = ${pair.fpb}`,
            `KPK = ${pair.fpb} dan FPB = ${pair.kpk}`,
            `KPK = ${pair.a * pair.b} dan FPB = 1`,
            `KPK = ${pair.kpk + 6} dan FPB = ${pair.fpb + 2}`,
          ],
          answer: 0,
          type: 'fpbKpkSD',
          level: lvl,
          subject: 'mtk',
          classKey: cls,
          explanation: `Kelipatan terkecil yang sama dari ${pair.a} dan ${pair.b} adalah ${pair.kpk} (KPK), sedangkan faktor pembagi terbesarnya adalah ${pair.fpb} (FPB).`,
        });

        results.push({
          id: `${cls}-mtk-mixed-${lvl}-${i}`,
          q: `Pecahan campuran ${whole} 1/2 jika diubah menjadi bentuk pecahan desimal adalah...`,
          options: [
            `${whole},5`,
            `${whole},2`,
            `${whole},25`,
            `${whole},75`,
          ],
          answer: 0,
          type: 'pecahanCampuranDesimalSD',
          level: lvl,
          subject: 'mtk',
          classKey: cls,
          explanation: `Pecahan 1/2 senilai dengan 0,5. Maka ${whole} 1/2 = ${whole} + 0,5 = ${whole},5.`,
        });
      });
    }
  });

  // 5. SMP KELAS 7, 8, 9 (kelas7, kelas8, kelas9): Aljabar, Persamaan Linear, Pythagoras, Aritmetika Sosial
  const smpClasses = ['kelas7', 'kelas8', 'kelas9'];
  for (let i = 1; i <= 30; i++) {
    const xVal = (i % 12) + 2;
    const constVal = xVal * 3 + 5;
    const k1 = (i % 7) + 3;
    const k2 = (i % 5) + 2;

    smpClasses.forEach((cls) => {
      levels.forEach((lvl) => {
        results.push({
          id: `${cls}-mtk-plsv-${lvl}-${i}`,
          q: `[Aljabar & Persamaan Linear] Jika diketahui persamaan 3x + 5 = ${constVal}, maka nilai x adalah...`,
          options: [
            String(xVal),
            String(xVal + 2),
            String(xVal - 1),
            String(xVal + 4),
          ],
          answer: 0,
          type: 'aljabarLinearSMP',
          level: lvl,
          subject: 'mtk',
          classKey: cls,
          explanation: `3x = ${constVal} - 5 = ${constVal - 5}, maka x = ${constVal - 5} / 3 = ${xVal}.`,
        });

        results.push({
          id: `${cls}-mtk-suku-${lvl}-${i}`,
          q: `[Operasi Bentuk Aljabar] Bentuk sederhana dari (${k1}x + ${k2}y) + (2x + 3y) adalah...`,
          options: [
            `${k1 + 2}x + ${k2 + 3}y`,
            `${k1 + k2}x + 5y`,
            `${k1 * 2}x + ${k2 * 3}y`,
            `${k1 - 2}x + ${k2 - 3}y`,
          ],
          answer: 0,
          type: 'aljabarSukuSMP',
          level: lvl,
          subject: 'mtk',
          classKey: cls,
          explanation: `Jumlahkan suku-suku sejenis: (${k1} + 2)x + (${k2} + 3)y = ${k1 + 2}x + ${k2 + 3}y.`,
        });
      });
    });
  }

  // 6. SMA / SMK KELAS 10, 11, 12: Logaritma, Trigonometri, Kalkulus Dasar, Deret Geometri
  const smaSmkClasses = ['sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'];
  for (let i = 1; i <= 25; i++) {
    const coef = (i % 6) + 2; // 2..7
    const lin = (i % 8) + 3; // 3..10
    const expPower = (i % 5) + 2; // 2..6
    const val2 = Math.pow(2, expPower);

    smaSmkClasses.forEach((cls) => {
      levels.forEach((lvl) => {
        results.push({
          id: `${cls}-mtk-calc-${lvl}-${i}`,
          q: `[Kalkulus Dasar] Diketahui fungsi f(x) = ${coef}x² + ${lin}x - 5. Turunan pertama f'(x) adalah...`,
          options: [
            `${coef * 2}x + ${lin}`,
            `${coef}x + ${lin}`,
            `${coef * 2}x² + ${lin}`,
            `${coef * 2}x - 5`,
          ],
          answer: 0,
          type: 'kalkulusSMA',
          level: lvl,
          subject: 'mtk',
          classKey: cls,
          explanation: `Turunan dari ${coef}x² adalah ${coef * 2}x, turunan dari ${lin}x adalah ${lin}, dan turunan konstanta -5 adalah 0.`,
        });

        results.push({
          id: `${cls}-mtk-log-${lvl}-${i}`,
          q: `[Logaritma] Nilai dari ²log ${val2} adalah...`,
          options: [
            String(expPower),
            String(expPower + 1),
            String(expPower - 1),
            String(expPower * 2),
          ],
          answer: 0,
          type: 'logaritmaSMA',
          level: lvl,
          subject: 'mtk',
          classKey: cls,
          explanation: `Karena 2^${expPower} = ${val2}, maka ²log ${val2} = ${expPower}.`,
        });
      });
    });
  }

  return results;
}

/**
 * Merges all subjects into a unified, strictly grade-separated Question Bank
 */
export function buildFullQuestionBank(): AdaptiveQuestion[] {
  const levels: ('pemula' | 'menengah' | 'mahir' | 'ahli')[] = ['pemula', 'menengah', 'mahir', 'ahli'];
  const multiSubjectExpanded: AdaptiveQuestion[] = [];

  const allCuratedItems = [
    ...SD_LOWER_NON_MATH,
    ...SD_UPPER_NON_MATH,
    ...CURATED_MULTI_SUBJECT,
  ];

  allCuratedItems.forEach((item, idx) => {
    const classesForItem = item.targetClasses || ['kelas7', 'kelas8', 'kelas9', 'sma', 'umum'];
    classesForItem.forEach((cls) => {
      levels.forEach((lvl) => {
        multiSubjectExpanded.push({
          id: `${cls}-${item.subject}-cur-${idx}-${lvl}`,
          q: item.q,
          options: [...item.options],
          answer: item.answer,
          type: item.type,
          level: lvl,
          subject: item.subject,
          classKey: cls,
          explanation: item.explanation,
        });
      });
    });
  });

  return [
    ...KURIKULUM_LENGKAP_QUESTIONS,
    ...QUESTION_BANK_INGGRIS,
    ...QUESTION_BANK_PKN,
    ...generateMathTemplates(),
    ...multiSubjectExpanded,
  ];
}

export const FULL_QUESTION_BANK: AdaptiveQuestion[] = buildFullQuestionBank();
