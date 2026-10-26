/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DuelQuestion } from '../types/mimi';

export const DUEL_CYBER_QUESTIONS: DuelQuestion[] = [
  {
    id: 'duel_q1',
    category: 'Cyber Security',
    question: 'Serangan siber dengan mengirim email palsu untuk mencuri kata sandi pengguna disebut...',
    options: ['DDoS Attack', 'Phishing', 'SQL Injection', 'Brute Force'],
    correctIndex: 1,
    explanation: 'Phishing adalah teknik penipuan rekayasa sosial dengan memancing korban membocorkan kredensial penting.',
    timeLimitSec: 10,
  },
  {
    id: 'duel_q2',
    category: 'Logika Pemrograman',
    question: 'Dalam JavaScript/Python, apa hasil dari logika (5 > 3) AND (2 == 4)?',
    options: ['True', 'False', 'Undefined', 'SyntaxError'],
    correctIndex: 1,
    explanation: 'Operator AND memerlukan kedua kondisi bernilai True. Karena (2 == 4) adalah False, hasilnya False.',
    timeLimitSec: 10,
  },
  {
    id: 'duel_q3',
    category: 'Jaringan & Protokol',
    question: 'Protokol transfer web yang menggunakan enkripsi SSL/TLS demi keamanan transaksi adalah...',
    options: ['HTTP (Port 80)', 'HTTPS (Port 443)', 'FTP (Port 21)', 'Telnet (Port 23)'],
    correctIndex: 1,
    explanation: 'HTTPS (Hypertext Transfer Protocol Secure) mengenkripsi lalu lintas data pada port 443.',
    timeLimitSec: 10,
  },
  {
    id: 'duel_q4',
    category: 'Keamanan Data',
    question: 'Tipe malware yang mengunci file korban lalu meminta tebusan uang kripto disebut...',
    options: ['Spyware', 'Adware', 'Ransomware', 'Trojan Horse'],
    correctIndex: 2,
    explanation: 'Ransomware mengenkripsi media penyimpanan dan meminta tebusan (ransom) untuk kunci dekripsinya.',
    timeLimitSec: 10,
  },
  {
    id: 'duel_q5',
    category: 'Algoritma & Struktur Data',
    question: 'Struktur data apa yang menerapkan prinsip LIFO (Last In, First Out)?',
    options: ['Queue (Antrean)', 'Stack (Tumpukan)', 'Array Flat', 'Linked List'],
    correctIndex: 1,
    explanation: 'Stack mengadopsi prinsip LIFO, elemen terakhir yang dimasukkan adalah yang pertama dikeluarkan (pop).',
    timeLimitSec: 10,
  },
  {
    id: 'duel_q6',
    category: 'Cyber Defense',
    question: 'Metode otentikasi yang memverifikasi identitas pengguna menggunakan dua faktor independen disebut...',
    options: ['Single Sign-On', 'Two-Factor Authentication (2FA)', 'Hash Password', 'Tokenized Session'],
    correctIndex: 1,
    explanation: '2FA menggabungkan sesuatu yang Anda tahu (password) dengan sesuatu yang Anda miliki (OTP/authenticator).',
    timeLimitSec: 10,
  },
  {
    id: 'duel_q7',
    category: 'Web Development',
    question: 'Bahasa pemrograman yang dieksekusi secara native di dalam browser web klien adalah...',
    options: ['Python', 'C++', 'JavaScript', 'Java'],
    correctIndex: 2,
    explanation: 'JavaScript adalah bahasa pemrograman standar utama yang dieksekusi langsung oleh engine browser.',
    timeLimitSec: 10,
  },
  {
    id: 'duel_q8',
    category: 'Cyber Forensics',
    question: 'Fungsi satu arah matematika yang mengubah data menjadi string acak berukuran tetap disebut...',
    options: ['Enkripsi Simetris', 'Hashing (cth: SHA-256)', 'Kompresi Zip', 'Transposisi Matrix'],
    correctIndex: 1,
    explanation: 'Fungsi Hash bersifat deterministik satu arah dan tidak dapat dikembalikan (irreversible).',
    timeLimitSec: 10,
  },
  {
    id: 'duel_q9',
    category: 'Logika & Mnemonic Mimi',
    question: 'Trik cepat Mimi: Berapakah nilai biner dari angka desimal 13?',
    options: ['1101', '1011', '1110', '1001'],
    correctIndex: 0,
    explanation: '13 = 8 + 4 + 0 + 1, sehingga representasi binernya adalah 1101.',
    timeLimitSec: 10,
  },
  {
    id: 'duel_q10',
    category: 'Cloud & Database',
    question: 'Database NoSQL dokumen realtime seperti Cloud Firestore menyimpan data dalam bentuk...',
    options: ['Tabel & Baris SQL', 'Koleksi & Dokumen (JSON-like)', 'Graph Edges', 'Binary Flat Blobs'],
    correctIndex: 1,
    explanation: 'Firestore mengorganisir datanya dalam Collection yang berisi Document berisi pasangan key-value.',
    timeLimitSec: 10,
  },
];

/**
 * Returns a randomized set of N questions for each duel match
 */
export function getRandomDuelQuestions(count = 5): DuelQuestion[] {
  const shuffled = [...DUEL_CYBER_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
