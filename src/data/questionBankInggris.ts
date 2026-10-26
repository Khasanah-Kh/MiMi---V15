/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AdaptiveQuestion {
  id: string;
  q: string;
  options: string[];
  answer: number;
  type: string;
  level: 'pemula' | 'menengah' | 'mahir' | 'ahli';
  subject: 'inggris' | 'pkn' | 'mtk' | 'ipa' | 'ips' | 'indo' | 'umum';
  classKey: string;
  story?: string;
  explanation?: string;
}

interface VocabItem {
  eng: string;
  indo: string;
  category: string;
  level: 'pemula' | 'menengah' | 'mahir' | 'ahli';
}

const VOCAB_DICTIONARY: VocabItem[] = [
  // Kelas 7 Pemula: School, Family, Daily Activity, Numbers, Colors
  { eng: 'Book', indo: 'Buku', category: 'school', level: 'pemula' },
  { eng: 'Pencil', indo: 'Pensil', category: 'school', level: 'pemula' },
  { eng: 'Blackboard', indo: 'Papan tulis', category: 'school', level: 'pemula' },
  { eng: 'Classroom', indo: 'Ruang kelas', category: 'school', level: 'pemula' },
  { eng: 'Teacher', indo: 'Guru', category: 'school', level: 'pemula' },
  { eng: 'Library', indo: 'Perpustakaan', category: 'school', level: 'pemula' },
  { eng: 'Schoolyard', indo: 'Halaman sekolah', category: 'school', level: 'pemula' },
  { eng: 'Dictionary', indo: 'Kamus', category: 'school', level: 'pemula' },
  { eng: 'Eraser', indo: 'Penghapus', category: 'school', level: 'pemula' },
  { eng: 'Ruler', indo: 'Penggaris', category: 'school', level: 'pemula' },
  { eng: 'Backpack', indo: 'Tas ransel', category: 'school', level: 'pemula' },
  { eng: 'Uniform', indo: 'Seragam', category: 'school', level: 'pemula' },
  { eng: 'Mother', indo: 'Ibu', category: 'family', level: 'pemula' },
  { eng: 'Father', indo: 'Ayah', category: 'family', level: 'pemula' },
  { eng: 'Parents', indo: 'Orang tua', category: 'family', level: 'pemula' },
  { eng: 'Brother', indo: 'Saudara laki-laki', category: 'family', level: 'pemula' },
  { eng: 'Sister', indo: 'Saudara perempuan', category: 'family', level: 'pemula' },
  { eng: 'Grandfather', indo: 'Kakek', category: 'family', level: 'pemula' },
  { eng: 'Grandmother', indo: 'Nenek', category: 'family', level: 'pemula' },
  { eng: 'Uncle', indo: 'Paman', category: 'family', level: 'pemula' },
  { eng: 'Aunt', indo: 'Bibi', category: 'family', level: 'pemula' },
  { eng: 'Cousin', indo: 'Sepupu', category: 'family', level: 'pemula' },
  { eng: 'Breakfast', indo: 'Sarapan pagi', category: 'daily', level: 'pemula' },
  { eng: 'Lunch', indo: 'Makan siang', category: 'daily', level: 'pemula' },
  { eng: 'Dinner', indo: 'Makan malam', category: 'daily', level: 'pemula' },
  { eng: 'Wake up', indo: 'Bangun tidur', category: 'daily', level: 'pemula' },
  { eng: 'Take a bath', indo: 'Mandi', category: 'daily', level: 'pemula' },
  { eng: 'Brush teeth', indo: 'Menggosok gigi', category: 'daily', level: 'pemula' },
  { eng: 'Study', indo: 'Belajar', category: 'daily', level: 'pemula' },
  { eng: 'Sleep', indo: 'Tidur', category: 'daily', level: 'pemula' },
  { eng: 'Window', indo: 'Jendela', category: 'house', level: 'pemula' },
  { eng: 'Door', indo: 'Pintu', category: 'house', level: 'pemula' },
  { eng: 'Kitchen', indo: 'Dapur', category: 'house', level: 'pemula' },
  { eng: 'Bedroom', indo: 'Kamar tidur', category: 'house', level: 'pemula' },
  { eng: 'Garden', indo: 'Taman / Kebun', category: 'house', level: 'pemula' },

  // Menengah: Adjectives, Verbs, Professions, Environment, Health
  { eng: 'Diligent', indo: 'Rajin', category: 'adjective', level: 'menengah' },
  { eng: 'Generous', indo: 'Dermawan / Murah hati', category: 'adjective', level: 'menengah' },
  { eng: 'Humble', indo: 'Rendah hati', category: 'adjective', level: 'menengah' },
  { eng: 'Honest', indo: 'Jujur', category: 'adjective', level: 'menengah' },
  { eng: 'Brave', indo: 'Berani', category: 'adjective', level: 'menengah' },
  { eng: 'Patient', indo: 'Sabar', category: 'adjective', level: 'menengah' },
  { eng: 'Curious', indo: 'Ingin tahu / Penasaran', category: 'adjective', level: 'menengah' },
  { eng: 'Polite', indo: 'Sopan', category: 'adjective', level: 'menengah' },
  { eng: 'Confidence', indo: 'Kepercayaan diri', category: 'noun', level: 'menengah' },
  { eng: 'Environment', indo: 'Lingkungan', category: 'nature', level: 'menengah' },
  { eng: 'Pollution', indo: 'Pencemaran / Polusi', category: 'nature', level: 'menengah' },
  { eng: 'Recycle', indo: 'Mendaur ulang', category: 'nature', level: 'menengah' },
  { eng: 'Forest', indo: 'Hutan', category: 'nature', level: 'menengah' },
  { eng: 'Earthquake', indo: 'Gempa bumi', category: 'nature', level: 'menengah' },
  { eng: 'Flood', indo: 'Banjir', category: 'nature', level: 'menengah' },
  { eng: 'Weather', indo: 'Cuaca', category: 'nature', level: 'menengah' },
  { eng: 'Medicine', indo: 'Obat', category: 'health', level: 'menengah' },
  { eng: 'Hospital', indo: 'Rumah sakit', category: 'health', level: 'menengah' },
  { eng: 'Headache', indo: 'Sakit kepala', category: 'health', level: 'menengah' },
  { eng: 'Exercise', indo: 'Olahraga / Latihan', category: 'health', level: 'menengah' },
  { eng: 'Healthy', indo: 'Sehat', category: 'health', level: 'menengah' },
  { eng: 'Architect', indo: 'Arsitek', category: 'profession', level: 'menengah' },
  { eng: 'Scientist', indo: 'Ilmuwan', category: 'profession', level: 'menengah' },
  { eng: 'Journalist', indo: 'Wartawan', category: 'profession', level: 'menengah' },
  { eng: 'Engineer', indo: 'Insinyur / Teknisi', category: 'profession', level: 'menengah' },

  // Mahir & Ahli: Academic, Science, Technology, Global Issues, Workplace
  { eng: 'Achievement', indo: 'Pencapaian / Prestasi', category: 'academic', level: 'mahir' },
  { eng: 'Knowledge', indo: 'Pengetahuan', category: 'academic', level: 'mahir' },
  { eng: 'Opportunity', indo: 'Kesempatan / Peluang', category: 'academic', level: 'mahir' },
  { eng: 'Responsibility', indo: 'Tanggung jawab', category: 'academic', level: 'mahir' },
  { eng: 'Independence', indo: 'Kemandirian / Kemerdekaan', category: 'academic', level: 'mahir' },
  { eng: 'Discovery', indo: 'Penemuan', category: 'science', level: 'mahir' },
  { eng: 'Experiment', indo: 'Percobaan / Eksperimen', category: 'science', level: 'mahir' },
  { eng: 'Renewable energy', indo: 'Energi terbarukan', category: 'science', level: 'mahir' },
  { eng: 'Biodiversity', indo: 'Keanekaragaman hayati', category: 'science', level: 'mahir' },
  { eng: 'Climate change', indo: 'Perubahan iklim', category: 'science', level: 'mahir' },
  { eng: 'Artificial Intelligence', indo: 'Kecerdasan buatan', category: 'tech', level: 'mahir' },
  { eng: 'Cybersecurity', indo: 'Keamanan siber', category: 'tech', level: 'mahir' },
  { eng: 'Collaboration', indo: 'Kolaborasi / Kerja sama', category: 'work', level: 'ahli' },
  { eng: 'Sustainability', indo: 'Keberlanjutan', category: 'academic', level: 'ahli' },
  { eng: 'Comprehensive', indo: 'Menyeluruh / Lengkap', category: 'academic', level: 'ahli' },
  { eng: 'Significant', indo: 'Penting / Bermakna besar', category: 'academic', level: 'ahli' },
  { eng: 'Inevitable', indo: 'Tidak dapat dihindari', category: 'academic', level: 'ahli' },
  { eng: 'Consequence', indo: 'Akibat / Konsekuensi', category: 'academic', level: 'ahli' },
  { eng: 'Perspective', indo: 'Sudut pandang', category: 'academic', level: 'ahli' },
  { eng: 'Innovation', indo: 'Inovasi / Pembaruan', category: 'tech', level: 'ahli' },
];

interface GrammarTemplate {
  q: string;
  options: string[];
  answer: number;
  level: 'pemula' | 'menengah' | 'mahir' | 'ahli';
  explanation: string;
}

const GRAMMAR_QUESTIONS: GrammarTemplate[] = [
  // Pemula (To be, Pronouns, Simple Present, Articles, Do/Does)
  { q: 'She ___ a diligent student at SMP Negeri 1.', options: ['is', 'are', 'am', 'be'], answer: 0, level: 'pemula', explanation: 'Subjek tunggal "She" menggunakan to be "is" pada Simple Present Tense.' },
  { q: 'They ___ playing football in the schoolyard right now.', options: ['are', 'is', 'am', 'was'], answer: 0, level: 'pemula', explanation: 'Subjek jamak "They" berpasangan dengan to be "are".' },
  { q: 'I ___ very happy to meet my new classmates today.', options: ['am', 'is', 'are', 'were'], answer: 0, level: 'pemula', explanation: 'Subjek "I" dalam bentuk sekarang menggunakan "am".' },
  { q: '___ you have an English dictionary in your bag?', options: ['Do', 'Does', 'Is', 'Are'], answer: 0, level: 'pemula', explanation: 'Kalimat tanya verbal dengan subjek "you" menggunakan kata bantu "Do".' },
  { q: '___ your brother like reading science books?', options: ['Does', 'Do', 'Is', 'Have'], answer: 0, level: 'pemula', explanation: '"Your brother" adalah subjek tunggal (he), sehingga menggunakan "Does".' },
  { q: 'My father ___ to his office every morning by motorcycle.', options: ['goes', 'go', 'going', 'went'], answer: 0, level: 'pemula', explanation: 'Subjek tunggal "My father" (he) dalam kebiasaan rutin menggunakan V1+es ("goes").' },
  { q: 'We ___ not go to school on Sundays.', options: ['do', 'does', 'is', 'are'], answer: 0, level: 'pemula', explanation: 'Subjek "We" menggunakan "do not" untuk kalimat negatif Simple Present.' },
  { q: 'This is my book. The book is ___.', options: ['mine', 'my', 'me', 'I'], answer: 0, level: 'pemula', explanation: 'Possessive pronoun untuk "my" di akhir kalimat tanpa kata benda adalah "mine".' },
  { q: 'Rina has a cat. ___ fur is very soft and white.', options: ['Its', 'It', 'His', 'Her'], answer: 0, level: 'pemula', explanation: 'Kata ganti kepemilikan untuk benda/hewan tunggal adalah "Its".' },
  { q: 'There is ___ apple on the dining table.', options: ['an', 'a', 'the', 'many'], answer: 0, level: 'pemula', explanation: 'Kata "apple" diawali bunyi vokal, sehingga menggunakan artikel "an".' },
  { q: 'How ___ books are there in your backpack?', options: ['many', 'much', 'long', 'often'], answer: 0, level: 'pemula', explanation: '"Books" adalah kata benda dapat dihitung (countable noun), jadi memakai "many".' },
  { q: 'How ___ water do you drink every day?', options: ['much', 'many', 'few', 'several'], answer: 0, level: 'pemula', explanation: '"Water" adalah uncountable noun, sehingga menggunakan "much".' },

  // Menengah (Past Tense, Present Continuous, Comparative, Superlative, Modals, Future)
  { q: 'Yesterday, my family and I ___ our grandparents in Bandung.', options: ['visited', 'visit', 'visiting', 'visits'], answer: 0, level: 'menengah', explanation: 'Keterangan waktu "Yesterday" menunjukkan Simple Past Tense (V2: visited).' },
  { q: 'Budi ___ not come to the study group last night because it rained heavily.', options: ['did', 'do', 'does', 'was'], answer: 0, level: 'menengah', explanation: 'Kalimat negatif Simple Past Tense ("last night") menggunakan kata bantu "did".' },
  { q: 'Look! The students ___ an experiment in the science laboratory.', options: ['are doing', 'do', 'did', 'is doing'], answer: 0, level: 'menengah', explanation: 'Kata seru "Look!" menandakan kejadian sedang berlangsung (Present Continuous: are + V-ing).' },
  { q: 'An elephant is ___ than a horse.', options: ['bigger', 'big', 'biggest', 'more big'], answer: 0, level: 'menengah', explanation: 'Perbandingan dua hal ("than") dengan kata sifat 1 suku kata menggunakan akhiran "-er" (bigger).' },
  { q: 'Mathematics is one of the ___ subjects for logic training.', options: ['most interesting', 'more interesting', 'interestingest', 'interestinger'], answer: 0, level: 'menengah', explanation: 'Bentuk superlative untuk kata sifat panjang (3+ suku kata) menggunakan "most".' },
  { q: 'While I ___ my homework, the electricity suddenly went out.', options: ['was doing', 'did', 'am doing', 'do'], answer: 0, level: 'menengah', explanation: 'Kejadian yang sedang berlangsung di masa lampau saat kejadian lain menyela menggunakan Past Continuous (was + V-ing).' },
  { q: 'You ___ wear a helmet when riding a motorcycle for your safety.', options: ['must', 'may', 'might', 'would'], answer: 0, level: 'menengah', explanation: '"Must" menyatakan keharusan/kewajiban demi keselamatan.' },
  { q: 'We ___ going to plant mangrove trees at the beach next Saturday.', options: ['are', 'will', 'is', 'have'], answer: 0, level: 'menengah', explanation: 'Pola rencana masa depan dengan "going to" untuk subjek "We" memerlukan to be "are".' },
  { q: '___ did you buy this English novel? I bought it at Gramedia bookstore.', options: ['Where', 'When', 'Who', 'Why'], answer: 0, level: 'menengah', explanation: 'Jawaban berupa nama tempat ("at Gramedia bookstore") ditanyakan dengan "Where".' },
  { q: 'She has lived in Yogyakarta ___ five years.', options: ['for', 'since', 'during', 'from'], answer: 0, level: 'menengah', explanation: 'Untuk durasi waktu ("five years") pada Present Perfect Tense digunakan preposisi "for".' },

  // Mahir (Passive Voice, Conditional Sentences, Present Perfect, Relative Clauses)
  { q: 'Borobudur Temple ___ by thousands of domestic and foreign tourists every year.', options: ['is visited', 'visits', 'visited', 'was visiting'], answer: 0, level: 'mahir', explanation: 'Kalimat pasif (Passive Voice) dalam Simple Present ("every year") berpola: is/am/are + V3 (is visited).' },
  { q: 'The Proclamation of Indonesian Independence ___ by Soekarno and Hatta on August 17, 1945.', options: ['was read', 'is read', 'read', 'has read'], answer: 0, level: 'mahir', explanation: 'Kalimat pasif masa lampau ("on August 17, 1945") menggunakan was/were + V3 (was read).' },
  { q: 'If we study hard and consistently, we ___ pass the final examination with flying colors.', options: ['will', 'would', 'would have', 'had'], answer: 0, level: 'mahir', explanation: 'Conditional Sentence Type 1: If + Simple Present, Subject + will + V1.' },
  { q: 'If I ___ wings like an eagle, I would fly across the Indonesian archipelago.', options: ['had', 'have', 'has', 'having'], answer: 0, level: 'mahir', explanation: 'Conditional Sentence Type 2 (pengandaian tidak nyata saat ini): If + Simple Past (had), would + V1.' },
  { q: 'The scientist ___ discovered penicillin was Alexander Fleming.', options: ['who', 'which', 'whom', 'whose'], answer: 0, level: 'mahir', explanation: 'Relative pronoun untuk menggantikan subjek orang ("The scientist") adalah "who".' },
  { q: 'My sister ___ her assignment before mother asked her to have dinner.', options: ['had finished', 'has finished', 'finishes', 'is finishing'], answer: 0, level: 'mahir', explanation: 'Kejadian yang sudah selesai sebelum kejadian lain di masa lampau menggunakan Past Perfect (had + V3).' },
  { q: 'Neither the teacher nor the students ___ aware of the schedule change yesterday.', options: ['were', 'was', 'is', 'are'], answer: 0, level: 'mahir', explanation: 'Dalam pola "Neither ... nor ...", kata kerja mengikuti subjek terdekat ("the students" = jamak lampau -> were).' },
  { q: 'She asked me where I ___ my school laptop the previous day.', options: ['had put', 'put', 'have put', 'am putting'], answer: 0, level: 'mahir', explanation: 'Indirect speech (kalimat tidak langsung) dari Past Tense berubah menjadi Past Perfect ("had put").' },

  // Ahli (TOEFL Junior, HOTS Grammar, Subjunctive, Inversion, Complex Clauses)
  { q: 'Had the team prepared the presentation more thoroughly, they ___ the national innovation award.', options: ['would have won', 'will win', 'would win', 'won'], answer: 0, level: 'ahli', explanation: 'Inversi Conditional Type 3 ("Had + S + V3") berpasangan dengan "would have + V3".' },
  { q: 'Not only ___ fluent in English, but she also masters Japanese and Mandarin.', options: ['is she', 'she is', 'does she', 'she does'], answer: 0, level: 'ahli', explanation: 'Kalimat yang diawali "Not only" mengalami inversi (kata bantu mendahului subjek: "is she").' },
  { q: 'The principal suggested that every student ___ active part in environmental conservation.', options: ['take', 'takes', 'took', 'taking'], answer: 0, level: 'ahli', explanation: 'Subjunctive mood setelah kata kerja "suggested that" selalu menggunakan bare infinitive (V1 dasar tanpa -s: "take").' },
  { q: 'Despite ___ limited facilities, the rural school students succeeded in building a solar robot.', options: ['having', 'have', 'they have', 'had'], answer: 0, level: 'ahli', explanation: 'Preposisi "Despite" harus diikuti oleh noun phrase atau gerund (V-ing: "having").' },
  { q: 'The number of digital startups in Indonesia ___ rapidly over the past decade.', options: ['has increased', 'have increased', 'are increasing', 'were increasing'], answer: 0, level: 'ahli', explanation: 'Frasa "The number of..." selalu dihitung sebagai subjek tunggal, sehingga menggunakan "has increased".' },
];

interface ReadingTemplate {
  story: string;
  q: string;
  options: string[];
  answer: number;
  level: 'pemula' | 'menengah' | 'mahir' | 'ahli';
}

const READING_PASSAGES: ReadingTemplate[] = [
  // Pemula
  {
    story: 'My name is Ani. I am thirteen years old. I study at SMP Nusantara in Grade 7. Every morning, I ride my bicycle to school with my best friend, Siti.',
    q: 'Based on the text, how does Ani go to school every morning?',
    options: ['By bicycle', 'By bus', 'On foot', 'By car'],
    answer: 0,
    level: 'pemula',
  },
  {
    story: 'My name is Ani. I am thirteen years old. I study at SMP Nusantara in Grade 7. Every morning, I ride my bicycle to school with my best friend, Siti.',
    q: 'How old is Ani according to the passage?',
    options: ['13 years old', '12 years old', '14 years old', '15 years old'],
    answer: 0,
    level: 'pemula',
  },
  {
    story: 'Mr. Budi is our school librarian. He is very friendly and helpful. Every break time, many students visit the library to borrow storybooks and science encyclopedias.',
    q: 'Where does Mr. Budi work?',
    options: ['In the school library', 'In the canteen', 'In the laboratory', 'In the hospital'],
    answer: 0,
    level: 'pemula',
  },
  {
    story: 'Raka loves gardening. In his backyard, he plants red roses, yellow sunflowers, and green spinach. He waters his plants every morning and afternoon.',
    q: 'When does Raka water his plants?',
    options: ['Every morning and afternoon', 'Only on Sundays', 'Every night', 'Once a week'],
    answer: 0,
    level: 'pemula',
  },

  // Menengah
  {
    story: 'Komodo dragons are the largest living lizards in the world. They live on several Indonesian islands, such as Komodo, Rinca, and Flores. Adult Komodo dragons can grow up to 3 meters long and weigh around 70 kilograms.',
    q: 'What is the main topic of the text above?',
    options: ['Komodo dragons and their characteristics', 'How to travel to Flores Island', 'The history of Indonesian islands', 'Types of small pets at home'],
    answer: 0,
    level: 'menengah',
  },
  {
    story: 'Last Sunday, Class 8A organized a beach clean-up at Parangtritis. Thirty students collected plastic bottles and wrappers for three hours. Afterward, they sorted the waste for recycling.',
    q: 'Why did the students sort the plastic waste after collecting it?',
    options: ['To recycle the waste properly', 'To throw it back into the sea', 'To sell tickets to tourists', 'To play games on the sand'],
    answer: 0,
    level: 'menengah',
  },
  {
    story: 'Announcement: To celebrate National Education Day, the Student Council will hold an English Storytelling Competition on May 2nd in the school hall. Registration is free and open until April 28th.',
    q: 'When is the deadline for the competition registration?',
    options: ['April 28th', 'May 2nd', 'May 10th', 'April 1st'],
    answer: 0,
    level: 'menengah',
  },

  // Mahir & Ahli
  {
    story: 'Mangrove forests play a crucial role in protecting coastal areas from erosion and tsunami waves. Moreover, their complex root systems serve as breeding grounds for various marine species while absorbing up to four times more carbon dioxide than tropical rainforests.',
    q: 'According to the passage, why are mangrove forests vital for climate change mitigation?',
    options: [
      'They absorb up to four times more carbon dioxide than tropical rainforests',
      'They produce plastic materials for coastal villages',
      'They increase the height of ocean waves during storms',
      'They replace all coral reefs in the deep ocean',
    ],
    answer: 0,
    level: 'mahir',
  },
  {
    story: 'Digital literacy is no longer optional in the 21st century. Beyond operating software, it requires critical thinking to verify information sources, recognize algorithmic bias, and maintain ethical behavior in digital spaces.',
    q: 'What can be inferred about "digital literacy" from the text?',
    options: [
      'It encompasses critical thinking and ethical judgment, not just technical skills',
      'It only means knowing how to type fast on a computer keyboard',
      'It is only required for professional software programmers',
      'It discourages students from using the internet for research',
    ],
    answer: 0,
    level: 'ahli',
  },
];

/**
 * Generates 800+ structured English questions across classes and levels
 */
export function generateEnglishQuestionBank(): AdaptiveQuestion[] {
  const results: AdaptiveQuestion[] = [];
  const classes = ['sd', 'kelas7', 'kelas8', 'kelas9', 'sma', 'umum'];

  // 1. Auto-generate multiple template variations from VOCAB_DICTIONARY
  VOCAB_DICTIONARY.forEach((item, idx) => {
    const otherItems = VOCAB_DICTIONARY.filter((v) => v.eng !== item.eng);
    const d1 = otherItems[(idx + 3) % otherItems.length];
    const d2 = otherItems[(idx + 7) % otherItems.length];
    const d3 = otherItems[(idx + 13) % otherItems.length];

    classes.forEach((cls) => {
      // Template A: English to Indonesian
      results.push({
        id: `${cls}-en-v1-${idx}`,
        q: `What is the meaning of "${item.eng}" in Indonesian?`,
        options: [item.indo, d1.indo, d2.indo, d3.indo],
        answer: 0,
        type: 'vocab',
        level: item.level,
        subject: 'inggris',
        classKey: cls,
        explanation: `"${item.eng}" dalam bahasa Indonesia berarti "${item.indo}" (kategori: ${item.category}).`,
      });

      // Template B: Indonesian to English
      results.push({
        id: `${cls}-en-v2-${idx}`,
        q: `How do you say "${item.indo}" in English?`,
        options: [item.eng, d1.eng, d2.eng, d3.eng],
        answer: 0,
        type: 'translate',
        level: item.level,
        subject: 'inggris',
        classKey: cls,
        explanation: `Bahasa Inggris dari "${item.indo}" adalah "${item.eng}".`,
      });
    });
  });

  // 2. Add Grammar Questions across classes
  GRAMMAR_QUESTIONS.forEach((g, idx) => {
    classes.forEach((cls) => {
      results.push({
        id: `${cls}-en-g-${idx}`,
        q: g.q,
        options: [...g.options],
        answer: g.answer,
        type: 'grammar',
        level: g.level,
        subject: 'inggris',
        classKey: cls,
        explanation: g.explanation,
      });
    });
  });

  // 3. Add Reading Passages across classes
  READING_PASSAGES.forEach((r, idx) => {
    classes.forEach((cls) => {
      results.push({
        id: `${cls}-en-r-${idx}`,
        q: `Read the text: "${r.story}"\n\nQuestion: ${r.q}`,
        options: [...r.options],
        answer: r.answer,
        type: 'reading',
        level: r.level,
        subject: 'inggris',
        classKey: cls,
        story: r.story,
        explanation: 'Jawaban dapat ditemukan langsung dari informasi utama pada teks bacaan di atas.',
      });
    });
  });

  return results;
}

export const QUESTION_BANK_INGGRIS: AdaptiveQuestion[] = generateEnglishQuestionBank();
