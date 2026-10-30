import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  HelpCircle,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  User,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Volume2,
  Loader2,
  MessageCircleHeart,
} from 'lucide-react';
import { BottomNavTab, EducationLevel } from '../types/mimi';
import { chatMimiWithFallback } from '../services/ai';

export type FaqCategory =
  | 'ALL'
  | 'SISTEM_MIMI'
  | 'KURIKULUM'
  | 'TIPS_BELAJAR'
  | 'REQ_MAPEL';

interface FaqItem {
  id: string;
  category: Exclude<FaqCategory, 'ALL'>;
  categoryLabel: string;
  question: string;
  shortAnswer: string;
  aiFollowUpPrompt: string;
}

interface StudentFeedbackItem {
  id: string;
  type: 'SARAN' | 'KRITIK' | 'REQUEST_MAPEL';
  studentName: string;
  message: string;
  createdAt: string;
}

const CURATED_FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-sistem-1',
    category: 'SISTEM_MIMI',
    categoryLabel: 'Sistem Mimi V15',
    question: 'Bagaimana cara kerja sistem belajar, XP, dan Simulasi Interaktif di Mimi V15?',
    shortAnswer:
      'Setiap modul pembelajaran di Mimi V15 dirancang dengan 3 tahapan terukur: (1) Membaca Konsep Inti & Jembatan Keledai (35%), (2) Menjalankan Laboratorium Simulasi Interaktif hingga mencapai nilai target (35%), dan (3) Menjawab Kuis Pemahaman (30%). Saat topik mencapai 100%, kamu memperoleh XP untuk menaikkan Cyber Rank serta menjaga Streak harian.',
    aiFollowUpPrompt:
      'Mimi, jelaskan lebih lengkap bagaimana tips mengumpulkan XP dengan cepat dan cara kerja Simulasi Interaktif di sistem Mimi V15!',
  },
  {
    id: 'faq-sistem-2',
    category: 'SISTEM_MIMI',
    categoryLabel: 'Sistem Mimi V15',
    question: 'Apa bedanya Mode Reguler dengan Mode Mimi Profesor?',
    shortAnswer:
      'Pada Mode Reguler, Mimi menjelaskan materi dengan bahasa santai, akrab, dan bertahap. Sedangkan jika kamu menyalakan Mode Mimi Profesor, Mimi akan memberikan bedah konsep mendalam, rumus cepat (Jembatan Keledai), kisi-kisi ujian nasional/SNBT, serta langkah penyelesaian sistematis.',
    aiFollowUpPrompt:
      'Mimi, kapan waktu terbaik aku harus memakai Mode Mimi Profesor saat belajar mandiri?',
  },
  {
    id: 'faq-kurikulum-1',
    category: 'KURIKULUM',
    categoryLabel: 'Kurikulum Merdeka',
    question: 'Apakah materi di Mimi V15 sudah sesuai dengan Kurikulum Merdeka terbaru (SD, SMP, SMA, SMK & Umum)?',
    shortAnswer:
      'Ya! Seluruh unit modul di Mimi V15 disusun mengikuti Capaian Pembelajaran (CP) Kurikulum Merdeka Kemendikdasmen untuk jenjang SD (Kelas 1–6), SMP (Kelas 7–9), SMA (Kelas 10–12 IPA/IPS), SMK (RPL/PPLG, TKJ, Akuntansi, Bisnis), hingga kategori Umum (UTBK/SNBT, Bahasa Inggris, & Coding).',
    aiFollowUpPrompt:
      'Mimi, jelaskan keunggulan struktur materi Kurikulum Merdeka di Mimi V15 untuk persiapan ujian sekolah dan SNBT!',
  },
  {
    id: 'faq-kurikulum-2',
    category: 'KURIKULUM',
    categoryLabel: 'Kurikulum & Buku PDF',
    question: 'Bagaimana cara mengunduh buku PDF sesuai mata pelajaran yang saya pilih?',
    shortAnswer:
      'Setiap kartu modul dan bagian atas daftar pelajaran memiliki tombol "Unduh PDF Mapel (Google Drive)". Saat diklik, kamu akan diarahkan ke folder Google Drive resmi Mimi V15 sehingga kamu bebas memilih dan mengunduh file PDF mata pelajaran sesuai kelas yang sedang kamu pelajari.',
    aiFollowUpPrompt:
      'Mimi, bagaimana cara efektif merangkum buku PDF Kemendikdasmen yang sudah aku download agar cepat paham?',
  },
  {
    id: 'faq-tips-1',
    category: 'TIPS_BELAJAR',
    categoryLabel: 'Tips Belajar',
    question: 'Bagaimana tips belajar efektif agar cepat hafal rumus dan tidak mudah lupa?',
    shortAnswer:
      'Gunakan kombinasi Metode Jembatan Keledai (singkatan unik yang ada di setiap modul Mimi), teknik Pomodoro (25 menit fokus belajar + 5 menit istirahat), serta langsung praktikkan konsep di Simulasi Interaktif dan latihan soal. Belajar dengan mengutak-atik simulasi meningkatkan daya ingat hingga 2x lipat dibanding hanya menghafal teks.',
    aiFollowUpPrompt:
      'Mimi, buatkan jadwal belajar harian 30 menit dengan teknik Pomodoro dan Jembatan Keledai supaya aku nggak gampang lupa materi!',
  },
  {
    id: 'faq-tips-2',
    category: 'TIPS_BELAJAR',
    categoryLabel: 'Tips Belajar Bahasa Inggris',
    question: 'Bagaimana cara cepat menguasai kosakata Bahasa Inggris dan Verb 1, 2, 3 di Mimi?',
    shortAnswer:
      'Buka fitur "Kamus Bahasa Inggris Internal" di Beranda, lalu pilih kategori Percakapan Sehari-hari, Kosakata Formal, atau Kamus Verb 1-2-3. Klik ikon speaker untuk mendengarkan pelafalan suara cewek Mimi, tirukan pengucapannya, lalu klik "Latih Bareng Mimi" untuk membuat kalimat sendiri.',
    aiFollowUpPrompt:
      'Mimi, kasih aku 5 tips praktis latihan speaking dan menghafal Irregular Verbs (Verb 1, 2, 3) setiap hari!',
  },
  {
    id: 'faq-req-1',
    category: 'REQ_MAPEL',
    categoryLabel: 'Request Mapel & Kontak Mimi Real',
    question: 'Bagaimana jika saya ingin request mata pelajaran baru, modul PDF tambahan, atau menghubungi Mimi Real?',
    shortAnswer:
      'Sangat mudah! Jika kamu ingin request mata pelajaran baru (misalnya mapel kejuruan SMK tertentu, materi olimpiade, atau buku PDF kelas lainnya), silakan buka menu "Profil" lalu klik Tombol Hijau WhatsApp ("💬 Tanya / Request Pelajaran - Chat WA Mimi") untuk terhubung langsung dengan Mimi Real.',
    aiFollowUpPrompt:
      'Mimi, informasi apa saja yang perlu aku sebutkan saat mau request mata pelajaran baru ke Mimi Real?',
  },
];

const QUICK_AI_FAQ_CHIPS = [
  'Gimana cara kerja XP & Simulasi di sistem Mimi?',
  'Tips belajar cepat paham pakai Jembatan Keledai?',
  'Cara request mata pelajaran baru ke Mimi Real?',
  'Tips membagi waktu belajar Kurikulum Merdeka?',
];

const FEEDBACK_STORAGE_KEY = 'mimi15_student_smart_feedback_v1';

interface SmartFaqSectionProps {
  studentName: string;
  selectedLevel: EducationLevel;
  selectedClass: string;
  selectedSubject: string;
  onNavigateTab: (tab: BottomNavTab) => void;
  onAskMimiTopic: (prompt: string) => void;
}

export const SmartFaqSection: React.FC<SmartFaqSectionProps> = ({
  studentName,
  selectedLevel,
  selectedClass,
  selectedSubject,
  onNavigateTab,
  onAskMimiTopic,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('ALL');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-req-1');

  // Instant AI FAQ state
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [lastAskedQuestion, setLastAskedQuestion] = useState<string | null>(null);

  // Saran & Kritik state
  const [feedbackType, setFeedbackType] = useState<'SARAN' | 'KRITIK' | 'REQUEST_MAPEL'>('SARAN');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [feedbackList, setFeedbackList] = useState<StudentFeedbackItem[]>(() => {
    try {
      const saved = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [
      {
        id: 'seed-1',
        type: 'SARAN',
        studentName: 'Siswa Mimi V15',
        message: 'Fitur kamus bahasa Inggris bersuara cewek dan progres bar modul sangat membantu belajar mandiri!',
        createdAt: 'Baru saja',
      },
    ];
  });

  const filteredFaqs = CURATED_FAQ_ITEMS.filter(
    (item) => selectedCategory === 'ALL' || item.category === selectedCategory
  );

  // Female TTS helper for reading FAQ answers aloud
  const speakFaqWithFemaleVoice = (text: string) => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*#_`~]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voices = window.speechSynthesis.getVoices();

        const idFemale = voices.find(
          (v) =>
            v.lang?.toLowerCase().startsWith('id') &&
            !v.name.toLowerCase().includes('male')
        );
        const anyId = voices.find((v) => v.lang?.toLowerCase().startsWith('id'));
        const chosenVoice = idFemale || anyId || null;

        if (chosenVoice) {
          utterance.voice = chosenVoice;
          utterance.lang = chosenVoice.lang || 'id-ID';
        } else {
          utterance.lang = 'id-ID';
        }

        // Suara cewek Mimi
        utterance.pitch = 1.24;
        utterance.rate = 0.98;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // ignore if speech synthesis is unavailable
    }
  };

  const handleAskSmartFaqAi = async (customPrompt?: string) => {
    const query = (customPrompt ?? aiQuestion).trim();
    if (!query || isAiLoading) return;

    setIsAiLoading(true);
    setLastAskedQuestion(query);
    if (!customPrompt) {
      setAiQuestion('');
    }

    try {
      const contextualPrompt = `[FAQ PINTAR MIMI V15 - JAWAB RINGKAS, RAMAH & JELAS (MAKSIMAL 4-6 KALIMAT)]
Pertanyaan Siswa (${studentName}, Jenjang ${selectedLevel} ${selectedClass}, Mapel ${selectedSubject}): "${query}"

Konteks Sistem Mimi V15:
- Mimi V15 adalah asisten belajar pintar Kurikulum Merdeka (SD, SMP, SMA, SMK, & Umum) dengan respon kilat Mimi- V15.
- Fitur utama: Peta Unit Duolingo Style, Progress Bar Topik (Konsep 35% + Simulasi 35% + Kuis 30%), Unduh PDF Mapel via Google Drive, Kamus Bahasa Inggris Internal (Percakapan, Formal, Verb 1-2-3 dengan suara cewek Mimi), Ruang Coding, dan Curhat.
- Jika siswa ingin request mata pelajaran baru, modul PDF, atau menyampaikan saran langsung ke pencipta aslinya, arahkan untuk menghubungi "Mimi Real" di menu "Profil" melalui Tombol Hijau WhatsApp (WA).`;

      const result = await chatMimiWithFallback(contextualPrompt, [], {
        educationLevel: selectedLevel,
        selectedClass,
        selectedSubject,
        isProfesorMode: false,
        studentName,
      });

      setAiAnswer(result.reply);
    } catch {
      setAiAnswer(
        'Halo! Untuk pertanyaan ini: Sistem Mimi V15 mendukung Kurikulum Merdeka SD, SMP, SMA, SMK, dan Umum lengkap dengan Simulasi Interaktif serta Unduhan PDF Google Drive. Jika kamu ingin request mata pelajaran baru atau butuh bantuan langsung, silakan buka menu **Profil** dan klik **Tombol Hijau WhatsApp (WA) Mimi Real** ya!'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = feedbackMessage.trim();
    if (!trimmed) return;

    const newEntry: StudentFeedbackItem = {
      id: `fb-${Date.now()}`,
      type: feedbackType,
      studentName: studentName || 'Siswa Mimi',
      message: trimmed,
      createdAt: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updated = [newEntry, ...feedbackList].slice(0, 6);
    setFeedbackList(updated);
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }

    setFeedbackMessage('');
    setFeedbackToast(
      feedbackType === 'REQUEST_MAPEL'
        ? 'Request mapel kamu berhasil dicatat! Untuk diproses lebih cepat, yuk klik Tombol Hijau WA Mimi Real di bagian Profil.'
        : 'Terima kasih! Saran & kritik kamu sudah tersimpan di Kotak Evaluasi Mimi V15.'
    );
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  return (
    <section
      id="smart-faq-section"
      className="p-5 sm:p-8 card-study space-y-6 rounded-3xl border border-slate-800/90 bg-[#0c1222]/95 shadow-2xl"
    >
      {/* 1. Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-sky-400">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>FAQ Pintar Berbasis AI · Respon Kilat Mimi- V15</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-400">Saran, Kritik &amp; Request Mapel</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
            Pusat Bantuan FAQ Pintar, Tips Belajar &amp; Kotak Saran Siswa
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
            Tanyakan apa saja secara instan kepada AI Mimi seputar sistem aplikasi, Kurikulum Merdeka, atau tips belajar efektif. Punya saran, kritik, atau ingin request mata pelajaran baru? Cek panduan hubungi <strong className="text-emerald-300">Mimi Real</strong> di bawah!
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onNavigateTab(BottomNavTab.PROFIL);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-4 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all shrink-0 cursor-pointer"
        >
          <span>💬 Buka Profil (Tombol Hijau WA Mimi Real)</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {/* 2. Highlight Callout: Petunjuk Request Mapel & Hubungi Mimi Real di Profil (Tombol Hijau WA) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900 border-2 border-emerald-500/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-300">
            <MessageCircleHeart className="w-4 h-4 text-[#25D366] shrink-0" />
            <span>PETUNJUK REQUEST MATA PELAJARAN BARU &amp; FITUR LAINNYA</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Ingin request <strong className="text-white">mata pelajaran baru</strong> (SD, SMP, SMA, kejuruan SMK, atau Umum), minta tambahan modul buku PDF, atau menyampaikan masukan langsung? Kamu bisa langsung menghubungi <strong className="text-emerald-300">Mimi Real</strong> di bagian menu <strong className="text-white">Profil</strong> melalui <strong className="text-[#25D366]">Tombol Hijau WhatsApp (WA)</strong>!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              onNavigateTab(BottomNavTab.PROFIL);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/50 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Ke Menu Profil</span>
          </button>

          <a
            href={`https://wa.me/6282148184782?text=${encodeURIComponent('Halo Mimi_Real, aku mau bertanya nih, boleh gak?')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <span>💬 Chat WA Mimi Real Sekarang</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 3. Main Two-Column Grid: Left = Instant AI FAQ + Curated Accordions | Right = Saran & Kritik Siswa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 Cols): Tanya Instan AI + Daftar Pertanyaan Umum */}
        <div className="lg:col-span-7 space-y-5">
          {/* Instant AI Question Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0B101E] border-2 border-sky-500/40 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-white">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Tanya Instan ke AI FAQ Pintar Mimi</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                ● Dijawab Instan oleh AI
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskSmartFaqAi();
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ketik pertanyaanmu tentang sistem Mimi, kurikulum, atau tips belajar..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiQuestion.trim()}
                className="px-5 py-3 rounded-xl btn-tactile-sky font-extrabold text-xs flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mimi Menjawab...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Tanya AI</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Chips */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400 font-semibold">
                Pertanyaan Kilat Populer (Klik untuk tanya AI):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_AI_FAQ_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleAskSmartFaqAi(chip)}
                    disabled={isAiLoading}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-800 hover:border-sky-400/40 text-[11px] font-semibold transition-all text-left cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Instant AI Response Card */}
            <AnimatePresence mode="wait">
              {(isAiLoading || aiAnswer) && (
                <motion.div
                  key={lastAskedQuestion || 'ai-faq-ans'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-4 rounded-2xl bg-slate-900/95 border border-sky-500/40 space-y-3"
                >
                  {lastAskedQuestion && (
                    <div className="text-xs font-bold text-sky-300 border-b border-slate-800 pb-2">
                      Pertanyaanmu: &ldquo;{lastAskedQuestion}&rdquo;
                    </div>
                  )}

                  {isAiLoading ? (
                    <div className="flex items-center gap-2.5 text-xs text-slate-300 py-2">
                      <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
                      <span>Mimi sedang menyusun jawaban pintar untukmu...</span>
                    </div>
                  ) : (
                    aiAnswer && (
                      <>
                        <div className="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-line">
                          {aiAnswer}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => speakFaqWithFemaleVoice(aiAnswer)}
                            className="px-3 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/40 text-pink-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                            <span>Dengarkan Suara Cewek Mimi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onAskMimiTopic(
                                lastAskedQuestion ||
                                  'Mimi, bantu jelaskan lebih lanjut tentang cara belajar efektif di sistem Mimi V15!'
                              )
                            }
                            className="text-xs font-extrabold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Lanjut Diskusi di Ruang Chat Mimi</span>
                          </button>
                        </div>
                      </>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category Filter Tabs for Curated FAQ */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'ALL', label: 'Semua FAQ' },
                { id: 'SISTEM_MIMI', label: 'Sistem Mimi' },
                { id: 'KURIKULUM', label: 'Kurikulum & PDF' },
                { id: 'TIPS_BELAJAR', label: 'Tips Belajar' },
                { id: 'REQ_MAPEL', label: 'Request Mapel (WA)' },
              ] as { id: FaqCategory; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-sky-500 text-slate-950 font-extrabold shadow'
                    : 'bg-[#0B101E] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Curated Expandable FAQ Accordions */}
          <div className="space-y-2.5">
            {filteredFaqs.map((faq) => {
              const isOpen = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl bg-[#0B101E] border border-slate-800 hover:border-slate-700 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                    className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
                        {faq.categoryLabel}
                      </span>
                      <div className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                        {faq.question}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900 text-slate-400 shrink-0 mt-0.5">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-sky-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3">
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {faq.shortAnswer}
                          </p>
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => speakFaqWithFemaleVoice(faq.shortAnswer)}
                              className="text-[11px] font-bold text-pink-300 hover:text-pink-200 flex items-center gap-1 cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                              <span>Dengar Penjelasan (Suara Cewek Mimi)</span>
                            </button>

                            <div className="flex items-center gap-2">
                              {faq.category === 'REQ_MAPEL' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onNavigateTab(BottomNavTab.PROFIL);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Buka Profil (Tombol Hijau WA)</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleAskSmartFaqAi(faq.aiFollowUpPrompt)}
                                className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3 text-sky-400" />
                                <span>Kupas Lebih Dalam pakai AI</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): Kotak Saran, Kritik & Request Mapel Siswa */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0B101E] border-2 border-slate-800 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-400">
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span>Kotak Saran, Kritik &amp; Request Mapel</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Suara Siswa untuk Kemajuan Mimi V15
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tulis saran fitur, kritik membangun, atau request mata pelajaran yang kamu butuhkan.
              </p>
            </div>

            {feedbackToast && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs font-bold text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{feedbackToast}</span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'SARAN', label: '💡 Saran' },
                    { id: 'KRITIK', label: '🛠️ Kritik' },
                    { id: 'REQUEST_MAPEL', label: '📚 Req Mapel' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFeedbackType(opt.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      feedbackType === opt.id
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-extrabold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder={
                  feedbackType === 'REQUEST_MAPEL'
                    ? 'Contoh: Kak Mimi, tolong tambahkan modul mapel Produktif SMK / Fisika Kelas 12 Bab gelombang...'
                    : 'Tulis saran atau kritik membangun agar Mimi V15 makin nyaman dipakai belajar...'
                }
                className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 resize-none"
              />

              <button
                type="submit"
                disabled={!feedbackMessage.trim()}
                className="w-full py-3 rounded-xl btn-tactile-emerald font-extrabold text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim {feedbackType === 'SARAN' ? 'Saran' : feedbackType === 'KRITIK' ? 'Kritik' : 'Request Mapel'}</span>
              </button>
            </form>

            {/* Guide Box inside Feedback Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
              <div className="font-extrabold text-emerald-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <span>Ingin Dijawab Langsung oleh Mimi Real?</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Untuk request mata pelajaran khusus, kendala aplikasi, atau diskusi langsung, buka bagian <strong className="text-white">Profil</strong> lalu tekan <strong className="text-[#25D366]">Tombol Hijau WA (&ldquo;💬 Tanya / Request Pelajaran - Chat WA Mimi&rdquo;)</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  onNavigateTab(BottomNavTab.PROFIL);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 text-[#25D366] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Buka Bagian Profil &rarr; Tombol Hijau WA</span>
              </button>
            </div>

            {/* Recent Feedback List */}
            {feedbackList.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-400">
                  Aspirasi, Saran &amp; Request Siswa Terbaru:
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {feedbackList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px]">
                        <span
                          className={`font-extrabold ${
                            item.type === 'REQUEST_MAPEL'
                              ? 'text-sky-400'
                              : item.type === 'KRITIK'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          [{item.type === 'REQUEST_MAPEL' ? 'REQ MAPEL' : item.type}] · {item.studentName}
                        </span>
                        <span className="text-slate-500 font-mono">{item.createdAt}</span>
                      </div>
                      <p className="text-slate-200 text-xs leading-snug">{item.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
