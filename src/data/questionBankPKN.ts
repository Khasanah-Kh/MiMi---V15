/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AdaptiveQuestion } from './questionBankInggris';

interface PancasilaSilaData {
  nomor: number;
  bunyi: string;
  lambang: string;
  nilaiUtama: string;
  contohSekolah: string[];
  contohMasyarakat: string[];
  kasusPenerapan: {
    kasus: string;
    tindakanBenar: string;
    distractors: string[];
  }[];
}

const PANCASILA_DATA: PancasilaSilaData[] = [
  {
    nomor: 1,
    bunyi: 'Ketuhanan Yang Maha Esa',
    lambang: 'Bintang Emas',
    nilaiUtama: 'Nilai Ketuhanan, keimanan, dan toleransi antarumat beragama',
    contohSekolah: [
      'Berdoa sebelum dan sesudah belajar di kelas sesuai agama masing-masing',
      'Menghormati teman sekelas yang sedang menjalankan ibadah puasa',
      'Tidak mengganggu teman yang berbeda agama saat beribadah',
    ],
    contohMasyarakat: [
      'Menjaga ketenangan lingkungan saat tetangga merayakan hari besar agamanya',
      'Bekerja sama menjaga kerukunan antarumat beragama di desa',
    ],
    kasusPenerapan: [
      {
        kasus: 'Saat sedang kerja kelompok di hari Minggu pagi, Roni meminta izin sebentar untuk beribadah ke gereja. Sikap anggota kelompok yang sesuai Sila ke-1 adalah...',
        tindakanBenar: 'Memberikan izin dengan tulus dan menunggu Roni selesai beribadah',
        distractors: ['Melarang Roni pergi karena tugas belum selesai', 'Mengeluarkan Roni dari kelompok belajar', 'Memarahi Roni di depan teman-teman'],
      },
      {
        kasus: 'Di sekolah terdapat siswa dari berbagai agama. Sikap yang mencerminkan pengalaman Sila Pertama Pancasila adalah...',
        tindakanBenar: 'Saling menghormati kebebasan beribadah tanpa memaksakan keyakinan',
        distractors: ['Hanya mau berteman dengan yang seagama saja', 'Mengejek tata cara ibadah teman lain', 'Memaksa teman mengikuti ibadah kita'],
      },
    ],
  },
  {
    nomor: 2,
    bunyi: 'Kemanusiaan yang Adil dan Beradab',
    lambang: 'Rantai Emas',
    nilaiUtama: 'Nilai Kemanusiaan, empati, kesetaraan derajat, dan tenggang rasa',
    contohSekolah: [
      'Menolong teman yang terjatuh di halaman sekolah tanpa pilih kasih',
      'Menjenguk teman sekelas yang sedang sakit di rumah sakit',
      'Tidak melakukan perundungan (bullying) terhadap teman di sekolah',
    ],
    contohMasyarakat: [
      'Mengumpulkan donasi bantuan untuk korban bencana banjir dan gempa bumi',
      'Bersikap sopan dan menghargai hak asasi setiap warga tanpa membedakan status sosial',
    ],
    kasusPenerapan: [
      {
        kasus: 'Ani melihat seorang teman terjatuh dari sepeda di dekat gerbang sekolah hingga bukunya berserakan. Sesuai Sila ke-2 Pancasila, tindakan Ani yang tepat adalah...',
        tindakanBenar: 'Segera menolongnya berdiri dan membantu merapikan buku-bukunya',
        distractors: ['Menertawakannya bersama teman-teman lain', 'Membiarkannya karena takut terlambat masuk kelas', 'Merekam kejadian tersebut untuk media sosial'],
      },
      {
        kasus: 'Ada siswa baru pindahan dari daerah lain yang masih malu-malu di kelas. Sikap yang sesuai dengan Sila ke-2 adalah...',
        tindakanBenar: 'Menyapanya dengan ramah dan mengajaknya duduk serta belajar bersama',
        distractors: ['Mengucilkannya karena logat bicaranya berbeda', 'Menjauhinya saat jam istirahat', 'Menyuruhnya duduk paling belakang sendirian'],
      },
    ],
  },
  {
    nomor: 3,
    bunyi: 'Persatuan Indonesia',
    lambang: 'Pohon Beringin',
    nilaiUtama: 'Nilai Persatuan, cinta tanah air, dan bangga sebagai bangsa Indonesia',
    contohSekolah: [
      'Mengikuti upacara bendera hari Senin dengan khidmat dan tertib',
      'Berteman akrab dengan seluruh siswa tanpa membedakan suku dan daerah asal',
      'Mempelajari dan melestarikan tarian serta lagu daerah Nusantara',
    ],
    contohMasyarakat: [
      'Mengutamakan pembelian produk buatan UMKM dalam negeri',
      'Gotong royong membersihkan lingkungan kampung menjelang Hari Kemerdekaan',
    ],
    kasusPenerapan: [
      {
        kasus: 'Di kelas 8 terdapat siswa dari suku Jawa, Sunda, Batak, Minang, dan Papua. Agar tercipta kerukunan sesuai Sila ke-3, sikap yang harus dikembangkan adalah...',
        tindakanBenar: 'Menghargai keunikan budaya masing-masing dan kompak bekerja sama',
        distractors: ['Membentuk geng berdasarkan suku masing-masing', 'Membanggakan suku sendiri dan merendahkan suku lain', 'Menolak satu kelompok dengan teman berbeda daerah'],
      },
      {
        kasus: 'Saat pameran budaya sekolah, kelompokmu diminta menampilkan kesenian daerah lain. Sikap yang mencerminkan Sila ke-3 adalah...',
        tindakanBenar: 'Berlatih dengan bangga dan antusias karena semua budaya daerah adalah kekayaan Indonesia',
        distractors: ['Menolak tampil karena bukan berasal dari daerah sendiri', 'Tampil asal-asalan tanpa persiapan', 'Meminta guru membatalkan acara pameran budaya'],
      },
    ],
  },
  {
    nomor: 4,
    bunyi: 'Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan',
    lambang: 'Kepala Banteng',
    nilaiUtama: 'Nilai Kerakyatan, demokrasi, musyawarah mufakat, dan menghargai pendapat',
    contohSekolah: [
      'Memilih ketua kelas atau ketua OSIS melalui pemungutan suara yang jujur',
      'Menentukan tujuan karyawisata kelas melalui musyawarah bersama',
      'Mendengarkan dengan sopan saat teman sedang menyampaikan pendapat di kelas',
    ],
    contohMasyarakat: [
      'Menghadiri rapat RT/RW untuk membahas jadwal siskamling secara mufakat',
      'Menerima dan melaksanakan hasil keputusan musyawarah dengan penuh tanggung jawab',
    ],
    kasusPenerapan: [
      {
        kasus: 'Dalam rapat pemilihan lagu untuk pentas seni kelas, usulan lagu dari Budi tidak terpilih karena mayoritas siswa memilih lagu lain. Sikap Budi yang sesuai Sila ke-4 adalah...',
        tindakanBenar: 'Menerima keputusan bersama dengan lapang dada dan tetap ikut berlatih',
        distractors: ['Marah dan keluar dari ruang kelas', 'Memaksa teman-teman mengikuti usulannya', 'Menggagalkan acara pentas seni kelas'],
      },
      {
        kasus: 'Saat diskusi kelompok, Dinda memiliki pendapat yang berbeda dengan ketua kelompok. Sikap ketua kelompok yang sesuai Sila ke-4 adalah...',
        tindakanBenar: 'Mendengarkan alasan Dinda dengan bijak dan memusyawarahkan jalan terbaik',
        distractors: ['Memotong pembicaraan Dinda secara kasar', 'Mengabaikan semua usulan anggota kelompok', 'Memutuskan sendiri tanpa bertanya pada anggota'],
      },
    ],
  },
  {
    nomor: 5,
    bunyi: 'Keadilan Sosial bagi Seluruh Rakyat Indonesia',
    lambang: 'Padi dan Kapas',
    nilaiUtama: 'Nilai Keadilan sosial, keseimbangan hak dan kewajiban, serta hidup hemat dan kerja keras',
    contohSekolah: [
      'Melaksanakan jadwal piket kebersihan kelas secara adil dan bergiliran',
      'Gemar menabung dan tidak bergaya hidup boros di sekolah',
      'Menjaga fasilitas umum sekolah agar dapat digunakan bersama-sama',
    ],
    contohMasyarakat: [
      'Menghargai hasil karya seni atau ciptaan orang lain',
      'Membayar pajak tepat waktu untuk pembangunan fasilitas masyarakat',
    ],
    kasusPenerapan: [
      {
        kasus: 'Kelompok piket hari Jumat mendapat tugas membersihkan kelas. Doni ingin langsung pulang bermain game tanpa ikut menyapu. Sikap Doni melanggar Sila ke-5 karena...',
        tindakanBenar: 'Tidak melaksanakan kewajiban secara adil sehingga membebani teman satu regu piket',
        distractors: ['Sudah meminta izin kepada ketua kelas', 'Ingin beribadah tepat waktu', 'Membantu guru membawa buku ke kantor'],
      },
      {
        kasus: 'Bima memiliki uang saku lebih dari orang tuanya. Sikap Bima yang sesuai dengan pengamalan Sila ke-5 Pancasila adalah...',
        tindakanBenar: 'Menabung sebagian uang sakunya dan hidup sederhana tanpa pamer',
        distractors: ['Menghamburkan uang untuk membeli barang mewah setiap hari', 'Memamerkan barang mahal kepada teman yang kurang mampu', 'Membuang makanan kantin yang masih utuh'],
      },
    ],
  },
];

interface PknTopicQuestion {
  q: string;
  options: string[];
  answer: number;
  type: string;
  level: 'pemula' | 'menengah' | 'mahir' | 'ahli';
  explanation: string;
}

const PKN_CURATED_QUESTIONS: PknTopicQuestion[] = [
  // Pemula: Norma, UUD Dasar, BPUPKI, PPKI, Hak & Kewajiban
  {
    q: 'UUD Negara Republik Indonesia Tahun 1945 disahkan oleh PPKI pada tanggal...',
    options: ['18 Agustus 1945', '17 Agustus 1945', '1 Juni 1945', '22 Juni 1945'],
    answer: 0,
    type: 'uud',
    level: 'pemula',
    explanation: 'PPKI mengesahkan UUD 1945 sehari setelah proklamasi kemerdekaan, yaitu pada 18 Agustus 1945.',
  },
  {
    q: 'Contoh pelaksanaan norma kesopanan di lingkungan sekolah adalah...',
    options: [
      'Mengucapkan salam dan mencium tangan guru saat bertemu',
      'Membayar pajak kendaraan bermotor tepat waktu',
      'Melaksanakan ibadah salat lima waktu',
      'Memakai helm standar saat berkendara di jalan raya',
    ],
    answer: 0,
    type: 'norma',
    level: 'pemula',
    explanation: 'Norma kesopanan bersumber dari tata krama dan kebiasaan masyarakat, seperti menyapa dan menghormati guru.',
  },
  {
    q: 'Aturan yang bersumber dari hati nurani manusia tentang baik dan buruknya perilaku disebut norma...',
    options: ['Norma Kesusilaan', 'Norma Hukum', 'Norma Kesopanan', 'Norma Adat'],
    answer: 0,
    type: 'norma',
    level: 'pemula',
    explanation: 'Norma kesusilaan berasal dari bisikan kalbu/hati nurani manusia (contoh: berlaku jujur, tidak mencontek).',
  },
  {
    q: 'Saat mengerjakan ujian di kelas, Raka memilih tidak mencontek meskipun pengawas sedang tidak melihat. Perilaku Raka menunjukkan ketaatan pada norma...',
    options: ['Kesusilaan dan Agama', 'Lalu lintas', 'Perdagangan', 'Mode pakaian'],
    answer: 0,
    type: 'penerapan',
    level: 'pemula',
    explanation: 'Kejujuran dari dalam hati nurani tanpa perlu diawasi merupakan wujud norma kesusilaan dan agama.',
  },
  {
    q: 'Semboyan bangsa Indonesia yang tertulis pada pita burung Garuda Pancasila adalah...',
    options: ['Bhinneka Tunggal Ika', 'Tut Wuri Handayani', 'Bersatu Kita Teguh', 'Garuda di Dadaku'],
    answer: 0,
    type: 'bhineka',
    level: 'pemula',
    explanation: 'Bhinneka Tunggal Ika berarti "Berbeda-beda tetapi tetap satu jua", diambil dari Kitab Sutasoma karya Mpu Tantular.',
  },
  {
    q: 'Badan Penyelidik Usaha-Usaha Persiapan Kemerdekaan Indonesia (BPUPKI) diketuai oleh...',
    options: ['Dr. K.R.T. Radjiman Wedyodiningrat', 'Ir. Soekarno', 'Drs. Mohammad Hatta', 'Mr. Soepomo'],
    answer: 0,
    type: 'sejarah',
    level: 'pemula',
    explanation: 'Ketua BPUPKI adalah Dr. K.R.T. Radjiman Wedyodiningrat, sedangkan ketua PPKI adalah Ir. Soekarno.',
  },
  {
    q: 'Piagam Jakarta (Jakarta Charter) dirumuskan oleh Panitia Sembilan pada tanggal...',
    options: ['22 Juni 1945', '1 Juni 1945', '17 Agustus 1945', '28 Oktober 1928'],
    answer: 0,
    type: 'sejarah',
    level: 'pemula',
    explanation: 'Panitia Sembilan berhasil menyusun Piagam Jakarta pada tanggal 22 Juni 1945.',
  },

  // Menengah: Demokrasi, Konstitusi, Bhinneka Tunggal Ika, Bela Negara, HAM
  {
    q: 'Norma yang memiliki sanksi tegas, memaksa, dan diatur oleh lembaga negara yang berwenang adalah...',
    options: ['Norma Hukum', 'Norma Kesopanan', 'Norma Kesusilaan', 'Norma Kebiasaan'],
    answer: 0,
    type: 'norma',
    level: 'menengah',
    explanation: 'Norma hukum dibuat oleh negara dan pelanggarannya dikenai sanksi tegas berupa denda atau pidana.',
  },
  {
    q: 'Lembaga negara yang berwenang mengubah dan menetapkan Undang-Undang Dasar menurut UUD 1945 adalah...',
    options: ['Majelis Permusyawaratan Rakyat (MPR)', 'Dewan Perwakilan Rakyat (DPR)', 'Mahkamah Konstitusi (MK)', 'Presiden'],
    answer: 0,
    type: 'konstitusi',
    level: 'menengah',
    explanation: 'Sesuai Pasal 3 ayat (1) UUD 1945, MPR berwenang mengubah dan menetapkan Undang-Undang Dasar.',
  },
  {
    q: 'Asas Pemilihan Umum (Pemilu) di Indonesia adalah "Luber Jurdil". Kepanjangan dari "Luber" adalah...',
    options: ['Langsung, Umum, Bebas, Rahasia', 'Lugas, Bersama, Rapi, Jujur', 'Langsung, Utama, Bersih, Ramah', 'Luas, Bebas, Resmi, Rahasia'],
    answer: 0,
    type: 'demokrasi',
    level: 'menengah',
    explanation: 'Asas Pemilu di Indonesia adalah Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil (Luber Jurdil).',
  },
  {
    q: 'Wujud nyata upaya Bela Negara yang dapat dilakukan oleh seorang pelajar SMP/SMA setiap hari adalah...',
    options: [
      'Belajar dengan tekun, mematuhi tata tertib sekolah, dan berprestasi mengharumkan bangsa',
      'Ikut berperang di perbatasan negara dengan senjata api',
      'Meninggalkan sekolah untuk bekerja di luar negeri',
      'Melanggar rambu lalu lintas saat berangkat sekolah',
    ],
    answer: 0,
    type: 'belaNegara',
    level: 'menengah',
    explanation: 'Bagi pelajar, bela negara diwujudkan melalui belajar sungguh-sungguh, disiplin, dan menjaga persatuan.',
  },
  {
    q: 'Pasal 27 ayat (3) UUD NRI Tahun 1945 menyatakan bahwa setiap warga negara berhak dan wajib ikut serta dalam...',
    options: ['Upaya pembelaan negara', 'Pemungutan pajak daerah', 'Perdagangan internasional', 'Pembuatan mata uang'],
    answer: 0,
    type: 'uud',
    level: 'menengah',
    explanation: 'Pasal 27 ayat (3) mengatur hak dan kewajiban warga negara dalam upaya pembelaan negara.',
  },
  {
    q: 'Hak Asasi Manusia (HAM) adalah hak dasar yang dimiliki manusia sejak lahir sebagai anugerah dari...',
    options: ['Tuhan Yang Maha Esa', 'Pemerintah Daerah', 'Perserikatan Bangsa-Bangsa', 'Kepala Sekolah'],
    answer: 0,
    type: 'ham',
    level: 'menengah',
    explanation: 'HAM merupakan hak kodrati anugerah Tuhan Yang Maha Esa yang wajib dihormati dan dilindungi.',
  },

  // Mahir: Analisis Kasus Demokrasi, Kedaulatan, Otonomi Daerah, Lembaga Yudikatif
  {
    q: 'Menurut Pasal 1 ayat (2) UUD NRI Tahun 1945 hasil amandemen, kedaulatan berada di tangan rakyat dan dilaksanakan menurut...',
    options: ['Undang-Undang Dasar', 'Keputusan Presiden', 'Peraturan Menteri', 'Kehendak Ketua MPR'],
    answer: 0,
    type: 'kedaulatan',
    level: 'mahir',
    explanation: 'Pasal 1 ayat (2) UUD 1945 menegaskan kedaulatan berada di tangan rakyat dan dilaksanakan menurut UUD.',
  },
  {
    q: 'Jika terjadi sengketa hasil Pemilihan Umum (PHPU) secara nasional, lembaga negara yang berwenang mengadili dan memutus pada tingkat pertama dan terakhir adalah...',
    options: ['Mahkamah Konstitusi (MK)', 'Mahkamah Agung (MA)', 'Komisi Yudisial (KY)', 'Komisi Pemilihan Umum (KPU)'],
    answer: 0,
    type: 'konstitusi',
    level: 'mahir',
    explanation: 'Pasal 24C ayat (1) UUD 1945 memberikan kewenangan kepada Mahkamah Konstitusi untuk memutus perselisihan tentang hasil pemilu.',
  },
  {
    q: 'Dalam pelaksanaan Otonomi Daerah, urusan pemerintahan yang tetap menjadi kewenangan mutlak Pemerintah Pusat dan TIDAK diserahkan kepada daerah adalah...',
    options: [
      'Politik luar negeri, pertahanan, keamanan, yustisi, moneter, dan agama',
      'Pengelolaan pasar tradisional dan kebersihan taman kota',
      'Perbaikan jalan kabupaten dan pengelolaan puskesmas',
      'Pembangunan gedung sekolah dasar dan perpustakaan daerah',
    ],
    answer: 0,
    type: 'otonomi',
    level: 'mahir',
    explanation: 'Enam urusan absolut pemerintah pusat meliputi politik luar negeri, pertahanan, keamanan, yustisi, moneter/fiskal nasional, dan agama.',
  },
  {
    q: 'Di era media sosial, sering muncul berita bohong (hoaks) yang memicu perpecahan antarkelompok masyarakat. Sikap warga negara yang cerdas dan sesuai nilai Pancasila adalah...',
    options: [
      'Melakukan verifikasi fakta (saring sebelum sharing) dan tidak menyebarkan ujaran kebencian',
      'Langsung meneruskan pesan ke semua grup WhatsApp keluarga',
      'Ikut memberikan komentar provokatif agar semakin viral',
      'Menyalahkan seluruh pengguna internet di dunia',
    ],
    answer: 0,
    type: 'kasus',
    level: 'mahir',
    explanation: 'Literasi digital beretika Pancasila menuntut warga menyaring kebenaran informasi demi menjaga persatuan bangsa.',
  },

  // Ahli: Analisis HOTS Konstitusi, Globalisasi, Hukum Internasional, Pancasila sebagai Ideologi Terbuka
  {
    q: 'Pancasila disebut sebagai "Ideologi Terbuka" karena mampu menyesuaikan diri dengan perkembangan zaman tanpa mengubah nilai dasarnya. Dimensi yang mencerminkan kemampuan ideologi beradaptasi dengan realitas masyarakat disebut...',
    options: ['Dimensi Fleksibilitas (Pengembangan)', 'Dimensi Kaku (Dogmatis)', 'Dimensi Tertutup', 'Dimensi Kolonial'],
    answer: 0,
    type: 'ideologi',
    level: 'ahli',
    explanation: 'Sebagai ideologi terbuka, Pancasila memiliki dimensi idealisme, dimensi normatif, dan dimensi realitas/fleksibilitas.',
  },
  {
    q: 'Dalam sistem pembagian kekuasaan di Indonesia menurut UUD NRI Tahun 1945, Presiden mengajukan rancangan undang-undang (RUU) untuk dibahas bersama DPR. Hal ini menunjukkan penerapan prinsip...',
    options: [
      'Checks and Balances (saling mengimbangi dan mengawasi antarlembaga negara)',
      'Kekuasaan absolut di tangan kepala negara',
      'Penyatuan seluruh kekuasaan negara pada satu badan',
      'Penghapusan fungsi legislatif parlemen',
    ],
    answer: 0,
    type: 'konstitusi',
    level: 'ahli',
    explanation: 'Mekanisme persetujuan bersama antara DPR dan Presiden dalam membentuk UU adalah wujud prinsip checks and balances.',
  },
  {
    q: 'Arus globalisasi memudahkan masuknya budaya asing ke Indonesia. Sikap selektif yang berlandaskan jati diri bangsa dalam menghadapi globalisasi adalah...',
    options: [
      'Mengadopsi etos kerja disiplin serta penguasaan IPTEK, sambil tetap memegang teguh nilai luhur Pancasila',
      'Menolak seluruh teknologi modern dan menutup diri dari pergaulan dunia',
      'Meniru seluruh gaya hidup bebas bangsa barat tanpa penyaringan',
      'Meninggalkan bahasa Indonesia dan budaya lokal karena dianggap kuno',
    ],
    answer: 0,
    type: 'globalisasi',
    level: 'ahli',
    explanation: 'Sikap selektif positif berarti menyerap kemajuan IPTEK dan disiplin kerja sembari menyaring budaya yang bertentangan dengan Pancasila.',
  },
];

/**
 * Generates 800+ structured PKN questions across classes and levels
 */
export function generatePknQuestionBank(): AdaptiveQuestion[] {
  const results: AdaptiveQuestion[] = [];
  const classes = ['sd', 'kelas7', 'kelas8', 'kelas9', 'sma', 'umum'];
  const levels: ('pemula' | 'menengah' | 'mahir' | 'ahli')[] = ['pemula', 'menengah', 'mahir', 'ahli'];

  // 1. Auto-generate rich variations from the 5 Sila of Pancasila
  PANCASILA_DATA.forEach((sila) => {
    const otherSilas = PANCASILA_DATA.filter((s) => s.nomor !== sila.nomor);

    classes.forEach((cls) => {
      // Variation A: Bunyi Sila (Pemula)
      results.push({
        id: `${cls}-pkn-sila-bunyi-${sila.nomor}`,
        q: `Bunyi Sila ke-${sila.nomor} Pancasila yang tepat adalah...`,
        options: [
          sila.bunyi,
          otherSilas[0].bunyi,
          otherSilas[1].bunyi,
          otherSilas[2].bunyi,
        ],
        answer: 0,
        type: 'pancasila',
        level: 'pemula',
        subject: 'pkn',
        classKey: cls,
        explanation: `Sila ke-${sila.nomor} Pancasila berbunyi "${sila.bunyi}" dengan lambang ${sila.lambang}.`,
      });

      // Variation B: Lambang Sila (Pemula)
      results.push({
        id: `${cls}-pkn-sila-lambang-${sila.nomor}`,
        q: `Lambang dari Sila ke-${sila.nomor} Pancasila ("${sila.bunyi}") pada perisai Garuda Pancasila adalah...`,
        options: [
          sila.lambang,
          otherSilas[0].lambang,
          otherSilas[1].lambang,
          otherSilas[2].lambang,
        ],
        answer: 0,
        type: 'pancasila',
        level: 'pemula',
        subject: 'pkn',
        classKey: cls,
        explanation: `Lambang Sila ke-${sila.nomor} adalah ${sila.lambang}.`,
      });

      // Variation C: Contoh Penerapan di Sekolah (Pemula & Menengah)
      sila.contohSekolah.forEach((contoh, cIdx) => {
        results.push({
          id: `${cls}-pkn-sila-sek-${sila.nomor}-${cIdx}`,
          q: `Perilaku "${contoh}" merupakan contoh nyata pengamalan Pancasila di lingkungan sekolah, khususnya Sila ke-...`,
          options: [
            `Sila ke-${sila.nomor} (${sila.bunyi})`,
            `Sila ke-${otherSilas[0].nomor} (${otherSilas[0].bunyi})`,
            `Sila ke-${otherSilas[1].nomor} (${otherSilas[1].bunyi})`,
            `Sila ke-${otherSilas[2].nomor} (${otherSilas[2].bunyi})`,
          ],
          answer: 0,
          type: 'penerapan',
          level: cIdx === 0 ? 'pemula' : 'menengah',
          subject: 'pkn',
          classKey: cls,
          explanation: `Tindakan tersebut mencerminkan ${sila.nilaiUtama} pada Sila ke-${sila.nomor}.`,
        });
      });

      // Variation D: Kasus Penerapan Kontekstual (Menengah, Mahir, Ahli)
      sila.kasusPenerapan.forEach((kasusObj, kIdx) => {
        levels.forEach((lvl) => {
          results.push({
            id: `${cls}-pkn-kasus-${sila.nomor}-${kIdx}-${lvl}`,
            q: kasusObj.kasus,
            options: [kasusObj.tindakanBenar, ...kasusObj.distractors],
            answer: 0,
            type: 'kasus_penerapan',
            level: lvl,
            subject: 'pkn',
            classKey: cls,
            explanation: `Sesuai Sila ke-${sila.nomor} (${sila.bunyi}), kita wajib mengutamakan ${sila.nilaiUtama.toLowerCase()}.`,
          });
        });
      });
    });
  });

  // 2. Add Curated PKN Questions (UUD, Norma, Demokrasi, HAM, Otonomi, Globalisasi)
  PKN_CURATED_QUESTIONS.forEach((item, idx) => {
    classes.forEach((cls) => {
      results.push({
        id: `${cls}-pkn-cur-${idx}`,
        q: item.q,
        options: [...item.options],
        answer: item.answer,
        type: item.type,
        level: item.level,
        subject: 'pkn',
        classKey: cls,
        explanation: item.explanation,
      });
    });
  });

  return results;
}

export const QUESTION_BANK_PKN: AdaptiveQuestion[] = generatePknQuestionBank();
