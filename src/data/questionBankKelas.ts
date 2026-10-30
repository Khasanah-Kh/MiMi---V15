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

  // ── KELAS UMUM (WAWASAN & LOGIKA MIMI, LOGIKA KERJA, LITERASI DIGITAL, FINANSIAL) ──
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
    q: '[Wawasan & Logika Mimi] Planet manakah di Tata Surya yang dikenal sebagai "Planet Merah" karena permukaannya kaya akan besi oksida?',
    options: ['Mars', 'Venus', 'Jupiter', 'Merkurius'],
    answer: 0,
    type: 'triviaSainsMimi',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Planet Mars tampak berwarna kemerahan karena debu besi oksida (karat) yang menyelimuti permukaannya.',
    targetClasses: ['umum'],
  },
  {
    q: '[Wawasan & Logika Mimi] Negara manakah yang memiliki garis pantai terpanjang di Asia Tenggara dan merupakan negara kepulauan terbesar di dunia?',
    options: ['Indonesia', 'Filipina', 'Malaysia', 'Thailand'],
    answer: 0,
    type: 'triviaGeografiMimi',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Indonesia adalah negara kepulauan terbesar di dunia dengan lebih dari 17.000 pulau.',
    targetClasses: ['umum'],
  },
  {
    q: '[Wawasan & Logika Mimi] Hewan mamalia laut apakah yang memegang rekor sebagai hewan terbesar yang pernah hidup di Bumi?',
    options: ['Paus Biru (Blue Whale)', 'Hiu Paus', 'Gajah Afrika', 'Cumi-cumi Raksasa'],
    answer: 0,
    type: 'triviaAlamMimi',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Paus Biru merupakan mamalia laut dan hewan terbesar di Bumi dengan panjang mencapai 30 meter.',
    targetClasses: ['umum'],
  },
  {
    q: '[Wawasan & Logika Mimi] Unsur kimia dengan lambang "Au" pada tabel periodik merujuk pada logam mulia...',
    options: ['Emas (Aurum)', 'Perak (Argentum)', 'Tembaga (Cuprum)', 'Aluminium'],
    answer: 0,
    type: 'triviaKimiaMimi',
    level: 'menengah',
    subject: 'umum',
    explanation: 'Lambang Au berasal dari bahasa Latin "Aurum" yang berarti emas.',
    targetClasses: ['umum'],
  },
  {
    q: '[Wawasan & Logika Mimi] Siapakah ilmuwan penemu bola lampu pijar praktis yang mengubah sejarah peradaban modern?',
    options: ['Thomas Alva Edison', 'Alexander Graham Bell', 'Wright Bersaudara', 'Galileo Galilei'],
    answer: 0,
    type: 'triviaSejarahMimi',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Thomas Alva Edison mengembangkan lampu pijar komersial yang tahan lama pada tahun 1879.',
    targetClasses: ['umum'],
  },
  {
    q: '[Teka-Teki Logika Mimi] Ayah Rina memiliki 5 anak perempuan: Nana, Nini, Nunu, Nene. Siapakah nama anak perempuan kelima?',
    options: ['Rina', 'Nono', 'Nina', 'Nani'],
    answer: 0,
    type: 'tekaTekiMimi',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Pada kalimat pertama sudah disebutkan "Ayah Rina", sehingga anak kelima adalah Rina!',
    targetClasses: ['umum'],
  },
  {
    q: '[Wawasan & Logika Mimi] Benua manakah yang memiliki jumlah penduduk paling banyak di dunia saat ini?',
    options: ['Benua Asia', 'Benua Afrika', 'Benua Eropa', 'Benua Amerika'],
    answer: 0,
    type: 'triviaDuniaMimi',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Benua Asia dihuni oleh sekitar 60% dari total populasi manusia di dunia.',
    targetClasses: ['umum'],
  },
  {
    q: '[Wawasan & Logika Mimi] Alat musik tradisional Angklung yang telah diakui UNESCO sebagai Warisan Budaya Dunia berasal dari daerah...',
    options: ['Jawa Barat', 'Sumatera Barat', 'Sulawesi Utara', 'Bali'],
    answer: 0,
    type: 'triviaBudayaMimi',
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

  // 1. SD KELAS 1 (sd1):
  // - Pemula: Penjumlahan dasar 1-20 (4+4, 9+5, dll.) & mengenal lambang bilangan
  // - Menengah: Pengurangan 1-20 & soal cerita apel sederhana
  // - Mahir: Pola bilangan loncat & perbandingan lebih banyak/sedikit (1-20)
  // - Ahli: Soal cerita penalaran 2 langkah sederhana (1-20)
  for (let i = 1; i <= 15; i++) {
    const a = (i % 9) + 2; // 2..10
    const b = ((i * 2) % 8) + 2; // 2..9 -> a+b <= 19
    const sum = a + b;
    const big = Math.min(20, a + b);
    const small = a;
    const diff = big - small;

    // Pemula SD1: 4+4, 9+5, penjumlahan dasar 1-20
    results.push({
      id: `sd1-mtk-pemula-add-${i}`,
      q: `Berapakah hasil penjumlahan dari ${a} + ${b}?`,
      options: [String(sum), String(sum + 1), String(Math.max(1, sum - 1)), String(sum + 2)],
      answer: 0,
      type: 'penjumlahanSD1',
      level: 'pemula',
      subject: 'mtk',
      classKey: 'sd1',
      explanation: `Jika kita menghitung maju dari angka ${a} sebanyak ${b} langkah, hasilnya adalah ${sum}.`,
    });

    // Menengah SD1: Pengurangan cerita 1-20
    results.push({
      id: `sd1-mtk-menengah-sub-${i}`,
      q: `Ibu mempunyai ${big} buah apel, lalu diberikan kepada adik ${small} buah apel. Berapa sisa apel Ibu sekarang? (${big} - ${small} = ...)`,
      options: [String(diff), String(diff + 1), String(diff + 2), String(Math.max(0, diff - 1))],
      answer: 0,
      type: 'penguranganSD1',
      level: 'menengah',
      subject: 'mtk',
      classKey: 'sd1',
      explanation: `${big} dikurangi ${small} sama dengan ${diff}.`,
    });

    // Mahir SD1: Pola barisan bilangan loncat 2
    const startNum = (i % 5) * 2 + 2;
    results.push({
      id: `sd1-mtk-mahir-pola-${i}`,
      q: `Perhatikan urutan angka loncat dua berikut: ${startNum}, ${startNum + 2}, ${startNum + 4}, ... Angka selanjutnya adalah...`,
      options: [String(startNum + 6), String(startNum + 5), String(startNum + 7), String(startNum + 8)],
      answer: 0,
      type: 'polaBilanganSD1',
      level: 'mahir',
      subject: 'mtk',
      classKey: 'sd1',
      explanation: `Setiap langkah bertambah 2, jadi ${startNum + 4} + 2 = ${startNum + 6}.`,
    });

    // Ahli SD1: Penalaran 2 langkah (1-20)
    const kelerengAwal = (i % 6) + 5;
    const tambah = 4;
    const kasihTeman = 2;
    const hasilAkhir = kelerengAwal + tambah - kasihTeman;
    results.push({
      id: `sd1-mtk-ahli-hots-${i}`,
      q: `Budi punya ${kelerengAwal} kelereng. Ayah memberi lagi ${tambah} kelereng, lalu Budi memberikan ${kasihTeman} kelereng kepada temannya. Berapa kelereng Budi sekarang?`,
      options: [String(hasilAkhir), String(hasilAkhir + 2), String(hasilAkhir - 1), String(hasilAkhir + 3)],
      answer: 0,
      type: 'penalaranSD1',
      level: 'ahli',
      subject: 'mtk',
      classKey: 'sd1',
      explanation: `${kelerengAwal} + ${tambah} = ${kelerengAwal + tambah}, lalu dikurangi ${kasihTeman} menjadi ${hasilAkhir}.`,
    });
  }

  // 2. SD KELAS 2 (sd2): Penjumlahan 1-100, Pengurangan 1-100, Perkalian dasar 1-5
  for (let i = 1; i <= 12; i++) {
    const p1 = (i % 35) + 15;
    const p2 = ((i * 5) % 30) + 12;
    const m1 = (i % 4) + 2; // 2..5
    const m2 = ((i * 2) % 5) + 2; // 2..6

    results.push({
      id: `sd2-mtk-pemula-${i}`,
      q: `Hasil penjumlahan bilangan dua angka ${p1} + ${p2} adalah...`,
      options: [String(p1 + p2), String(p1 + p2 + 10), String(p1 + p2 - 1), String(p1 + p2 + 2)],
      answer: 0,
      type: 'penjumlahanSD2',
      level: 'pemula',
      subject: 'mtk',
      classKey: 'sd2',
      explanation: `Jumlahkan puluhan dan satuannya: ${p1} + ${p2} = ${p1 + p2}.`,
    });

    results.push({
      id: `sd2-mtk-menengah-${i}`,
      q: `Berapakah hasil perkalian dasar ${m1} × ${m2}?`,
      options: [String(m1 * m2), String(m1 * m2 + 2), String(m1 + m2), String(m1 * m2 + 5)],
      answer: 0,
      type: 'perkalianSD2',
      level: 'menengah',
      subject: 'mtk',
      classKey: 'sd2',
      explanation: `${m1} × ${m2} artinya penjumlahan berulang angka ${m2} sebanyak ${m1} kali = ${m1 * m2}.`,
    });

    results.push({
      id: `sd2-mtk-mahir-${i}`,
      q: `Di perpustakaan ada ${m1} rak buku kecil. Setiap rak berisi ${m2} buku cerita. Berapa jumlah seluruh buku cerita tersebut?`,
      options: [`${m1 * m2} buku`, `${m1 + m2} buku`, `${m1 * m2 + 3} buku`, `${m1 * m2 - 2} buku`],
      answer: 0,
      type: 'soalCeritaSD2',
      level: 'mahir',
      subject: 'mtk',
      classKey: 'sd2',
      explanation: `Jumlah buku = ${m1} rak × ${m2} buku = ${m1 * m2} buku.`,
    });

    results.push({
      id: `sd2-mtk-ahli-${i}`,
      q: `Rina memiliki pita sepanjang ${p1 + p2} cm. Pita tersebut dipotong ${p2} cm untuk menghias kado, lalu ditambah lagi 10 cm. Berapa cm panjang pita Rina sekarang?`,
      options: [`${p1 + 10} cm`, `${p1} cm`, `${p1 + 20} cm`, `${p2 + 10} cm`],
      answer: 0,
      type: 'hotsSD2',
      level: 'ahli',
      subject: 'mtk',
      classKey: 'sd2',
      explanation: `${p1 + p2} - ${p2} = ${p1} cm, kemudian ditambah 10 cm menjadi ${p1 + 10} cm.`,
    });
  }

  // 3. SD KELAS 3 (sd3): Perkalian, Pembagian dasar, Pecahan sederhana (1/2, 1/3, 1/4)
  for (let i = 1; i <= 12; i++) {
    const f1 = (i % 7) + 3; // 3..9
    const f2 = ((i * 3) % 7) + 3; // 3..9
    const prod = f1 * f2;
    const denom = (i % 5) + 3; // 3..7

    results.push({
      id: `sd3-mtk-pemula-${i}`,
      q: `Hasil perkalian dari ${f1} × ${f2} adalah...`,
      options: [String(prod), String(prod + f1), String(prod - f2), String(f1 + f2)],
      answer: 0,
      type: 'perkalianSD3',
      level: 'pemula',
      subject: 'mtk',
      classKey: 'sd3',
      explanation: `${f1} dikalikan ${f2} menghasilkan ${prod}.`,
    });

    results.push({
      id: `sd3-mtk-menengah-${i}`,
      q: `Hasil pembagian dari ${prod} : ${f1} adalah...`,
      options: [String(f2), String(f2 + 1), String(f2 + 2), String(Math.max(1, f2 - 1))],
      answer: 0,
      type: 'pembagianSD3',
      level: 'menengah',
      subject: 'mtk',
      classKey: 'sd3',
      explanation: `Karena ${f1} × ${f2} = ${prod}, maka ${prod} : ${f1} = ${f2}.`,
    });

    results.push({
      id: `sd3-mtk-mahir-${i}`,
      q: `Hasil penjumlahan pecahan sederhana berpenyebut sama: 1/${denom} + 1/${denom} adalah...`,
      options: [`2/${denom}`, `1/${denom * 2}`, `2/${denom * 2}`, `3/${denom}`],
      answer: 0,
      type: 'pecahanSederhanaSD3',
      level: 'mahir',
      subject: 'mtk',
      classKey: 'sd3',
      explanation: `Jika penyebut pecahan sudah sama (${denom}), jumlahkan pembilangnya: (1 + 1)/${denom} = 2/${denom}.`,
    });

    results.push({
      id: `sd3-mtk-ahli-${i}`,
      q: `Sebuah persegi memiliki panjang sisi ${f1} cm. Berapakah keliling persegi tersebut?`,
      options: [`${4 * f1} cm`, `${f1 * f1} cm`, `${2 * f1} cm`, `${3 * f1} cm`],
      answer: 0,
      type: 'kelilingPersegiSD3',
      level: 'ahli',
      subject: 'mtk',
      classKey: 'sd3',
      explanation: `Keliling persegi = 4 × sisi = 4 × ${f1} cm = ${4 * f1} cm.`,
    });
  }

  // 4. SD KELAS 4-6 (sd4, sd5, sd6, sd): DILARANG 4+4!
  // - Pemula: Perkalian puluhan (25 × 4, 15 × 6), pecahan senilai, KPK/FPB dasar
  // - Menengah: Pecahan campuran, desimal, persen, luas bangun datar
  // - Mahir: Soal cerita KPK/FPB, kecepatan = jarak/waktu, volume kubus/balok
  // - Ahli: HOTS / Olimpiade SD (perbandingan senilai, rata-rata gabungan, bangun ruang)
  const sdUpperClasses = ['sd4', 'sd5', 'sd6', 'sd'];
  const fpbKpkPairs = [
    { a: 6, b: 8, fpb: 2, kpk: 24 },
    { a: 12, b: 18, fpb: 6, kpk: 36 },
    { a: 8, b: 12, fpb: 4, kpk: 24 },
    { a: 10, b: 15, fpb: 5, kpk: 30 },
    { a: 9, b: 12, fpb: 3, kpk: 36 },
    { a: 14, b: 21, fpb: 7, kpk: 42 },
    { a: 16, b: 24, fpb: 8, kpk: 48 },
    { a: 15, b: 20, fpb: 5, kpk: 60 },
  ];
  const mulPairsSD4 = [
    { a: 25, b: 4, res: 100 },
    { a: 15, b: 6, res: 90 },
    { a: 24, b: 5, res: 120 },
    { a: 35, b: 4, res: 140 },
    { a: 18, b: 5, res: 90 },
    { a: 25, b: 8, res: 200 },
    { a: 16, b: 5, res: 80 },
    { a: 45, b: 2, res: 90 },
  ];

  sdUpperClasses.forEach((cls) => {
    for (let i = 0; i < 8; i++) {
      const pair = fpbKpkPairs[i % fpbKpkPairs.length];
      const mul = mulPairsSD4[i % mulPairsSD4.length];
      const whole = (i % 5) + 2;
      const rusuk = (i % 6) + 4; // 4..9

      // Pemula SD 4-6: 25 x 4, KPK/FPB dasar, pecahan senilai
      results.push({
        id: `${cls}-mtk-pemula-mul-${i}`,
        q: `Hasil operasi perkalian bilangan bulat ${mul.a} × ${mul.b} adalah...`,
        options: [String(mul.res), String(mul.res + 10), String(mul.res - 15), String(mul.a + mul.b)],
        answer: 0,
        type: 'perkalianPuluhanSD4',
        level: 'pemula',
        subject: 'mtk',
        classKey: cls,
        explanation: `${mul.a} dikalikan ${mul.b} sama dengan ${mul.res}.`,
      });

      results.push({
        id: `${cls}-mtk-pemula-kpk-${i}`,
        q: `Kelipatan Persekutuan Terkecil (KPK) dan Faktor Persekutuan Terbesar (FPB) dari ${pair.a} dan ${pair.b} berturut-turut adalah...`,
        options: [
          `KPK = ${pair.kpk} dan FPB = ${pair.fpb}`,
          `KPK = ${pair.fpb} dan FPB = ${pair.kpk}`,
          `KPK = ${pair.a * pair.b} dan FPB = 1`,
          `KPK = ${pair.kpk + 6} dan FPB = ${pair.fpb + 2}`,
        ],
        answer: 0,
        type: 'fpbKpkSD',
        level: 'pemula',
        subject: 'mtk',
        classKey: cls,
        explanation: `Kelipatan terkecil yang sama dari ${pair.a} dan ${pair.b} adalah ${pair.kpk} (KPK), dan faktor pembagi terbesarnya adalah ${pair.fpb} (FPB).`,
      });

      // Menengah SD 4-6: Pecahan campuran & desimal
      results.push({
        id: `${cls}-mtk-menengah-mixed-${i}`,
        q: `Pecahan campuran ${whole} 1/4 jika diubah menjadi bentuk pecahan desimal adalah...`,
        options: [`${whole},25`, `${whole},5`, `${whole},4`, `${whole},75`],
        answer: 0,
        type: 'pecahanCampuranDesimalSD',
        level: 'menengah',
        subject: 'mtk',
        classKey: cls,
        explanation: `Pecahan 1/4 senilai dengan 0,25. Maka ${whole} 1/4 = ${whole},25.`,
      });

      // Mahir SD 4-6: Soal cerita KPK & Volume Kubus
      results.push({
        id: `${cls}-mtk-mahir-kubus-${i}`,
        q: `Sebuah akuarium berbentuk kubus memiliki panjang rusuk ${rusuk} dm. Volume air maksimal yang dapat ditampung akuarium tersebut adalah...`,
        options: [
          `${rusuk * rusuk * rusuk} liter (dm³)`,
          `${rusuk * rusuk * 6} liter (dm³)`,
          `${rusuk * 12} liter (dm³)`,
          `${rusuk * rusuk} liter (dm³)`,
        ],
        answer: 0,
        type: 'volumeKubusSD',
        level: 'mahir',
        subject: 'mtk',
        classKey: cls,
        explanation: `Volume kubus = r³ = ${rusuk} × ${rusuk} × ${rusuk} = ${rusuk * rusuk * rusuk} dm³ (liter).`,
      });

      // Ahli SD 4-6: HOTS / Olimpiade SD (Kecepatan & Skala / Rata-rata)
      const kec = 40 + (i % 4) * 10; // 40, 50, 60, 70 km/jam
      const waktu = 2 + (i % 3); // 2, 3, 4 jam
      results.push({
        id: `${cls}-mtk-ahli-hots-${i}`,
        q: `[HOTS SD] Ayah mengendarai mobil dengan kecepatan rata-rata ${kec} km/jam selama ${waktu} jam, kemudian istirahat dan melanjutkan perjalanan sejauh 25 km lagi. Berapa total jarak yang ditempuh Ayah?`,
        options: [
          `${kec * waktu + 25} km`,
          `${kec * waktu} km`,
          `${kec + waktu + 25} km`,
          `${kec * (waktu + 1)} km`,
        ],
        answer: 0,
        type: 'hotsKecepatanSD',
        level: 'ahli',
        subject: 'mtk',
        classKey: cls,
        explanation: `Jarak tahap 1 = kecepatan × waktu = ${kec} × ${waktu} = ${kec * waktu} km. Total jarak = ${kec * waktu} + 25 = ${kec * waktu + 25} km.`,
      });
    }
  });

  // 5. SMP KELAS 7, 8, 9 (kelas7, kelas8, kelas9): DILARANG SOAL SD!
  // - Pemula: Aljabar dasar SMP (Contoh: Jika 2x + 3 = 9, x = ?; menyederhanakan bentuk aljabar)
  // - Menengah: SPLDV, Teorema Pythagoras, Gradien garis, Himpunan
  // - Mahir: Soal cerita aljabar, fungsi linear, bangun ruang sisi datar/lengkung
  // - Ahli: HOTS / Olimpiade SMP (Persamaan kuadrat, sistem persamaan, statistika HOTS)
  const smpClasses = ['kelas7', 'kelas8', 'kelas9'];
  for (let i = 1; i <= 12; i++) {
    const xVal = (i % 9) + 2; // 2..10
    const bConst = (i % 6) + 3; // 3..8
    const rhs = 2 * xVal + bConst;
    const k1 = (i % 6) + 3;
    const k2 = (i % 5) + 2;

    smpClasses.forEach((cls) => {
      // Pemula SMP: Aljabar dasar & PLSV (Jika 2x + b = c, x = ?)
      results.push({
        id: `${cls}-mtk-pemula-plsv-${i}`,
        q: `[Aljabar Dasar SMP] Jika diketahui persamaan linear 2x + ${bConst} = ${rhs}, maka nilai x yang memenuhi adalah...`,
        options: [String(xVal), String(xVal + 2), String(xVal - 1), String(xVal + 3)],
        answer: 0,
        type: 'aljabarLinearSMP',
        level: 'pemula',
        subject: 'mtk',
        classKey: cls,
        explanation: `2x = ${rhs} - ${bConst} = ${rhs - bConst}, sehingga x = ${rhs - bConst} / 2 = ${xVal}.`,
      });

      results.push({
        id: `${cls}-mtk-pemula-suku-${i}`,
        q: `[Aljabar Dasar SMP] Bentuk paling sederhana dari (${k1}x + ${k2}y) + (3x - y) adalah...`,
        options: [
          `${k1 + 3}x + ${k2 - 1}y`,
          `${k1 - 3}x + ${k2 + 1}y`,
          `${k1 * 3}x + ${k2}y`,
          `${k1 + k2}x + 2y`,
        ],
        answer: 0,
        type: 'aljabarSukuSMP',
        level: 'pemula',
        subject: 'mtk',
        classKey: cls,
        explanation: `Kelompokkan suku sejenis: (${k1} + 3)x + (${k2} - 1)y = ${k1 + 3}x + ${k2 - 1}y.`,
      });

      // Menengah SMP: Nilai Fungsi & Pythagoras / Gradien
      const fInput = (i % 5) + 2;
      const fResult = 4 * fInput - 3;
      results.push({
        id: `${cls}-mtk-menengah-fungsi-${i}`,
        q: `[Relasi & Fungsi SMP] Diketahui rumus fungsi f(x) = 4x - 3. Nilai dari f(${fInput}) adalah...`,
        options: [String(fResult), String(fResult + 6), String(4 * fInput + 3), String(fResult - 2)],
        answer: 0,
        type: 'fungsiLinearSMP',
        level: 'menengah',
        subject: 'mtk',
        classKey: cls,
        explanation: `Substitusikan x = ${fInput} ke dalam f(x): f(${fInput}) = 4(${fInput}) - 3 = ${4 * fInput} - 3 = ${fResult}.`,
      });

      // Mahir SMP: Analisis & Soal Cerita Aljabar / SPLDV
      const lebar = (i % 6) + 5;
      const panjang = lebar + 4;
      const keliling = 2 * (panjang + lebar);
      results.push({
        id: `${cls}-mtk-mahir-cerita-${i}`,
        q: `[Analisis Aljabar SMP] Panjang sebuah taman persegi panjang adalah 4 meter lebihnya dari lebarnya. Jika keliling taman tersebut ${keliling} meter, maka luas taman tersebut adalah...`,
        options: [
          `${panjang * lebar} m²`,
          `${(panjang + 2) * lebar} m²`,
          `${panjang + lebar} m²`,
          `${keliling * 2} m²`,
        ],
        answer: 0,
        type: 'soalCeritaAljabarSMP',
        level: 'mahir',
        subject: 'mtk',
        classKey: cls,
        explanation: `Misalkan lebar = l, maka panjang = l + 4. Keliling = 2(2l + 4) = ${keliling} -> l = ${lebar} m dan p = ${panjang} m. Luas = ${panjang} × ${lebar} = ${panjang * lebar} m².`,
      });

      // Ahli SMP: HOTS / Olimpiade SMP
      const r1 = (i % 4) + 2;
      const r2 = r1 + 3;
      const bCoef = r1 + r2;
      const cCoef = r1 * r2;
      results.push({
        id: `${cls}-mtk-ahli-hots-${i}`,
        q: `[HOTS SMP] Jika x₁ dan x₂ adalah akar-akar dari persamaan kuadrat x² - ${bCoef}x + ${cCoef} = 0, maka nilai dari x₁² + x₂² adalah...`,
        options: [
          String(r1 * r1 + r2 * r2),
          String(bCoef * bCoef),
          String(cCoef * 2),
          String(r1 + r2),
        ],
        answer: 0,
        type: 'hotsAljabarSMP',
        level: 'ahli',
        subject: 'mtk',
        classKey: cls,
        explanation: `Faktorkan (x - ${r1})(x - ${r2}) = 0 sehingga x₁ = ${r1} dan x₂ = ${r2}. Maka x₁² + x₂² = ${r1 * r1} + ${r2 * r2} = ${r1 * r1 + r2 * r2}.`,
      });
    });
  }

  // 6. SMA / SMK KELAS 10, 11, 12: DILARANG KERAS SOAL SD!
  // - Pemula: Konsep dasar SMA/SMK (Sederhanakan bentuk aljabar/eksponen 2a+3a, banyaknya himpunan bagian 2^n, fungsi dasar f(x), logaritma dasar ²log 8)
  // - Menengah: Penerapan standar kurikulum SMA/SMK (Sifat eksponen & logaritma, fungsi komposisi (f∘g)(x), trigonometri, matriks)
  // - Mahir: Analisis & soal cerita SMA/SMK (Barisan & deret geometri/aritmetika, turunan pertama f'(x), peluang kejadian)
  // - Ahli: HOTS / Olimpiade / UTBK level SMA/SMK (Limit fungsi aljabar, nilai stasioner/maksimum kalkulus, persamaan eksponen HOTS)
  const smaSmkClasses = ['sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma'];
  for (let i = 1; i <= 12; i++) {
    const aCoef1 = (i % 5) + 2; // 2..6
    const aCoef2 = (i % 4) + 3; // 3..6
    const nSet = (i % 5) + 3; // 3..7 -> 2^nSet
    const expPower = (i % 5) + 3; // 3..7 -> 2^expPower
    const val2 = Math.pow(2, expPower);
    const coef = (i % 6) + 2; // 2..7
    const lin = (i % 8) + 4; // 4..11

    smaSmkClasses.forEach((cls) => {
      // Pemula SMA/SMK: Konsep dasar SMA/SMK (Aljabar/Eksponen dasar, Himpunan Bagian, Fungsi Dasar, Logaritma Dasar)
      results.push({
        id: `${cls}-mtk-pemula-aljabar-${i}`,
        q: `[Konsep Dasar SMA/SMK] Bentuk sederhana dari operasi aljabar dan eksponen (${aCoef1}a + ${aCoef2}a) × a² adalah...`,
        options: [
          `${aCoef1 + aCoef2}a³`,
          `${aCoef1 * aCoef2}a²`,
          `${aCoef1 + aCoef2}a²`,
          `${aCoef1 + aCoef2}a⁴`,
        ],
        answer: 0,
        type: 'konsepDasarAljabarSMA',
        level: 'pemula',
        subject: 'mtk',
        classKey: cls,
        explanation: `Sederhanakan suku sejenis di dalam kurung: (${aCoef1}a + ${aCoef2}a) = ${aCoef1 + aCoef2}a. Kemudian kalikan dengan a²: ${aCoef1 + aCoef2}a¹⁺² = ${aCoef1 + aCoef2}a³.`,
      });

      results.push({
        id: `${cls}-mtk-pemula-himpunan-${i}`,
        q: `[Himpunan & Fungsi Dasar SMA/SMK] Diketahui himpunan A memiliki ${nSet} anggota. Banyaknya seluruh himpunan bagian dari A adalah...`,
        options: [
          String(Math.pow(2, nSet)),
          String(nSet * 2),
          String(nSet * nSet),
          String(Math.pow(2, nSet - 1)),
        ],
        answer: 0,
        type: 'himpunanBagianSMA',
        level: 'pemula',
        subject: 'mtk',
        classKey: cls,
        explanation: `Banyaknya himpunan bagian dari himpunan dengan n anggota dirumuskan dengan 2ⁿ = 2^${nSet} = ${Math.pow(2, nSet)}.`,
      });

      results.push({
        id: `${cls}-mtk-pemula-log-${i}`,
        q: `[Logaritma Dasar SMA/SMK] Nilai dari ²log ${val2} adalah...`,
        options: [
          String(expPower),
          String(expPower + 1),
          String(expPower - 1),
          String(expPower * 2),
        ],
        answer: 0,
        type: 'logaritmaDasarSMA',
        level: 'pemula',
        subject: 'mtk',
        classKey: cls,
        explanation: `Karena 2^${expPower} = ${val2}, maka menurut definisi logaritma ²log ${val2} = ${expPower}.`,
      });

      // Menengah SMA/SMK: Fungsi Komposisi & Sifat Eksponen/Logaritma
      const xInput = (i % 4) + 2;
      const gOut = xInput + 3;
      const fgOut = 2 * gOut - 1;
      results.push({
        id: `${cls}-mtk-menengah-komposisi-${i}`,
        q: `[Fungsi Komposisi SMA/SMK] Diketahui fungsi f(x) = 2x - 1 dan g(x) = x + 3. Nilai dari komposisi fungsi (f ∘ g)(${xInput}) adalah...`,
        options: [
          String(fgOut),
          String(fgOut - 3),
          String(2 * xInput + 3),
          String(fgOut + 4),
        ],
        answer: 0,
        type: 'fungsiKomposisiSMA',
        level: 'menengah',
        subject: 'mtk',
        classKey: cls,
        explanation: `Hitung g(${xInput}) = ${xInput} + 3 = ${gOut}. Lalu substitusikan ke f: f(${gOut}) = 2(${gOut}) - 1 = ${fgOut}.`,
      });

      // Mahir SMA/SMK: Analisis Kalkulus Dasar & Soal Cerita Deret
      results.push({
        id: `${cls}-mtk-mahir-calc-${i}`,
        q: `[Analisis Kalkulus SMA/SMK] Sebuah partikel bergerak mengikuti fungsi posisi s(t) = ${coef}t² + ${lin}t - 5 (dalam meter). Kecepatan sesaat partikel v(t) = s'(t) adalah...`,
        options: [
          `${coef * 2}t + ${lin}`,
          `${coef}t + ${lin}`,
          `${coef * 2}t² + ${lin}`,
          `${coef * 2}t - 5`,
        ],
        answer: 0,
        type: 'kalkulusSMA',
        level: 'mahir',
        subject: 'mtk',
        classKey: cls,
        explanation: `Kecepatan sesaat adalah turunan pertama fungsi posisi terhadap waktu: s'(t) = ${coef * 2}t + ${lin}.`,
      });

      // Ahli SMA/SMK: HOTS / Olimpiade / UTBK Penalaran Kuantitatif
      const limTarget = (i % 6) + 3; // 3..8
      results.push({
        id: `${cls}-mtk-ahli-utbk-${i}`,
        q: `[HOTS / UTBK SMA/SMK] Nilai dari limit fungsi aljabar lim(x→${limTarget}) (x² - ${limTarget * limTarget}) / (x - ${limTarget}) adalah...`,
        options: [
          String(limTarget * 2),
          String(limTarget),
          String(limTarget * limTarget),
          '0',
        ],
        answer: 0,
        type: 'utbkLimitSMA',
        level: 'ahli',
        subject: 'mtk',
        classKey: cls,
        explanation: `Faktorkan pembilang: (x - ${limTarget})(x + ${limTarget}) / (x - ${limTarget}) = x + ${limTarget}. Substitusi x = ${limTarget} menghasilkan ${limTarget} + ${limTarget} = ${limTarget * 2}.`,
      });
    });
  }

  return results;
}

/**
 * Merges all subjects into a unified, strictly grade-separated and level-accurate Question Bank.
 * NEVER overwrites `item.level` across all 4 levels!
 */
export function buildFullQuestionBank(): AdaptiveQuestion[] {
  const multiSubjectExpanded: AdaptiveQuestion[] = [];

  const allCuratedItems = [
    ...SD_LOWER_NON_MATH,
    ...SD_UPPER_NON_MATH,
    ...CURATED_MULTI_SUBJECT,
  ];

  allCuratedItems.forEach((item, idx) => {
    const classesForItem = item.targetClasses || ['kelas7', 'kelas8', 'kelas9', 'sma', 'umum'];
    classesForItem.forEach((cls) => {
      multiSubjectExpanded.push({
        id: `${cls}-${item.subject}-cur-${idx}-${item.level}`,
        q: item.q,
        options: [...item.options],
        answer: item.answer,
        type: item.type,
        level: item.level,
        subject: item.subject,
        classKey: cls,
        explanation: item.explanation,
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

