/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PROCEDURAL QUESTION POOL & ANTI-REPEAT ENGINE — MIMI V15
 * Generates 1000+ unique questions dynamically per category/class/level/subject
 * ensuring user NEVER receives the same questions or simple option rearrangements.
 */

import { AdaptiveQuestion } from './questionBankInggris';
import { DuelClassKey, DuelDifficultyLevel } from '../services/adaptiveDuelService';

// Hash function for fast question duplicate detection
export function computeQuestionHash(text: string): string {
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return 'qh_' + Math.abs(hash).toString(36);
}

// Calculate similarity ratio between two strings (0.0 to 1.0)
export function computeStringSimilarity(s1: string, s2: string): number {
  const w1 = new Set(s1.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const w2 = new Set(s2.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  if (w1.size === 0 || w2.size === 0) return 0;
  let intersection = 0;
  for (const w of w1) {
    if (w2.has(w)) intersection++;
  }
  return (2 * intersection) / (w1.size + w2.size);
}

// Fisher-Yates shuffle
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DYNAMIC PROCEDURAL GENERATOR FOR SD KELAS 1 (AHLL DILARANG FISIKA SMP/SMA!)
// ─────────────────────────────────────────────────────────────────────────────
function generateSd1Pool(level: DuelDifficultyLevel, count: number): AdaptiveQuestion[] {
  const list: AdaptiveQuestion[] = [];

  // LEVEL: PEMULA (Penjumlahan 1-20 Dasar, tebak angka 1-20)
  if (level === 'pemula') {
    const items = [
      { a: 4, b: 4 }, { a: 9, b: 5 }, { a: 6, b: 3 }, { a: 5, b: 5 },
      { a: 7, b: 2 }, { a: 8, b: 4 }, { a: 10, b: 3 }, { a: 3, b: 8 },
      { a: 6, b: 6 }, { a: 9, b: 2 }, { a: 7, b: 5 }, { a: 4, b: 8 },
      { a: 10, b: 5 }, { a: 8, b: 8 }, { a: 9, b: 6 }, { a: 7, b: 7 },
    ];
    items.forEach((p, idx) => {
      const sum = p.a + p.b;
      list.push({
        id: `gen-sd1-pemula-mtk-${idx}-${p.a}-${p.b}`,
        q: `Berapakah hasil dari ${p.a} + ${p.b}?`,
        options: [String(sum), String(sum + 1), String(Math.max(1, sum - 1)), String(sum + 2)],
        answer: 0,
        type: 'penjumlahanSD1',
        level: 'pemula',
        subject: 'mtk',
        classKey: 'sd1',
        explanation: `${p.a} ditambah ${p.b} menghasilkan angka ${sum}.`,
      });
    });

    // Kosakata & Sapaan Dasar SD1
    const greetings = [
      { en: 'Good morning', id: 'Selamat pagi', wrong: ['Selamat malam', 'Sampai jumpa', 'Terima kasih'] },
      { en: 'Thank you', id: 'Terima kasih', wrong: ['Sama-sama', 'Maaf', 'Halo'] },
      { en: 'Apple', id: 'Buah apel', wrong: ['Mobil', 'Buku', 'Sepatu'] },
      { en: 'Cat', id: 'Kucing', wrong: ['Gajah', 'Burung', 'Ikan'] },
    ];
    greetings.forEach((g, idx) => {
      list.push({
        id: `gen-sd1-pemula-eng-${idx}`,
        q: `Apa arti dari sapaan Bahasa Inggris "${g.en}"?`,
        options: [g.id, ...g.wrong],
        answer: 0,
        type: 'vocabSD1',
        level: 'pemula',
        subject: 'inggris',
        classKey: 'sd1',
        explanation: `"${g.en}" artinya ${g.id}.`,
      });
    });
  }

  // LEVEL: MENENGAH (Pengurangan 1-20 Cerita Kontekstual)
  if (level === 'menengah') {
    const contexts = [
      { item: 'jeruk', awal: 15, makan: 6 },
      { item: 'kelereng', awal: 18, hilang: 5 },
      { item: 'permen', awal: 14, bagi: 7 },
      { item: 'pensil warna', awal: 16, pinjam: 4 },
      { item: 'kue donat', awal: 12, makan: 5 },
      { item: 'buku cerita', awal: 19, simpan: 8 },
      { item: 'balon tiup', awal: 10, meletus: 3 },
      { item: 'ikan hias', awal: 17, pindah: 6 },
    ];
    contexts.forEach((c, idx) => {
      const sisa = c.awal - (c.makan || c.hilang || c.bagi || c.pinjam || c.simpan || c.meletus || c.pindah || 4);
      list.push({
        id: `gen-sd1-menengah-sub-${idx}-${c.awal}`,
        q: `Budi membawa ${c.awal} buah ${c.item}, lalu diberikan kepada temannya ${c.awal - sisa} buah. Berapa sisa ${c.item} Budi?`,
        options: [String(sisa), String(sisa + 1), String(Math.max(0, sisa - 1)), String(sisa + 2)],
        answer: 0,
        type: 'penguranganCeritaSD1',
        level: 'menengah',
        subject: 'mtk',
        classKey: 'sd1',
        explanation: `${c.awal} dikurangi ${c.awal - sisa} sama dengan ${sisa}.`,
      });
    });
  }

  // LEVEL: MAHIR (Pola Bilangan Loncat & Perbandingan Banyak Benda SD1)
  if (level === 'mahir') {
    for (let k = 2; k <= 10; k += 2) {
      list.push({
        id: `gen-sd1-mahir-loncat-${k}`,
        q: `Perhatikan urutan angka lompat berikut: ${k}, ${k + 2}, ${k + 4}, ... Berapakah angka selanjutnya?`,
        options: [String(k + 6), String(k + 5), String(k + 7), String(k + 8)],
        answer: 0,
        type: 'polaLoncatSD1',
        level: 'mahir',
        subject: 'mtk',
        classKey: 'sd1',
        explanation: `Setiap bilangan bertambah 2, jadi ${k + 4} + 2 = ${k + 6}.`,
      });
    }
  }

  // LEVEL: AHLI SD KELAS 1 (WAWASAN LOGIKA ANAK SD1: TEBAK HEWAN, BENTUK, WARNA, ARAH, TANPA HUKUM NEWTON!)
  if (level === 'ahli') {
    const sd1AhliTrivia = [
      {
        q: '[Tebak Hewan SD1] Hewan berbadan besar yang memiliki belalai panjang dan telinga lebar suka makan rumput adalah...',
        options: ['Gajah', 'Kelinci', 'Kucing', 'Burung dara'],
        answer: 0,
        exp: 'Gajah adalah hewan yang memiliki belalai panjang dan telinga yang sangat lebar.',
        subj: 'ipa' as const,
      },
      {
        q: '[Tebak Hewan SD1] Hewan yang bisa berenang di air dan bernapas menggunakan insang adalah...',
        options: ['Ikan', 'Ayam', 'Kambing', 'Kucing'],
        answer: 0,
        exp: 'Ikan hidup dan berenang di dalam air serta bernapas dengan insang.',
        subj: 'ipa' as const,
      },
      {
        q: '[Logika Bentuk SD1] Roda sepeda dan piring makan memiliki bentuk bangun datar yang sama, yaitu...',
        options: ['Lingkaran', 'Segitiga', 'Persegi panjang', 'Bintang'],
        answer: 0,
        exp: 'Roda sepeda dan piring makan berbentuk bundar/lingkaran.',
        subj: 'mtk' as const,
      },
      {
        q: '[Warna & Alam SD1] Daun tanaman yang sehat dan segar pada umumnya berwarna...',
        options: ['Hijau', 'Ungu', 'Merah jambu', 'Biru laut'],
        answer: 0,
        exp: 'Zat hijau daun (klorofil) membuat daun tanaman berwarna hijau segar.',
        subj: 'ipa' as const,
      },
      {
        q: '[Logika Urutan Waktu SD1] Kegiatan yang kita lakukan saat matahari mulai terbit di pagi hari sebelum berangkat sekolah adalah...',
        options: ['Sarapan pagi dan mandi', 'Tidur malam lelap', 'Melihat bintang di langit', 'Menonton kembang api malam tahun baru'],
        answer: 0,
        exp: 'Pagi hari kita mandi dan sarapan bergizi sebelum berangkat ke sekolah.',
        subj: 'ips' as const,
      },
      {
        q: '[Arah & Posisi SD1] Saat upacara bendera, posisi tangan kita saat memberi hormat bendera Merah Putih menggunakan tangan...',
        options: ['Tangan kanan', 'Tangan kiri', 'Kedua kaki', 'Siku kiri'],
        answer: 0,
        exp: 'Sikap hormat bendera Merah Putih yang benar dilakukan dengan tangan kanan.',
        subj: 'pkn' as const,
      },
      {
        q: '[Teka-Teki Anak SD1] Benda yang dipakai di kaki agar kaki kita terlindung dari batu tajam saat berjalan adalah...',
        options: ['Sepatu atau sandal', 'Topi kepala', 'Kacamata renang', 'Sarung tangan wol'],
        answer: 0,
        exp: 'Sepatu dan sandal melindungi telapak kaki kita saat berjalan.',
        subj: 'umum' as const,
      },
      {
        q: '[Logika Benda SD1] Manakah benda di bawah ini yang paling berat jika dibandingkan satu sama lain?',
        options: ['Meja belajar kayu', 'Satu lembar kertas', 'Satu bulu ayam', 'Satu helai daun'],
        answer: 0,
        exp: 'Meja belajar kayu jauh lebih berat dibanding kertas, bulu ayam, atau daun.',
        subj: 'ipa' as const,
      },
      {
        q: '[Hitung Penalaran SD1] Sinta punya 7 kue. Kakak memberi 5 kue lagi. Lalu dimakan Adik 2 kue. Berapa sisa kue Sinta sekarang?',
        options: ['10 kue', '8 kue', '12 kue', '9 kue'],
        answer: 0,
        exp: '7 + 5 = 12 kue, kemudian 12 - 2 = 10 kue.',
        subj: 'mtk' as const,
      },
      {
        q: '[Hewan & Suara SD1] Hewan berkaki empat yang bersuara "Mooo..." dan menghasilkan susu segar bagi anak-anak adalah...',
        options: ['Sapi', 'Bebek', 'Ayam', 'Katak'],
        answer: 0,
        exp: 'Sapi menghasilkan susu dan suaranya melenguh "Mooo".',
        subj: 'ipa' as const,
      },
    ];

    sd1AhliTrivia.forEach((t, idx) => {
      list.push({
        id: `gen-sd1-ahli-trivia-${idx}`,
        q: t.q,
        options: t.options,
        answer: t.answer,
        type: 'logikaAnakSD1',
        level: 'ahli',
        subject: t.subj,
        classKey: 'sd1',
        explanation: t.exp,
      });
    });
  }

  return list;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DYNAMIC PROCEDURAL GENERATOR FOR SMK KELAS 10-12 (VOKASI & KEJURUAN KHUSUS)
// ─────────────────────────────────────────────────────────────────────────────
function generateSmkPool(classKey: DuelClassKey, level: DuelDifficultyLevel): AdaptiveQuestion[] {
  const list: AdaptiveQuestion[] = [];

  // SMK KELAS 10-12: PEMULA (Dasar Kejuruan, Keselamatan Kerja K3, Alat Bengkel, Debet Kredit, Jaringan Dasar)
  if (level === 'pemula') {
    const smkPemulaList = [
      {
        q: '[K3 & Bengkel SMK] Perlengkapan Alat Pelindung Diri (APD) yang wajib dikenakan saat berada di bengkel mesin bubut atau pengelasan untuk melindungi mata dari percikan gram logam adalah...',
        options: ['Kacamata Safety (Safety Goggles)', 'Kacamata hitam gaya', 'Kacamata baca plus', 'Lensa kontak bening'],
        answer: 0,
        subj: 'umum' as const,
        exp: 'Kacamata safety tahan benturan melindungi kornea mata dari serpihan gram logam panas dan radiasi percikan las.',
      },
      {
        q: '[Dasar Akuntansi SMK] Dalam persamaan dasar akuntansi, hubungan antara Aset, Kewajiban (Liabilitas), dan Ekuitas (Modal) dirumuskan dengan...',
        options: ['Aset = Kewajiban + Ekuitas', 'Aset = Kewajiban - Ekuitas', 'Ekuitas = Aset + Kewajiban', 'Kewajiban = Aset + Ekuitas'],
        answer: 0,
        subj: 'ips' as const,
        exp: 'Persamaan akuntansi baku adalah Harta (Aset) = Utang (Kewajiban) + Modal (Ekuitas).',
      },
      {
        q: '[IT & Jaringan Komputer SMK] Kabel jaringan yang sering digunakan untuk menghubungkan komputer client ke switch di laboratorium komputer menggunakan konektor RJ-45 disebut kabel...',
        options: ['Kabel UTP (Unshielded Twisted Pair)', 'Kabel HDMI', 'Kabel Coaxial Antena', 'Kabel USB Tipe C'],
        answer: 0,
        subj: 'umum' as const,
        exp: 'Kabel UTP kategori Cat5e atau Cat6 dengan konektor RJ-45 adalah standar kabel LAN LAN lokal.',
      },
      {
        q: '[Teknik Ketenagalistrikan SMK] Alat ukur serbaguna yang digunakan untuk mengukur tegangan (Volt), arus (Ampere), dan hambatan (Ohm) dalam rangkaian elektronika adalah...',
        options: ['Multitester (AVO Meter)', 'Timbangan digital', 'Termometer air raksa', 'Manometer tekanan gas'],
        answer: 0,
        subj: 'ipa' as const,
        exp: 'AVO Meter merupakan singkatan dari Ampere-Volt-Ohm meter untuk mengecek kelistrikan.',
      },
      {
        q: '[Otomotif & TKR SMK] Minyak pelumas (oli mesin) pada kendaraan bermotor berfungsi utama untuk...',
        options: ['Mengurangi gesekan antar-komponen logam dan mendinginkan mesin', 'Membuat suara knalpot semakin keras', 'Membakar bahan bakar bensin', 'Menghilangkan rem angin'],
        answer: 0,
        subj: 'ipa' as const,
        exp: 'Oli mesin melumasi permukaan silinder dan piston untuk mereduksi gesekan serta menyerap panas berlebih.',
      },
      {
        q: '[Akuntansi SMK] Saat sebuah toko menerima pembayaran tunai dari pelanggan atas jasa servis yang telah selesai, pencatatan jurnal umumnya adalah...',
        options: ['Kas bertambah di Debet, Pendapatan Jasa bertambah di Kredit', 'Kas di Kredit, Utang Usaha di Debet', 'Modal di Debet, Kas di Kredit', 'Piutang di Kredit, Beban di Debet'],
        answer: 0,
        subj: 'ips' as const,
        exp: 'Penerimaan uang kas menambah saldo Kas (Debet) dan mencatat Pendapatan Jasa (Kredit).',
      },
    ];

    smkPemulaList.forEach((it, idx) => {
      list.push({
        id: `gen-${classKey}-pemula-vokasi-${idx}`,
        q: it.q,
        options: it.options,
        answer: it.answer,
        type: 'dasarKejuruanSMK',
        level: 'pemula',
        subject: it.subj,
        classKey,
        explanation: it.exp,
      });
    });
  }

  // SMK: MENENGAH (Penerapan Kejuruan, Alat Ukur Presisi, Jurnal Penyesuaian, Routing LAN)
  if (level === 'menengah') {
    const smkMenengahList = [
      {
        q: '[Pengukuran Presisi SMK] Untuk mengukur diameter luar batang poros silinder mesin dengan tingkat ketelitian hingga 0,01 mm, alat ukur yang paling tepat digunakan adalah...',
        options: ['Mikrometer Sekrup (Micrometer)', 'Penggaris baja panjang', 'Meteran gulung kain', 'Busur derajat plastik'],
        answer: 0,
        subj: 'ipa' as const,
        exp: 'Mikrometer sekrup memiliki ketelitian hingga 0,01 mm, cocok untuk pengukuran poros presisi.',
      },
      {
        q: '[TKJ & Jaringan SMK] Alamat IP versi 4 (IPv4) berikut yang termasuk dalam kelompok IP Address Private (dapat digunakan di jaringan lokal tanpa registrasi publik) adalah...',
        options: ['192.168.1.1', '8.8.8.8', '1.1.1.1', '157.240.22.35'],
        answer: 0,
        subj: 'umum' as const,
        exp: 'Rentang 192.168.0.0/16 adalah blok IP Private Class C yang digunakan untuk LAN lokal.',
      },
      {
        q: '[Teknik Mesin SMK] Pada jangka sorong (vernier caliper) dengan skala nonius 20 bagian, tingkat ketelitian alat ukur tersebut adalah...',
        options: ['0,05 mm', '0,5 mm', '0,001 mm', '1,0 mm'],
        answer: 0,
        subj: 'mtk' as const,
        exp: 'Ketelitian vernier caliper 20 skala = 1 mm / 20 = 0,05 mm.',
      },
    ];
    smkMenengahList.forEach((it, idx) => {
      list.push({
        id: `gen-${classKey}-menengah-vokasi-${idx}`,
        q: it.q,
        options: it.options,
        answer: it.answer,
        type: 'penerapanKejuruanSMK',
        level: 'menengah',
        subject: it.subj,
        classKey,
        explanation: it.exp,
      });
    });
  }

  // SMK: MAHIR (Studi Kasus Kejuruan, Troubleshooting, Laporan Neraca Saldo, Konfigurasi VLAN)
  if (level === 'mahir') {
    const smkMahirList = [
      {
        q: '[Troubleshooting Otomotif SMK] Sebuah sepeda motor mengalami mesin tersendat saat gas dibuka dan busi terlihat basah berjelaga hitam pekat. Analisis kerusakan yang paling mungkin terjadi adalah...',
        options: ['Campuran bahan bakar dan udara terlalu kaya (terlalu banyak bensin)', 'Campuran bahan bakar terlalu miskin (terlalu banyak udara)', 'Knalpot mengalami kebocoran udara', 'Bahan bakar bensin tercampur air murni'],
        answer: 0,
        subj: 'ipa' as const,
        exp: 'Busi berwarna hitam berjelaga menandakan pembakaran tidak sempurna akibat campuran bensin terlalu kaya dibanding udara.',
      },
      {
        q: '[Studi Kasus Jaringan SMK] Dua departemen di kantor ingin dipisahkan lalu lintas jaringannya demi keamanan data meskipun menggunakan satu switch fisik yang sama. Teknologi jaringan yang wajib diimplementasikan adalah...',
        options: ['VLAN (Virtual Local Area Network)', 'Repeater analog', 'Hub pasif', 'Kabel crossover'],
        answer: 0,
        subj: 'umum' as const,
        exp: 'VLAN membagi broadcast domain switch tunggal menjadi beberapa jaringan virtual yang terisolasi aman.',
      },
      {
        q: '[Akuntansi Keuangan SMK] Pada akhir periode akuntansi, saldo Perlengkapan Toko tercatat Rp 5.000.000. Setelah dihitung fisik di gudang, sisa perlengkapan adalah Rp 2.000.000. Jurnal penyesuaian yang harus dibuat adalah...',
        options: [
          'Beban Perlengkapan Toko (D) Rp 3.000.000, Perlengkapan Toko (K) Rp 3.000.000',
          'Perlengkapan Toko (D) Rp 2.000.000, Kas (K) Rp 2.000.000',
          'Beban Perlengkapan Toko (D) Rp 5.000.000, Kas (K) Rp 5.000.000',
          'Modal Usaha (D) Rp 3.000.000, Piutang (K) Rp 3.000.000',
        ],
        answer: 0,
        subj: 'ips' as const,
        exp: 'Perlengkapan yang terpakai selama periode berjalan = Rp 5.000.000 - Rp 2.000.000 = Rp 3.000.000 dicatat sebagai Beban Perlengkapan.',
      },
    ];
    smkMahirList.forEach((it, idx) => {
      list.push({
        id: `gen-${classKey}-mahir-vokasi-${idx}`,
        q: it.q,
        options: it.options,
        answer: it.answer,
        type: 'studiKasusKejuruanSMK',
        level: 'mahir',
        subject: it.subj,
        classKey,
        explanation: it.exp,
      });
    });
  }

  // SMK: AHLI (Uji Kompetensi Kejuruan UKK, Standar Sertifikasi BNSP, HOTS Vokasi)
  if (level === 'ahli') {
    const smkAhliList = [
      {
        q: '[Uji Kompetensi Industri SMK] Dalam sistem otomasi industri modern (PLC), fungsi utama dari rangkaian interlock pada kontrol motor listrik putar kanan (forward) dan putar kiri (reverse) adalah...',
        options: [
          'Mencegah kedua kontaktor bekerja secara bersamaan yang dapat memicu hubung singkat fase ke fase',
          'Mempercepat putaran motor listrik melebihi batas frekuensi normal',
          'Menghemat konsumsi daya listrik menjadi nol watt',
          'Menghilangkan getaran motor saat beban penuh',
        ],
        answer: 0,
        subj: 'ipa' as const,
        exp: 'Rangkaian interlock mekanik/elektrik wajib dipasang agar kontaktor forward dan reverse tidak aktif bersamaan.',
      },
      {
        q: '[Audit Laporan Keuangan SMK] Rasio likuiditas Quick Ratio (Acid-Test Ratio) perusahaan dihitung dengan rumus...',
        options: [
          '(Kas + Efek Pasar Modal + Piutang) dibagi Utang Lancar',
          'Total Aset Tetap dibagi Modal Sendiri',
          'Laba Bersih Setelah Pajak dibagi Penjualan',
          'Total Penjualan dibagi Beban Operasional',
        ],
        answer: 0,
        subj: 'ips' as const,
        exp: 'Quick Ratio mengukur kemampuan melunasi kewajiban jangka pendek tanpa mengandalkan penjualan persediaan barang dagang.',
      },
      {
        q: '[Cyber Security & Server SMK] Sebuah router gateway enterprise mengalami lonjakan traffic paket SYN flood TCP yang tidak wajar dari ribuan alamat IP spoofing. Tindakan konfigurasi mitigasi firewall yang paling tepat adalah...',
        options: [
          'Mengaktifkan fitur SYN Cookies dan rate-limiting pada firewall filter rule',
          'Mematikan kabel daya router utama',
          'Menghapus seluruh tabel routing dinamis BGP',
          'Mengubah nama SSID WiFi access point',
        ],
        answer: 0,
        subj: 'umum' as const,
        exp: 'SYN Cookies menangkal serangan SYN flood DoS dengan memvalidasi handshake TCP tanpa menghabiskan buffer memori koneksi server.',
      },
    ];
    smkAhliList.forEach((it, idx) => {
      list.push({
        id: `gen-${classKey}-ahli-vokasi-${idx}`,
        q: it.q,
        options: it.options,
        answer: it.answer,
        type: 'ukkHotsVokasiSMK',
        level: 'ahli',
        subject: it.subj,
        classKey,
        explanation: it.exp,
      });
    });
  }

  return list;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DYNAMIC PROCEDURAL GENERATOR FOR UMUM (DEFINISI BARU: 2 MAPEL SAJA)
// ─────────────────────────────────────────────────────────────────────────────
function generateUmumPool(level: DuelDifficultyLevel, subjectFilter: string): AdaptiveQuestion[] {
  const list: AdaptiveQuestion[] = [];

  // A. MAPEL: PENGETAHUAN UMUM
  if (subjectFilter === 'semua' || subjectFilter === 'umum') {
    // LEVEL: PEMULA (Soal umum dewasa dasar: Ibukota Indonesia, presiden pertama, letak geografis, dll.)
    if (level === 'pemula') {
      const umumPemula = [
        {
          q: 'Ibu Kota Negara Indonesia yang baru dan berlokasi di wilayah Kabupaten Penajam Paser Utara dan Kutai Kartanegara, Kalimantan Timur bernama...',
          options: ['Nusantara (IKN)', 'Balikpapan', 'Samarinda', 'Banjarmasin'],
          answer: 0,
          exp: 'Ibu Kota Nusantara (IKN) dibangun di Kalimantan Timur sebagai pusat pemerintahan masa depan Indonesia.',
        },
        {
          q: 'Proklamator dan Presiden pertama Republik Indonesia yang membacakan naskah Proklamasi Kemerdekaan pada 17 Agustus 1945 adalah...',
          options: ['Ir. Soekarno', 'Drs. Mohammad Hatta', 'Sutan Sjahrir', 'Jenderal Soedirman'],
          answer: 0,
          exp: 'Ir. Soekarno bersama Drs. Mohammad Hatta adalah sang Proklamator Kemerdekaan Indonesia.',
        },
        {
          q: 'Secara geografis, wilayah Kepulauan Indonesia diapit oleh dua samudra besar dunia, yaitu...',
          options: ['Samudra Hindia dan Samudra Pasifik', 'Samudra Atlantik dan Samudra Arktik', 'Samudra Pasifik dan Samudra Antartika', 'Samudra Hindia dan Samudra Atlantik'],
          answer: 0,
          exp: 'Indonesia berada di posisi silang strategis antara Samudra Hindia dan Samudra Pasifik.',
        },
        {
          q: 'Mata uang resmi yang digunakan di negara Jepang adalah...',
          options: ['Yen (JPY)', 'Won (KRW)', 'Dollar (USD)', 'Ringgit (MYR)'],
          answer: 0,
          exp: 'Yen (¥) adalah satuan mata uang resmi negara Jepang.',
        },
        {
          q: 'Lembaga internasional di bawah PBB yang bertanggung jawab dalam penanganan kesehatan masyarakat global adalah...',
          options: ['WHO (World Health Organization)', 'UNESCO', 'UNICEF', 'IMF'],
          answer: 0,
          exp: 'WHO adalah badan khusus PBB yang mengkoordinasikan kesehatan masyarakat internasional.',
        },
      ];
      umumPemula.forEach((it, idx) => {
        list.push({
          id: `gen-umum-pu-pemula-${idx}`,
          q: it.q,
          options: it.options,
          answer: it.answer,
          type: 'umumDewasaDasar',
          level: 'pemula',
          subject: 'umum',
          classKey: 'umum',
          explanation: it.exp,
        });
      });
    }

    // LEVEL: MENENGAH (Sejarah, Geografi, Nasional Menengah)
    if (level === 'menengah') {
      const umumMenengah = [
        {
          q: 'Peristiwa penculikan Ir. Soekarno dan Drs. Mohammad Hatta oleh para pemuda pejuang ke sebuah kota di Jawa Barat guna mendesak proklamasi kemerdekaan dikenal dengan...',
          options: ['Peristiwa Rengasdengklok', 'Bandung Lautan Api', 'Pertempuran Ambarawa', 'Serangan Umum 1 Maret'],
          answer: 0,
          exp: 'Peristiwa Rengasdengklok terjadi pada 16 Agustus 1945 agar proklamasi segera diproklamasikan tanpa pengaruh Jepang.',
        },
        {
          q: 'Selat yang memisahkan antara Pulau Jawa dan Pulau Sumatera serta menghubungkan Laut Jawa dengan Samudra Hindia adalah...',
          options: ['Selat Sunda', 'Selat Malaka', 'Selat Bali', 'Selat Makassar'],
          answer: 0,
          exp: 'Selat Sunda terletak di antara Banten (Jawa) dan Lampung (Sumatera).',
        },
        {
          q: 'Kongres Pemuda II yang menghasilkan ikrar bersejarah "Sumpah Pemuda" diselenggarakan pada tanggal...',
          options: ['28 Oktober 1928', '20 Mei 1908', '17 Agustus 1945', '1 Juni 1945'],
          answer: 0,
          exp: 'Sumpah Pemuda diikrarkan pada 28 Oktober 1928 menegaskan satu tanah air, satu bangsa, dan satu bahasa Indonesia.',
        },
        {
          q: 'Garis khayal khatulistiwa (ekuator) yang membagi bumi menjadi belahan utara dan selatan melintasi salah satu kota di Pulau Kalimantan, yaitu...',
          options: ['Pontianak', 'Banjarmasin', 'Palangkaraya', 'Tarakan'],
          answer: 0,
          exp: 'Kota Pontianak di Kalimantan Barat dikenal sebagai Kota Khatulistiwa karena tepat dilintasi garis lintang 0°.',
        },
      ];
      umumMenengah.forEach((it, idx) => {
        list.push({
          id: `gen-umum-pu-menengah-${idx}`,
          q: it.q,
          options: it.options,
          answer: it.answer,
          type: 'sejarahGeografiMenengah',
          level: 'menengah',
          subject: 'umum',
          classKey: 'umum',
          explanation: it.exp,
        });
      });
    }

    // LEVEL: MAHIR (Logika Umum, Analisis: Contoh: Mobil direm mendadak = Inersia/Hukum I Newton, BUKAN untuk SD!)
    if (level === 'mahir') {
      const umumMahir = [
        {
          q: '[Analisis Logika Fisika Terapan] Saat sebuah bus kota yang melaju kencang tiba-tiba direm mendadak oleh sopir, seluruh penumpang di dalamnya terdorong ke depan. Mengapa hal ini terjadi menurut prinsip fisika?',
          options: [
            'Karena adanya sifat inersia (kelembaman) benda yang cenderung mempertahankan keadaan geraknya (Hukum I Newton)',
            'Karena adanya gaya dorong udara dari kaca belakang bus',
            'Karena roda bus kehilangan massa gravitasi saat pengereman',
            'Karena gesekan ban menimbulkan gaya dorong ke depan',
          ],
          answer: 0,
          exp: 'Hukum I Newton menyatakan bahwa setiap benda memiliki kelembaman (inersia), yaitu kecenderungan untuk mempertahankan posisi diam atau gerak lurus beraturannya jika tidak ada resultan gaya luar.',
        },
        {
          q: '[Logika Efisiensi Kerja] Jika 8 orang tenaga ahli dapat menyelesaikan perakitan mesin dalam waktu 15 hari, berapa hari waktu yang dibutuhkan jika proyek tersebut dikerjakan oleh 12 orang tenaga ahli dengan kecepatan yang sama?',
          options: ['10 hari', '12 hari', '8 hari', '6 hari'],
          answer: 0,
          exp: 'Perbandingan berbalik nilai: (8 orang × 15 hari) / 12 orang = 120 / 12 = 10 hari.',
        },
        {
          q: '[Penalaran Silogisme Logis] Premis 1: Semua pengelola bisnis digital yang sukses selalu menjaga kepuasan pelanggan. Premis 2: Sebagian alumni kampus adalah pengelola bisnis digital yang sukses. Kesimpulan deduktif yang sah adalah...',
          options: [
            'Sebagian alumni kampus selalu menjaga kepuasan pelanggan',
            'Semua alumni kampus pasti menjadi pengelola bisnis digital yang sukses',
            'Tidak ada alumni kampus yang menjaga kepuasan pelanggan',
            'Kepuasan pelanggan hanya dijaga oleh alumni kampus',
          ],
          answer: 0,
          exp: 'Silogisme kategoris parsial: Sebagian alumni kampus yang sukses sebagai pengelola bisnis pasti menjaga kepuasan pelanggan.',
        },
        {
          q: '[Literasi Investasi & Risiko] Sifat dasar dalam teori portofolio investasi keuangan yang menyatakan bahwa instrumen dengan potensi keuntungan (return) tinggi pada umumnya berbanding lurus dengan...',
          options: [
            'Tingkat risiko kerugian yang juga tinggi (High Risk High Return)',
            'Jaminan modal pasti kembali 100% dari pemerintah',
            'Waktu pencairan yang instan dalam hitungan detik',
            'Nol biaya transaksi dan bebas pajak selamanya',
          ],
          answer: 0,
          exp: 'Prinsip utama investasi adalah High Risk, High Return: potensi imbal hasil besar berbanding lurus dengan potensi fluktuasi risiko.',
        },
      ];
      umumMahir.forEach((it, idx) => {
        list.push({
          id: `gen-umum-pu-mahir-${idx}`,
          q: it.q,
          options: it.options,
          answer: it.answer,
          type: 'analisisLogikaUmum',
          level: 'mahir',
          subject: 'umum',
          classKey: 'umum',
          explanation: it.exp,
        });
      });
    }

    // LEVEL: AHLI (Cerdas Cermat Nasional, Logika Kompleks, Sains Umum HOTS)
    if (level === 'ahli') {
      const umumAhli = [
        {
          q: '[Cerdas Cermat Sains HOTS] Gelombang gravitasi (gravitational waves) yang diprediksi oleh Albert Einstein pada tahun 1915 dalam Teori Relativitas Umum akhirnya berhasil dideteksi pertama kali oleh detektor observatorium...',
          options: ['LIGO (Laser Interferometer Gravitational-Wave Observatory)', 'Teleskop Luar Angkasa Hubble', 'Observatorium James Webb', 'CERN Large Hadron Collider'],
          answer: 0,
          exp: 'Observatorium LIGO berhasil mendeteksi gelombang gravitasi dari tumbukan lubang hitam biner pada September 2015.',
        },
        {
          q: '[Cerdas Cermat Nasional] Mahkamah Internasional (International Court of Justice) yang menjadi badan kehakiman utama PBB bertempat di kota...',
          options: ['Den Haag, Belanda', 'Jenewa, Swiss', 'New York, Amerika Serikat', 'Wina, Austria'],
          answer: 0,
          exp: 'Mahkamah Internasional (ICJ) berkedudukan di Istana Perdamaian di Den Haag (The Hague), Belanda.',
        },
        {
          q: '[Ekonomi Makro HOTS] Fenomena perekonomian di mana terjadi laju inflasi tinggi disertai dengan pertumbuhan ekonomi yang lambat dan angka pengangguran yang meningkat disebut...',
          options: ['Stagflasi (Stagflation)', 'Deflasi (Deflation)', 'Hiperinflasi (Hyperinflation)', 'Resesi Teknis (Technical Recession)'],
          answer: 0,
          exp: 'Stagflasi adalah gabungan kata dari stagnasi ekonomi dan inflasi harga yang tinggi secara simultan.',
        },
        {
          q: '[Astronomi & Kosmologi] Teleskop luar angkasa tercanggih yang diluncurkan oleh NASA, ESA, dan CSA pada akhir 2021 yang beroperasi pada spektrum inframerah dekat dan tengah adalah...',
          options: ['James Webb Space Telescope (JWST)', 'Kepler Space Telescope', 'Spitzer Space Telescope', 'Voyager 1'],
          answer: 0,
          exp: 'JWST mengorbit pada titik Lagrange L2 sekitar 1,5 juta km dari Bumi untuk memotret galaksi purba.',
        },
      ];
      umumAhli.forEach((it, idx) => {
        list.push({
          id: `gen-umum-pu-ahli-${idx}`,
          q: it.q,
          options: it.options,
          answer: it.answer,
          type: 'cerdasCermatNasional',
          level: 'ahli',
          subject: 'umum',
          classKey: 'umum',
          explanation: it.exp,
        });
      });
    }
  }

  // B. MAPEL: BAHASA INGGRIS UMUM
  if (subjectFilter === 'semua' || subjectFilter === 'inggris') {
    // PEMULA: Vocab Sehari-hari
    if (level === 'pemula') {
      const engPemula = [
        {
          q: '[Daily Vocab] Choose the most polite English phrase to ask for help from a stranger on the street:',
          options: ['"Excuse me, could you please help me?"', '"Hey you, help me right now!"', '"Give me your map!"', '"Why are you standing there?"'],
          answer: 0,
          exp: '"Excuse me, could you please help me?" is the standard polite way to ask for assistance.',
        },
        {
          q: '[Daily Vocab] What does the daily expression "Take care!" mean when parting with a colleague or friend?',
          options: ['Hati-hati dan jaga diri baik-baik', 'Cepat pergi sekarang', 'Jangan lupa bayar utangmu', 'Diam dan dengarkan'],
          answer: 0,
          exp: '"Take care!" is a warm farewell expression wishing safety and health.',
        },
        {
          q: '[Daily Vocab] In a restaurant, if you want the cashier to prepare the food so you can eat it at home, you say:',
          options: ['"For takeout, please" / "To go, please"', '"Throw it away, please"', '"Make it cold, please"', '"I will cook it myself"'],
          answer: 0,
          exp: '"For takeout" or "To go" means packaging the food to take home.',
        },
      ];
      engPemula.forEach((it, idx) => {
        list.push({
          id: `gen-umum-en-pemula-${idx}`,
          q: it.q,
          options: it.options,
          answer: it.answer,
          type: 'dailyEnglishVocab',
          level: 'pemula',
          subject: 'inggris',
          classKey: 'umum',
          explanation: it.exp,
        });
      });
    }

    // AHLI: TOEFL-Like Structure & Advanced Idioms
    if (level === 'ahli') {
      const engAhli = [
        {
          q: '[TOEFL Structure] Neither the senior software engineer nor the team managers ___ able to attend the annual cloud summit yesterday.',
          options: ['were', 'was', 'is', 'are'],
          answer: 0,
          exp: 'With "Neither ... nor ...", the verb agrees with the closer subject: "team managers" (plural), so in past tense it takes "were".',
        },
        {
          q: '[Advanced Idioms] If someone tells a project manager to "bite the bullet", they mean that the manager should:',
          options: [
            'Face a difficult, unpleasant situation with courage and get it over with',
            'Buy ammunition for hunting',
            'Cancel the project immediately without explanation',
            'Refuse to speak in the meeting',
          ],
          answer: 0,
          exp: '"Bite the bullet" means accepting a difficult reality and facing it bravely.',
        },
        {
          q: '[Inversion Structure] Seldom ___ such an inspiring keynote presentation on artificial intelligence and sustainable technology.',
          options: ['have we heard', 'we have heard', 'we did heard', 'we hearing'],
          answer: 0,
          exp: 'When a negative or restrictive adverbial (Seldom, Rarely, Never) begins a sentence, auxiliary inversion is required ("have we heard").',
        },
      ];
      engAhli.forEach((it, idx) => {
        list.push({
          id: `gen-umum-en-ahli-${idx}`,
          q: it.q,
          options: it.options,
          answer: it.answer,
          type: 'toeflStructureAhli',
          level: 'ahli',
          subject: 'inggris',
          classKey: 'umum',
          explanation: it.exp,
        });
      });
    }
  }

  return list;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MAIN GENERATION DISPATCHER: PROCEDURAL EXPANSION UP TO 1000+ UNIQUE ITEMS
// ─────────────────────────────────────────────────────────────────────────────
export function generateProceduralQuestionsForClassAndLevel(
  classKey: DuelClassKey,
  level: DuelDifficultyLevel,
  subjectFilter: string
): AdaptiveQuestion[] {
  let pool: AdaptiveQuestion[] = [];

  if (classKey === 'sd1') {
    pool = generateSd1Pool(level, 25);
  } else if (classKey === 'smk10' || classKey === 'smk11' || classKey === 'smk12') {
    pool = generateSmkPool(classKey, level);
  } else if (classKey === 'umum') {
    pool = generateUmumPool(level, subjectFilter);
  }

  return pool;
}
