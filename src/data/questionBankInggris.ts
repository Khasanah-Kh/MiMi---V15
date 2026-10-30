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

const SD_LOWER_INGGRIS: Omit<AdaptiveQuestion, 'id' | 'classKey' | 'subject'>[] = [
  {
    q: 'Bahasa Inggris dari angka "Tujuh" (7) adalah...',
    options: ['Seven', 'Six', 'Eight', 'Nine'],
    answer: 0,
    type: 'numbers',
    level: 'pemula',
    explanation: 'Seven artinya tujuh (7). Six = 6, Eight = 8, Nine = 9.',
  },
  {
    q: 'Saat bertemu guru di pagi hari, kita menyapa dengan ucapan...',
    options: ['Good morning', 'Good night', 'Goodbye', 'Good evening'],
    answer: 0,
    type: 'greetings',
    level: 'pemula',
    explanation: '"Good morning" digunakan untuk menyapa selamat pagi.',
  },
  {
    q: 'What color is a ripe banana (pisang matang)? It is...',
    options: ['Yellow (Kuning)', 'Blue (Biru)', 'Purple (Ungu)', 'Black (Hitam)'],
    answer: 0,
    type: 'colors',
    level: 'pemula',
    explanation: 'Pisang matang berwarna kuning (Yellow).',
  },
  {
    q: 'Bahasa Inggris dari "Ibu" dan "Ayah" adalah...',
    options: ['Mother and Father', 'Sister and Brother', 'Uncle and Aunt', 'Boy and Girl'],
    answer: 0,
    type: 'family',
    level: 'pemula',
    explanation: 'Mother artinya Ibu dan Father artinya Ayah.',
  },
  {
    q: 'What is the meaning of "Red Apple" in Indonesian?',
    options: ['Apel merah', 'Jeruk kuning', 'Pisang hijau', 'Anggur ungu'],
    answer: 0,
    type: 'vocab',
    level: 'menengah',
    explanation: 'Red = merah, Apple = apel, sehingga Red Apple artinya apel merah.',
  },
  {
    q: 'After number nine (9) is number...',
    options: ['Ten (10)', 'Eight (8)', 'Seven (7)', 'Five (5)'],
    answer: 0,
    type: 'numbers',
    level: 'menengah',
    explanation: 'Setelah angka sembilan (nine) adalah sepuluh (ten).',
  },
  {
    q: 'Saat hendak tidur di malam hari, kita mengucapkan...',
    options: ['Good night', 'Good morning', 'Good afternoon', 'Hello'],
    answer: 0,
    type: 'greetings',
    level: 'mahir',
    explanation: '"Good night" diucapkan saat berpamitan hendak tidur di malam hari.',
  },
  {
    q: 'How do you say "Buku dan Pensil" in English?',
    options: ['Book and Pencil', 'Table and Chair', 'Bag and Shoes', 'Door and Window'],
    answer: 0,
    type: 'school',
    level: 'ahli',
    explanation: 'Book = Buku, Pencil = Pensil.',
  },
];

// Khusus SD Kelas 4-6: Demonstratives (This is, That is, These are, Those are) & Vocab Hewan
const SD_UPPER_INGGRIS: Omit<AdaptiveQuestion, 'id' | 'classKey' | 'subject'>[] = [
  {
    q: '___ is a book on my desk (benda tunggal dekat).',
    options: ['This', 'Those', 'These', 'Are'],
    answer: 0,
    type: 'demonstrative',
    level: 'pemula',
    explanation: 'Untuk menunjuk 1 benda yang dekat dengan kita digunakan "This is...".',
  },
  {
    q: 'Look at the sky! ___ is a bird flying high (benda tunggal jauh).',
    options: ['That', 'This', 'These', 'Those'],
    answer: 0,
    type: 'demonstrative',
    level: 'pemula',
    explanation: 'Untuk menunjuk 1 benda/hewan yang jauh digunakan "That is...".',
  },
  {
    q: 'What animal has a very long neck and eats leaves from tall trees? (Hewan berleher panjang)',
    options: ['Giraffe (Jerapah)', 'Rabbit (Kelinci)', 'Cat (Kucing)', 'Fish (Ikan)'],
    answer: 0,
    type: 'animals',
    level: 'pemula',
    explanation: 'Giraffe (jerapah) adalah hewan dengan leher yang sangat panjang.',
  },
  {
    q: 'An ___ is a very big animal with a long trunk (belalai) and large ears.',
    options: ['Elephant (Gajah)', 'Mouse (Tikus)', 'Chicken (Ayam)', 'Frog (Katak)'],
    answer: 0,
    type: 'animals',
    level: 'pemula',
    explanation: 'Elephant (gajah) memiliki tubuh besar dan belalai panjang.',
  },
  {
    q: '___ are my new storybooks on this table (jamak & dekat).',
    options: ['These', 'This', 'That', 'Is'],
    answer: 0,
    type: 'demonstrative',
    level: 'menengah',
    explanation: 'Untuk benda lebih dari satu (jamak) dan dekat, gunakan "These are...".',
  },
  {
    q: 'Look over there! ___ are monkeys climbing the coconut tree (jamak & jauh).',
    options: ['Those', 'This', 'That', 'These'],
    answer: 0,
    type: 'demonstrative',
    level: 'menengah',
    explanation: 'Untuk benda/hewan jamak yang letaknya jauh, gunakan "Those are...".',
  },
  {
    q: 'The king of the jungle that can roar loudly is a...',
    options: ['Lion (Singa)', 'Duck (Bebek)', 'Butterfly (Kupu-kupu)', 'Sheep (Domba)'],
    answer: 0,
    type: 'animals',
    level: 'menengah',
    explanation: 'Lion (singa) dikenal sebagai raja hutan yang mengaum keras.',
  },
  {
    q: 'A ___ likes eating carrots and can hop very fast.',
    options: ['Rabbit (Kelinci)', 'Snake (Ular)', 'Cow (Sapi)', 'Crocodile (Buaya)'],
    answer: 0,
    type: 'animals',
    level: 'mahir',
    explanation: 'Rabbit (kelinci) suka makan wortel dan melompat cepat.',
  },
  {
    q: 'Is that a tiger? No, it ___ not. It is a cat.',
    options: ['is', 'are', 'am', 'do'],
    answer: 0,
    type: 'demonstrative',
    level: 'mahir',
    explanation: 'Jawaban pendek untuk "Is that..." adalah "No, it is not (isn\'t)".',
  },
  {
    q: 'Read the short text: "Rani has a pet. It is a white rabbit. Its name is Snowy. It likes eating fresh carrots." What animal is Snowy?',
    options: ['A white rabbit (Kelinci putih)', 'A black cat (Kucing hitam)', 'A yellow bird (Burung kuning)', 'A brown dog (Anjing cokelat)'],
    answer: 0,
    type: 'reading',
    level: 'ahli',
    explanation: 'Pada teks disebutkan "It is a white rabbit. Its name is Snowy."',
  },
];

// Khusus SMP Kelas 7: Simple Present Tense, Descriptive Text, Pronouns, Schedule
const SMP_KELAS7_INGGRIS: Omit<AdaptiveQuestion, 'id' | 'classKey' | 'subject'>[] = [
  {
    q: 'She ___ a diligent student at SMP Negeri 1.',
    options: ['is', 'are', 'am', 'be'],
    answer: 0,
    type: 'grammar',
    level: 'pemula',
    explanation: 'Subjek tunggal "She" menggunakan to be "is" pada Simple Present Tense.',
  },
  {
    q: 'My father ___ to his office every morning by motorcycle.',
    options: ['goes', 'go', 'going', 'went'],
    answer: 0,
    type: 'grammar',
    level: 'pemula',
    explanation: 'Subjek tunggal "My father" (he) dalam kebiasaan rutin menggunakan V1+es ("goes").',
  },
  {
    q: '___ your brother like reading science books in the library?',
    options: ['Does', 'Do', 'Is', 'Have'],
    answer: 0,
    type: 'grammar',
    level: 'menengah',
    explanation: '"Your brother" adalah subjek tunggal (he), sehingga menggunakan kata bantu "Does".',
  },
  {
    q: 'We ___ not have an English class on Fridays.',
    options: ['do', 'does', 'are', 'is'],
    answer: 0,
    type: 'grammar',
    level: 'menengah',
    explanation: 'Subjek jamak "We" menggunakan "do not" pada kalimat negatif Simple Present Tense.',
  },
  {
    q: 'Rina has a Persian cat. ___ fur is very soft and clean.',
    options: ['Its', 'It', 'His', 'They'],
    answer: 0,
    type: 'pronoun',
    level: 'menengah',
    explanation: 'Kata ganti kepemilikan (possessive adjective) untuk hewan tunggal adalah "Its".',
  },
  {
    q: 'Read the Descriptive Text: "Mr. Arman is our science teacher. He is tall and wears glasses. He always explains physics experiments patiently." What is Mr. Arman like?',
    options: ['He is patient and helpful', 'He is lazy and rude', 'He is a mathematics student', 'He never wears glasses'],
    answer: 0,
    type: 'reading',
    level: 'mahir',
    explanation: 'Teks mendeskripsikan bahwa Mr. Arman menjelaskan eksperimen dengan sabar (patiently).',
  },
  {
    q: 'How ___ students are there in the computer laboratory right now?',
    options: ['many', 'much', 'long', 'little'],
    answer: 0,
    type: 'grammar',
    level: 'mahir',
    explanation: '"Students" adalah countable noun jamak, sehingga menggunakan "How many".',
  },
  {
    q: 'The school library opens at 07.30 a.m. How do we say 07.30 in English?',
    options: ['Half past seven', 'Quarter past seven', 'Quarter to eight', 'Seven o\'clock'],
    answer: 0,
    type: 'time',
    level: 'ahli',
    explanation: 'Pukul 07.30 (lewat 30 menit) dalam Bahasa Inggris disebut "Half past seven".',
  },
];

// Khusus SMP Kelas 8: WAJIB Simple Past, Present Perfect, Passive Voice, Recount Text, Comparative (BUKAN materi SD "This is a book"!)
const SMP_KELAS8_INGGRIS: Omit<AdaptiveQuestion, 'id' | 'classKey' | 'subject'>[] = [
  {
    q: '[Simple Past Tense] Yesterday, my family and I ___ our grandparents in Bandung.',
    options: ['visited', 'visit', 'visiting', 'visits'],
    answer: 0,
    type: 'simplePast',
    level: 'pemula',
    explanation: 'Keterangan waktu "Yesterday" menandakan Simple Past Tense, sehingga memakai Verb 2 ("visited").',
  },
  {
    q: '[Simple Past Tense] Budi ___ not come to the study club last night because it rained heavily.',
    options: ['did', 'do', 'does', 'was'],
    answer: 0,
    type: 'simplePast',
    level: 'pemula',
    explanation: 'Kalimat negatif Simple Past Tense ("last night") menggunakan kata bantu "did not + V1".',
  },
  {
    q: '[Simple Past Tense] Last month, our school team ___ the first prize in the National Robotics Competition.',
    options: ['won', 'win', 'wins', 'winning'],
    answer: 0,
    type: 'simplePast',
    level: 'pemula',
    explanation: 'Bentuk Verb 2 (irregular verb) dari "win" untuk kejadian lampau ("Last month") adalah "won".',
  },
  {
    q: '[Present Perfect Tense] She ___ lived in Yogyakarta for five years.',
    options: ['has', 'have', 'is', 'was'],
    answer: 0,
    type: 'presentPerfect',
    level: 'menengah',
    explanation: 'Present Perfect Tense dengan subjek tunggal "She" dan keterangan durasi "for five years" berpola "has + V3 (lived)".',
  },
  {
    q: '[Present Perfect Tense] The students ___ just finished their science project in the laboratory.',
    options: ['have', 'has', 'are', 'were'],
    answer: 0,
    type: 'presentPerfect',
    level: 'menengah',
    explanation: 'Subjek jamak "The students" pada Present Perfect Tense menggunakan "have + V3 (finished)".',
  },
  {
    q: '[Present Perfect Tense] I have known my best friend, Nadia, ___ we were in Grade 7.',
    options: ['since', 'for', 'ago', 'yesterday'],
    answer: 0,
    type: 'presentPerfect',
    level: 'menengah',
    explanation: '"Since" digunakan pada Present Perfect Tense untuk menunjukkan titik awal waktu di masa lampau ("since we were in Grade 7").',
  },
  {
    q: '[Passive Voice] Borobudur Temple ___ by thousands of domestic and international tourists every year.',
    options: ['is visited', 'visits', 'visited', 'was visiting'],
    answer: 0,
    type: 'passiveVoice',
    level: 'mahir',
    explanation: 'Kalimat pasif (Passive Voice) dalam Simple Present ("every year") menggunakan rumus: is/am/are + Verb 3 ("is visited").',
  },
  {
    q: '[Passive Voice] The Proclamation of Indonesian Independence ___ by Soekarno and Hatta on August 17, 1945.',
    options: ['was read', 'is read', 'reads', 'has read'],
    answer: 0,
    type: 'passiveVoice',
    level: 'mahir',
    explanation: 'Kalimat pasif masa lampau ("on August 17, 1945") menggunakan rumus: was/were + Verb 3 ("was read").',
  },
  {
    q: '[Passive Voice] Two new science laboratories ___ built in our school two months ago.',
    options: ['were', 'was', 'are', 'have'],
    answer: 0,
    type: 'passiveVoice',
    level: 'mahir',
    explanation: 'Subjek jamak "Two new science laboratories" di masa lampau ("two months ago") memakai "were + V3 (built)".',
  },
  {
    q: '[Past Continuous & Simple Past] While I ___ my English assignment last night, the electricity suddenly went out.',
    options: ['was doing', 'did', 'am doing', 'have done'],
    answer: 0,
    type: 'pastContinuous',
    level: 'ahli',
    explanation: 'Kejadian yang sedang berlangsung di masa lampau saat disela kejadian lain menggunakan Past Continuous ("was doing").',
  },
  {
    q: '[Recount Text] Read the text: "Last Sunday, Class 8A organized a beach clean-up at Parangtritis. Thirty students collected plastic waste for three hours and sorted it for recycling." What tense is mostly used in the text?',
    options: ['Simple Past Tense', 'Simple Future Tense', 'Present Continuous Tense', 'Imperative Mood'],
    answer: 0,
    type: 'recountText',
    level: 'ahli',
    explanation: 'Recount Text menceritakan pengalaman masa lampau ("Last Sunday") menggunakan Simple Past Tense (organized, collected, sorted).',
  },
  {
    q: '[Active to Passive Transformation] Active: "Alexander Graham Bell invented the telephone in 1876." What is the correct Passive Voice form?',
    options: [
      'The telephone was invented by Alexander Graham Bell in 1876.',
      'The telephone is invented by Alexander Graham Bell in 1876.',
      'The telephone has invented Alexander Graham Bell in 1876.',
      'Alexander Graham Bell was invented by the telephone in 1876.',
    ],
    answer: 0,
    type: 'passiveVoice',
    level: 'ahli',
    explanation: 'Objek "The telephone" menjadi subjek pasif lampau diikuti "was + V3 (invented) + by...".',
  },
];

// Khusus SMP Kelas 9: Passive Voice Lintas Tenses, Report Text, Narrative Text, Conditional Type 1, Past Perfect
const SMP_KELAS9_INGGRIS: Omit<AdaptiveQuestion, 'id' | 'classKey' | 'subject'>[] = [
  {
    q: '[Passive Voice] Indonesian Batik ___ recognized by UNESCO as a Masterpiece of Oral and Intangible Heritage of Humanity.',
    options: ['has been', 'have been', 'was being', 'is being'],
    answer: 0,
    type: 'passivePerfect',
    level: 'pemula',
    explanation: 'Present Perfect Passive untuk subjek tunggal "Indonesian Batik" menggunakan "has been + V3".',
  },
  {
    q: '[Conditional Type 1] If we study hard and consistently, we ___ pass the final national exam with flying colors.',
    options: ['will', 'would', 'would have', 'had'],
    answer: 0,
    type: 'conditional',
    level: 'menengah',
    explanation: 'Conditional Sentence Type 1 berpola: If + Simple Present, Subject + will + V1.',
  },
  {
    q: '[Past Perfect] My sister ___ her homework before our mother asked her to have dinner last night.',
    options: ['had finished', 'has finished', 'finishes', 'is finishing'],
    answer: 0,
    type: 'pastPerfect',
    level: 'mahir',
    explanation: 'Aksi yang sudah tuntas sebelum aksi lain di masa lampau menggunakan Past Perfect ("had + V3").',
  },
  {
    q: '[Report Text] Read the text: "Mangrove forests protect coastal areas from erosion and absorb four times more carbon dioxide than tropical rainforests." Why are mangroves vital for climate mitigation?',
    options: [
      'They absorb up to four times more carbon dioxide than tropical rainforests',
      'They produce plastic waste in coastal villages',
      'They replace all coral reefs in the deep ocean',
      'They increase coastal erosion during storms',
    ],
    answer: 0,
    type: 'reportText',
    level: 'ahli',
    explanation: 'Sesuai Report Text di atas, hutan mangrove menyerap CO2 hingga 4 kali lebih banyak dibanding hutan hujan tropis.',
  },
];

// Khusus SMA / SMK Kelas 10-12: Conditional Type 2 & 3, Subjunctive, Inversion, Reported Speech, Academic Reading
const SMA_SMK_INGGRIS: Omit<AdaptiveQuestion, 'id' | 'classKey' | 'subject'>[] = [
  {
    q: '[Conditional Type 2] If I ___ wings like an eagle, I would fly across the Indonesian archipelago.',
    options: ['had', 'have', 'has', 'having'],
    answer: 0,
    type: 'conditional2',
    level: 'pemula',
    explanation: 'Conditional Sentence Type 2 (pengandaian tak nyata saat ini): If + Simple Past (had), would + V1.',
  },
  {
    q: '[Reported Speech] Direct: Raka said, "I am building a web application." Indirect: Raka said that he ___ a web application.',
    options: ['was building', 'is building', 'has built', 'will build'],
    answer: 0,
    type: 'reportedSpeech',
    level: 'menengah',
    explanation: 'Dalam Indirect Speech, Present Continuous ("am building") mundur satu tense menjadi Past Continuous ("was building").',
  },
  {
    q: '[Relative Clause] The scientist ___ discovered penicillin in 1928 was Alexander Fleming.',
    options: ['who', 'which', 'whom', 'whose'],
    answer: 0,
    type: 'relativeClause',
    level: 'menengah',
    explanation: 'Relative pronoun untuk subjek orang ("The scientist") adalah "who".',
  },
  {
    q: '[Conditional Type 3 Inversion] Had the engineering team prepared the prototype earlier, they ___ the national innovation award.',
    options: ['would have won', 'will win', 'would win', 'won'],
    answer: 0,
    type: 'conditional3',
    level: 'mahir',
    explanation: 'Inversi Conditional Type 3 ("Had + S + V3") berpasangan dengan klausa utama "would have + V3".',
  },
  {
    q: '[Negative Inversion] Not only ___ fluent in English, but she also masters Python and TypeScript.',
    options: ['is she', 'she is', 'does she', 'she does'],
    answer: 0,
    type: 'inversion',
    level: 'mahir',
    explanation: 'Kalimat yang diawali adverbia negatif "Not only" mengalami inversi (auxiliary mendahului subjek: "is she").',
  },
  {
    q: '[Subjunctive Mood] The principal suggested that every student ___ an active part in environmental conservation.',
    options: ['take', 'takes', 'took', 'taking'],
    answer: 0,
    type: 'subjunctive',
    level: 'ahli',
    explanation: 'Subjunctive mood setelah "suggested that" wajib menggunakan bare infinitive (V1 tanpa -s/-es: "take").',
  },
  {
    q: '[Academic Reading] "Digital literacy requires critical thinking to verify information sources, recognize algorithmic bias, and maintain ethical behavior." What can be inferred from the statement?',
    options: [
      'Digital literacy encompasses critical thinking and ethics, not merely technical operation',
      'Digital literacy only means typing fast on a keyboard',
      'Algorithmic bias does not exist in modern software',
      'Students should avoid using digital technology completely',
    ],
    answer: 0,
    type: 'readingHots',
    level: 'ahli',
    explanation: 'Literasi digital mencakup berpikir kritis dan etika, bukan sekadar kemampuan teknis mengoperasikan perangkat.',
  },
  // Additional SMA/SMK Level Pemula (Konsep Dasar SMA/SMK: Passive Voice, Opinion, Direct/Indirect, Conditional Type 1/2 Dasar)
  {
    q: '[Passive Voice Dasar SMA] Many renewable energy projects ___ by young Indonesian engineers every year.',
    options: ['are developed', 'is developed', 'developed', 'developing'],
    answer: 0,
    type: 'passiveSMA',
    level: 'pemula',
    explanation: 'Subjek jamak "Many renewable energy projects" dalam kalimat pasif Simple Present menggunakan "are + V3 (developed)".',
  },
  {
    q: '[Asking & Giving Opinion SMA] "In my view, vocational training is essential for students." The underlined phrase expresses...',
    options: ['Giving an opinion', 'Asking for help', 'Declining an invitation', 'Expressing sympathy'],
    answer: 0,
    type: 'opinionSMA',
    level: 'pemula',
    explanation: '"In my view..." digunakan untuk menyampaikan pendapat (giving an opinion).',
  },
  {
    q: '[Simple Past vs Present Perfect SMA] The research team ___ three prototypes since January.',
    options: ['has built', 'built', 'builds', 'is building'],
    answer: 0,
    type: 'tensesSMA',
    level: 'pemula',
    explanation: 'Penanda waktu "since January" menunjukkan Present Perfect Tense ("has + V3").',
  },
  {
    q: '[Cause & Effect SMA] Due to ___ heavy rain, the outdoor robotics competition was rescheduled.',
    options: ['the', 'because', 'since', 'although'],
    answer: 0,
    type: 'causeEffectSMA',
    level: 'menengah',
    explanation: 'Setelah "Due to" diikuti oleh noun phrase ("the heavy rain").',
  },
  {
    q: '[Analytical Exposition SMA] In an analytical exposition text, the section that restates the writer’s position at the end is called...',
    options: ['Reiteration', 'Thesis', 'Orientation', 'Complication'],
    answer: 0,
    type: 'expositionSMA',
    level: 'menengah',
    explanation: 'Struktur Analytical Exposition terdiri dari Thesis, Arguments, dan Reiteration (penegasan ulang).',
  },
  {
    q: '[Application Letter SMA/SMK] "I am writing to apply for the Junior Web Developer position advertised on your company portal." This sentence belongs to the ___ of a job application letter.',
    options: ['Opening paragraph', 'Closing salutation', 'Postscript', 'Bibliography'],
    answer: 0,
    type: 'applicationLetter',
    level: 'mahir',
    explanation: 'Kalimat tersebut merupakan paragraf pembuka surat lamaran kerja yang menyebutkan posisi yang dilamar.',
  },
  {
    q: '[UTBK/HOTS Reading Inference] "While automation replaces repetitive manual tasks, it simultaneously increases the demand for creative problem-solving." The author implies that...',
    options: [
      'Workers should cultivate creative and analytical problem-solving skills',
      'All human jobs will completely vanish within a week',
      'Repetitive manual tasks require more creativity than engineering',
      'Automation decreases the need for problem-solving',
    ],
    answer: 0,
    type: 'hotsReadingSMA',
    level: 'ahli',
    explanation: 'Karena otomatisasi meningkatkan kebutuhan akan pemecahan masalah kreatif, pekerja perlu mengasah keterampilan tersebut.',
  },
];

const UMUM_ADULT_INGGRIS: Omit<AdaptiveQuestion, 'id' | 'classKey' | 'subject'>[] = [
  {
    q: '[Daily Conversation Umum] When someone says "Let’s call it a day", what do they mean?',
    options: [
      'Mari kita akhiri pekerjaan/kegiatan hari ini untuk beristirahat',
      'Mari kita memberi nama hari ini di kalender',
      'Mari kita bekerja lembur sampai besok pagi',
      'Mari kita menelepon seseorang sekarang juga',
    ],
    answer: 0,
    type: 'idiomUmum',
    level: 'pemula',
    explanation: 'Idiom "Call it a day" berarti menghentikan pekerjaan hari ini karena sudah cukup.',
  },
  {
    q: '[Workplace English Umum] "Could you please ___ me in the loop regarding the project schedule?"',
    options: ['keep', 'make', 'take', 'throw'],
    answer: 0,
    type: 'collocationUmum',
    level: 'pemula',
    explanation: '"Keep someone in the loop" berarti terus memberi kabar/informasi terbaru kepada seseorang.',
  },
  {
    q: '[Phrasal Verb Umum] Despite the initial technical glitch, the presentation ___ very well.',
    options: ['went off', 'gave up', 'broke down', 'ran out'],
    answer: 0,
    type: 'phrasalVerbUmum',
    level: 'menengah',
    explanation: '"Go off well" berarti berlangsung atau berjalan dengan sukses.',
  },
  {
    q: '[Professional Email Umum] Which closing phrase is the most appropriate for a formal business email?',
    options: ['Best regards,', 'See ya later,', 'Talk soon bro,', 'Cheers mate,'],
    answer: 0,
    type: 'businessEnglish',
    level: 'menengah',
    explanation: '"Best regards," atau "Sincerely," adalah penutup yang sopan dan profesional dalam email resmi.',
  },
  {
    q: '[Advanced Idiom Umum] The manager decided to "play devil’s advocate" during the brainstorming session. This means she...',
    options: [
      'Presented a counter-argument to test the strength of the team’s idea',
      'Cancelled the entire project without any reason',
      'Agreed with everyone without asking any questions',
      'Left the meeting room immediately',
    ],
    answer: 0,
    type: 'idiomMahirUmum',
    level: 'mahir',
    explanation: '"Play devil’s advocate" berarti sengaja mengajukan argumen pembanding untuk menguji kematangan suatu ide.',
  },
  {
    q: '[TOEFL/IELTS Structure Umum] Scarcely ___ the keynote speaker finished her presentation when the audience gave a standing ovation.',
    options: ['had', 'has', 'did', 'was'],
    answer: 0,
    type: 'inversionAhliUmum',
    level: 'ahli',
    explanation: 'Pola inversi "Scarcely + had + Subject + V3 ... when + Simple Past".',
  },
];

function expandPoolPreservingLevels(
  baseItems: Omit<AdaptiveQuestion, 'id' | 'classKey' | 'subject'>[],
  classKeys: string[]
): AdaptiveQuestion[] {
  const out: AdaptiveQuestion[] = [];

  classKeys.forEach((cls) => {
    baseItems.forEach((item, idx) => {
      out.push({
        id: `${cls}-en-${item.level}-${idx}`,
        q: item.q,
        options: [...item.options],
        answer: item.answer,
        type: item.type,
        level: item.level,
        subject: 'inggris',
        classKey: cls,
        story: item.story,
        explanation: item.explanation,
      });
    });
  });

  return out;
}

export function generateEnglishQuestionBank(): AdaptiveQuestion[] {
  return [
    ...expandPoolPreservingLevels(SD_LOWER_INGGRIS, ['sd1', 'sd2', 'sd3']),
    ...expandPoolPreservingLevels(SD_UPPER_INGGRIS, ['sd4', 'sd5', 'sd6', 'sd']),
    ...expandPoolPreservingLevels(SMP_KELAS7_INGGRIS, ['kelas7']),
    ...expandPoolPreservingLevels(SMP_KELAS8_INGGRIS, ['kelas8']),
    ...expandPoolPreservingLevels([...SMP_KELAS8_INGGRIS, ...SMP_KELAS9_INGGRIS], ['kelas9']),
    ...expandPoolPreservingLevels(SMA_SMK_INGGRIS, ['sma10', 'sma11', 'sma12', 'smk10', 'smk11', 'smk12', 'sma']),
    ...expandPoolPreservingLevels([...UMUM_ADULT_INGGRIS, ...SMA_SMK_INGGRIS], ['umum']),
  ];
}

export const QUESTION_BANK_INGGRIS: AdaptiveQuestion[] = generateEnglishQuestionBank();
