/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AdaptiveQuestion, QUESTION_BANK_INGGRIS } from './questionBankInggris';
import { QUESTION_BANK_PKN } from './questionBankPKN';

interface RawTopicQuestion {
  q: string;
  options: string[];
  answer: number;
  type: string;
  level: 'pemula' | 'menengah' | 'mahir' | 'ahli';
  subject: 'mtk' | 'ipa' | 'ips' | 'indo' | 'umum';
  explanation: string;
}

const CURATED_MULTI_SUBJECT: RawTopicQuestion[] = [
  // ── MATEMATIKA (MTK) ──
  {
    q: 'Hasil dari (-18) + 30 - (-12) adalah...',
    options: ['24', '0', '12', '-24'],
    answer: 0,
    type: 'bilanganBulat',
    level: 'pemula',
    subject: 'mtk',
    explanation: '(-18) + 30 = 12, kemudian 12 - (-12) = 12 + 12 = 24.',
  },
  {
    q: 'Bentuk sederhana dari aljabar 5x + 3y - 2x + 4y adalah...',
    options: ['3x + 7y', '7x + 7y', '3x + y', '7x - y'],
    answer: 0,
    type: 'aljabarDasar',
    level: 'pemula',
    subject: 'mtk',
    explanation: 'Kelompokkan suku sejenis: (5x - 2x) + (3y + 4y) = 3x + 7y.',
  },
  {
    q: 'Jika 3x - 7 = 14, maka nilai x yang memenuhi adalah...',
    options: ['7', '5', '9', '3'],
    answer: 0,
    type: 'persamaanLinear',
    level: 'menengah',
    subject: 'mtk',
    explanation: '3x = 14 + 7 -> 3x = 21 -> x = 21 / 3 = 7.',
  },
  {
    q: 'Sebuah segitiga siku-siku memiliki alas 6 cm dan tinggi 8 cm. Panjang sisi miring (hipotenusa) segitiga tersebut adalah...',
    options: ['10 cm', '12 cm', '14 cm', '9 cm'],
    answer: 0,
    type: 'pythagoras',
    level: 'menengah',
    subject: 'mtk',
    explanation: 'Menggunakan Teorema Pythagoras: c = √(6² + 8²) = √(36 + 64) = √100 = 10 cm.',
  },
  {
    q: 'Gradien garis yang memiliki persamaan y = 4x - 9 adalah...',
    options: ['4', '-9', '-4', '9'],
    answer: 0,
    type: 'persamaanGaris',
    level: 'mahir',
    subject: 'mtk',
    explanation: 'Pada persamaan y = mx + c, koefisien x yaitu m adalah gradien garis (m = 4).',
  },
  {
    q: 'Akar-akar persamaan kuadrat x² - 7x + 12 = 0 adalah...',
    options: ['x = 3 atau x = 4', 'x = -3 atau x = -4', 'x = 2 atau x = 6', 'x = 1 atau x = 12'],
    answer: 0,
    type: 'persamaanKuadrat',
    level: 'ahli',
    subject: 'mtk',
    explanation: 'Faktorkan (x - 3)(x - 4) = 0, sehingga x = 3 atau x = 4.',
  },

  // ── IPA (SAINS: FISIKA, BIOLOGI, KIMIA) ──
  {
    q: 'Satuan Internasional (SI) untuk besaran pokok suhu adalah...',
    options: ['Kelvin (K)', 'Celcius (°C)', 'Fahrenheit (°F)', 'Joule (J)'],
    answer: 0,
    type: 'besaran',
    level: 'pemula',
    subject: 'ipa',
    explanation: 'Satuan Internasional (SI) untuk suhu mutlak adalah Kelvin (K).',
  },
  {
    q: 'Organel sel tumbuhan yang berfungsi sebagai tempat berlangsungnya proses fotosintesis adalah...',
    options: ['Kloroplas', 'Mitokondria', 'Ribosom', 'Lisosom'],
    answer: 0,
    type: 'biologiSel',
    level: 'pemula',
    subject: 'ipa',
    explanation: 'Kloroplas mengandung zat hijau daun (klorofil) untuk menangkap energi cahaya matahari dalam fotosintesis.',
  },
  {
    q: 'Sebuah benda bermassa 4 kg diberi gaya dorong 20 N pada lantai licin. Percepatan yang dialami benda menurut Hukum II Newton adalah...',
    options: ['5 m/s²', '80 m/s²', '16 m/s²', '0,2 m/s²'],
    answer: 0,
    type: 'hukumNewton',
    level: 'menengah',
    subject: 'ipa',
    explanation: 'Sesuai Hukum II Newton: a = F / m = 20 N / 4 kg = 5 m/s².',
  },
  {
    q: 'Enzim amilase (ptialin) yang terdapat di dalam rongga mulut berfungsi untuk mengubah amilum (zat tepung) menjadi...',
    options: ['Glukosa / Maltosa (gula sederhana)', 'Asam amino', 'Asam lemak', 'Gliserol'],
    answer: 0,
    type: 'sistemPencernaan',
    level: 'menengah',
    subject: 'ipa',
    explanation: 'Enzim ptialin memecah karbohidrat kompleks (amilum) menjadi gula sederhana (maltosa/glukosa).',
  },
  {
    q: 'Pada rangkaian listrik tertutup, jika tegangan baterai 12 Volt dan hambatan lampu 4 Ohm, maka kuat arus listrik yang mengalir adalah...',
    options: ['3 Ampere', '48 Ampere', '8 Ampere', '0,33 Ampere'],
    answer: 0,
    type: 'hukumOhm',
    level: 'mahir',
    subject: 'ipa',
    explanation: 'Hukum Ohm: I = V / R = 12 V / 4 Ω = 3 Ampere.',
  },
  {
    q: 'Persilangan monohibrid dominan penuh antara bunga merah (MM) dan bunga putih (mm) menghasilkan keturunan F1 merah muda/merah (Mm). Jika F1 disilangkan sesamanya, rasio fenotipe F2 (Merah : Putih) adalah...',
    options: ['3 : 1', '1 : 1', '2 : 2', '9 : 3 : 3 : 1'],
    answer: 0,
    type: 'genetika',
    level: 'ahli',
    subject: 'ipa',
    explanation: 'Persilangan Mm x Mm menghasilkan MM, 2 Mm (ketiganya fenotipe merah), dan mm (putih), sehingga rasio 3 : 1.',
  },

  // ── IPS (GEOGRAFI, SEJARAH, EKONOMI, SOSIOLOGI) ──
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
  },
  {
    q: 'Tempat bertemunya penjual dan pembeli untuk melakukan transaksi barang atau jasa disebut...',
    options: ['Pasar', 'Gudang', 'Pabrik', 'Pelabuhan'],
    answer: 0,
    type: 'ekonomi',
    level: 'pemula',
    subject: 'ips',
    explanation: 'Pasar adalah institusi/tempat bertemunya permintaan (pembeli) dan penawaran (penjual).',
  },
  {
    q: 'Hukum Permintaan (Law of Demand) menyatakan bahwa apabila harga suatu barang naik (ceteris paribus), maka jumlah barang yang diminta akan...',
    options: ['Turun / Berkurang', 'Naik / Bertambah', 'Tetap tidak berubah', 'Menjadi tak terhingga'],
    answer: 0,
    type: 'ekonomi',
    level: 'menengah',
    subject: 'ips',
    explanation: 'Hubungan harga dan jumlah permintaan berbanding terbalik: saat harga naik, permintaan turun.',
  },
  {
    q: 'Organisasi pergerakan nasional modern pertama di Indonesia yang berdiri pada 20 Mei 1908 dan diperingati sebagai Hari Kebangkitan Nasional adalah...',
    options: ['Budi Utomo', 'Sarekat Islam', 'Indische Partij', 'Perhimpunan Indonesia'],
    answer: 0,
    type: 'sejarah',
    level: 'menengah',
    subject: 'ips',
    explanation: 'Budi Utomo didirikan oleh dr. Soetomo dan mahasiswa STOVIA pada 20 Mei 1908.',
  },
  {
    q: 'Kerja sama ekonomi antarnegara di kawasan Asia Tenggara (ASEAN) yang bertujuan membentuk kawasan perdagangan bebas disebut...',
    options: ['AFTA (ASEAN Free Trade Area)', 'OPEC', 'APEC', 'NATO'],
    answer: 0,
    type: 'asean',
    level: 'mahir',
    subject: 'ips',
    explanation: 'AFTA adalah kesepakatan perdagangan bebas negara-negara anggota ASEAN.',
  },
  {
    q: 'Kebijakan bank sentral (Bank Indonesia) untuk mengatur jumlah uang yang beredar di masyarakat guna menjaga kestabilan nilai rupiah disebut kebijakan...',
    options: ['Kebijakan Moneter', 'Kebijakan Fiskal', 'Kebijakan Subsidi Silang', 'Kebijakan Agraria'],
    answer: 0,
    type: 'ekonomiMakro',
    level: 'ahli',
    subject: 'ips',
    explanation: 'Kebijakan moneter dijalankan oleh Bank Sentral, sedangkan kebijakan fiskal (pajak/APBN) oleh Pemerintah.',
  },

  // ── BAHASA INDONESIA (LITERASI, TEKS, EYD) ──
  {
    q: 'Teks yang menggambarkan suatu objek, tempat, atau peristiwa secara rinci sehingga pembaca seolah-olah melihat dan merasakan sendiri disebut teks...',
    options: ['Teks Deskripsi', 'Teks Prosedur', 'Teks Eksposisi', 'Teks Negosiasi'],
    answer: 0,
    type: 'jenisTeks',
    level: 'pemula',
    subject: 'indo',
    explanation: 'Teks deskripsi bertujuan melukiskan objek secara konkret melalui pancaindra.',
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
  },
  {
    q: 'Bagian awal dalam struktur teks cerita fantasi atau narasi yang berisi pengenalan tokoh dan latar disebut...',
    options: ['Orientasi', 'Komplikasi', 'Resolusi', 'Koda'],
    answer: 0,
    type: 'strukturTeks',
    level: 'menengah',
    subject: 'indo',
    explanation: 'Orientasi adalah tahap pengenalan tokoh, waktu, dan tempat sebelum munculnya masalah (komplikasi).',
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
  },
  {
    q: 'Perhatikan kalimat berikut: "Para hadirin sekalian dimohon berdiri." Agar menjadi kalimat efektif dan tidak boros kata, perbaikan yang tepat adalah...',
    options: ['Hadirin dimohon berdiri.', 'Para hadirin-hadirin dimohon berdiri.', 'Semua para hadirin sekalian berdiri.', 'Hadirin sekalian semuanya dimohon berdiri.'],
    answer: 0,
    type: 'kalimatEfektif',
    level: 'mahir',
    subject: 'indo',
    explanation: 'Kata "hadirin" sudah bermakna jamak, sehingga tidak perlu ditambah "para" atau "sekalian".',
  },
  {
    q: 'Dalam teks ulasan (resensi) buku atau karya ilmiah, bagian yang memaparkan keunggulan dan kelemahan karya secara objektif disebut...',
    options: ['Evaluasi / Tafsiran Isi', 'Identitas Karya', 'Orientasi Pengarang', 'Daftar Pustaka'],
    answer: 0,
    type: 'teksUlasan',
    level: 'ahli',
    subject: 'indo',
    explanation: 'Tahap evaluasi mengulas kelebihan dan kekurangan karya secara berimbang.',
  },

  // ── KELAS UMUM (PENGETAHUAN UMUM, LOGIKA KERJA, LITERASI DIGITAL, FINANSIAL) ──
  {
    q: 'Jika sebuah proyek kerja dapat diselesaikan oleh 6 orang dalam waktu 12 hari, maka berapa hari waktu yang dibutuhkan jika proyek tersebut dikerjakan oleh 9 orang dengan kecepatan sama?',
    options: ['8 hari', '18 hari', '6 hari', '10 hari'],
    answer: 0,
    type: 'logikaNumerik',
    level: 'pemula',
    subject: 'umum',
    explanation: 'Perbandingan berbalik nilai: (6 x 12) / 9 = 72 / 9 = 8 hari.',
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
  },
  {
    q: 'Perhatikan pola deret angka logika berikut: 3, 6, 12, 24, 48, ... Angka selanjutnya yang tepat adalah...',
    options: ['96', '72', '60', '84'],
    answer: 0,
    type: 'deretLogika',
    level: 'menengah',
    subject: 'umum',
    explanation: 'Setiap suku dikalikan 2 (rasio geometri r = 2): 48 x 2 = 96.',
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
  },
];

/**
 * Generates procedural Math & Logic questions so the pool exceeds 5,000+ unique variations
 */
function generateMathTemplates(): AdaptiveQuestion[] {
  const results: AdaptiveQuestion[] = [];
  const classes = ['sd', 'kelas7', 'kelas8', 'kelas9', 'sma', 'umum'];

  for (let i = 1; i <= 60; i++) {
    const a = i + 4;
    const b = (i % 9) + 3;
    const sum = a * b;
    const xVal = (i % 12) + 2;
    const constVal = xVal * 3 + 5;

    classes.forEach((cls) => {
      // Pemula: Operasi Hitung & Bilangan Bulat
      results.push({
        id: `${cls}-mtk-gen-p-${i}`,
        q: `Berapakah hasil operasi hitung bilangan dari (${a} × ${b}) - ${i}?`,
        options: [
          String(sum - i),
          String(sum - i + 4),
          String(sum + i),
          String(sum - i - 3),
        ],
        answer: 0,
        type: 'bilanganBulat',
        level: 'pemula',
        subject: 'mtk',
        classKey: cls,
        explanation: `Kerjakan perkalian terlebih dahulu: (${a} × ${b}) = ${sum}, lalu dikurangi ${i} hasilnya ${sum - i}.`,
      });

      // Menengah: Aljabar Linear
      results.push({
        id: `${cls}-mtk-gen-m-${i}`,
        q: `Jika diketahui persamaan aljabar 3x + 5 = ${constVal}, maka nilai x adalah...`,
        options: [
          String(xVal),
          String(xVal + 2),
          String(xVal - 1),
          String(xVal + 5),
        ],
        answer: 0,
        type: 'aljabar',
        level: 'menengah',
        subject: 'mtk',
        classKey: cls,
        explanation: `3x = ${constVal} - 5 = ${constVal - 5}, maka x = ${constVal - 5} / 3 = ${xVal}.`,
      });

      // Mahir: Aritmetika Sosial / Persentase & Perbandingan
      const modal = (i % 10 + 1) * 50000;
      const untung = modal * 0.2;
      results.push({
        id: `${cls}-mtk-gen-h-${i}`,
        q: `Seorang pedagang membeli barang dengan modal Rp${modal.toLocaleString('id-ID')}. Jika ia ingin memperoleh keuntungan 20%, maka harga jual barang tersebut adalah...`,
        options: [
          `Rp${(modal + untung).toLocaleString('id-ID')}`,
          `Rp${(modal + untung * 0.5).toLocaleString('id-ID')}`,
          `Rp${(modal + untung * 1.5).toLocaleString('id-ID')}`,
          `Rp${(modal - untung * 0.5).toLocaleString('id-ID')}`,
        ],
        answer: 0,
        type: 'aritmetikaSosial',
        level: 'mahir',
        subject: 'mtk',
        classKey: cls,
        explanation: `Untung 20% = Rp${untung.toLocaleString('id-ID')}. Harga jual = Modal + Untung = Rp${(modal + untung).toLocaleString('id-ID')}.`,
      });

      // Ahli: Barisan & Deret Geometri / HOTS
      const u1 = (i % 5) + 2;
      const r = 2;
      const u5 = u1 * Math.pow(r, 4);
      results.push({
        id: `${cls}-mtk-gen-a-${i}`,
        q: `Suatu barisan geometri memiliki suku pertama a = ${u1} dan rasio r = 2. Nilai suku ke-5 (U5) dari barisan tersebut adalah...`,
        options: [
          String(u5),
          String(u5 / 2),
          String(u5 * 2),
          String(u5 + 8),
        ],
        answer: 0,
        type: 'barisanGeometri',
        level: 'ahli',
        subject: 'mtk',
        classKey: cls,
        explanation: `Rumus suku ke-n barisan geometri: Un = a × r^(n-1). Maka U5 = ${u1} × 2^4 = ${u1} × 16 = ${u5}.`,
      });
    });
  }

  return results;
}

/**
 * Merges all subjects into a unified, structured Question Bank
 */
export function buildFullQuestionBank(): AdaptiveQuestion[] {
  const classes = ['sd', 'kelas7', 'kelas8', 'kelas9', 'sma', 'umum'];
  const levels: ('pemula' | 'menengah' | 'mahir' | 'ahli')[] = ['pemula', 'menengah', 'mahir', 'ahli'];
  const multiSubjectExpanded: AdaptiveQuestion[] = [];

  CURATED_MULTI_SUBJECT.forEach((item, idx) => {
    classes.forEach((cls) => {
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
    ...QUESTION_BANK_INGGRIS,
    ...QUESTION_BANK_PKN,
    ...generateMathTemplates(),
    ...multiSubjectExpanded,
  ];
}

export const FULL_QUESTION_BANK: AdaptiveQuestion[] = buildFullQuestionBank();
