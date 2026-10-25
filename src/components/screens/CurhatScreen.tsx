import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Send,
  Smile,
  Coffee,
  CloudRain,
  Compass,
  Sparkles,
  MessageCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { ChatMessage, LearningMilestone, MimiUiState } from '../../types/mimi';

interface CurhatScreenProps {
  uiState: MimiUiState;
  messages: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  milestones: LearningMilestone[];
  onAddMilestone: (title: string, xp: number) => void;
  onDeleteMilestone: (id: string) => void;
}

const MOOD_CARDS = [
  {
    id: 'happy',
    label: 'Lagi Senang & Full Semangat',
    desc: 'Hari ini rasanya wholesome banget dan pengen spill cerita seru',
    prompts: [
      'Mimi, hari ini aku lagi senang banget! Mau dengerin ceritaku nggak?',
      'Bestie Mimi! Hari ini ada kejadian seru banget di sekolah, aku pengen cerita!',
      'Mimi, alhamdulillah hari ini mood-ku lagi on fire dan bahagia banget!',
    ],
    icon: Smile,
    accent: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
  },
  {
    id: 'tired',
    label: 'Capek, Burnout & Butuh Jeda',
    desc: 'Seharian kegiatan padat, kepala rasanya overwhelmed banget',
    prompts: [
      'Mimi, jujur hari ini aku rasanya capek dan overwhelmed banget habis sekolah dan banyak tugas.',
      'Duh Mimi, energiku rasanya tinggal dikit banget hari ini, butuh teman ngobrol yang menenangkan.',
      'Mimi, hari ini kegiatanku padat banget sampai rasanya burnout. Temenin aku rehat sebentar yuk.',
    ],
    icon: Coffee,
    accent: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
  },
  {
    id: 'sad',
    label: 'Sedih / Drama Pertemanan',
    desc: 'Ada hal yang mengganjal di hati dan butuh sahabat cerita yang peka',
    prompts: [
      'Mimi, aku lagi agak sedih dan kepikiran sesuatu soal pertemanan hari ini. Boleh aku curhat?',
      'Mimi, rasanya hari ini hatiku lagi mendung dan butuh tempat cerita yang aman tanpa dihakimi.',
      'Bestie Mimi, gimana ya cara menenangkan hati kalau lagi kecewa sama keadaan?',
    ],
    icon: CloudRain,
    accent: 'text-sky-400 border-sky-500/40 bg-sky-950/20',
  },
  {
    id: 'future',
    label: 'Overthinking Masa Depan',
    desc: 'Pengen diskusi santai soal minat, bakat, jurusan, dan langkah ke depan',
    prompts: [
      'Mimi, kadang aku suka overthinking dan bingung mikirin rencana masa depan serta minatku. Menurutmu gimana?',
      'Mimi, gimana caranya biar nggak insecure waktu lihat teman lain udah tahu tujuan mereka?',
      'Mimi, bantu aku connect the dots soal bakat dan jurusan impianku sambil ngobrol santai yuk!',
    ],
    icon: Compass,
    accent: 'text-violet-400 border-violet-500/40 bg-violet-950/20',
  },
  {
    id: 'casual',
    label: 'Ngobrol Random, Hobi & Bahasa',
    desc: 'Ngobrol ringan soal musik, game, slang Inggris, atau bahasa daerah',
    prompts: [
      'Hai Mimi! Lagi pengen ngobrol santai aja nih soal hobi, musik, dan film di luar pelajaran sekolah.',
      'Mimi, spill kosakata English slang, idiom keren, academic terms, sama ungkapan bahasa daerah Nusantara dong!',
      'Kumaha damang Mimi? Lagi gabut nih, kita ngobrol santai yang seru dan anti-mainstream yuk!',
    ],
    icon: Sparkles,
    accent: 'text-pink-400 border-pink-500/40 bg-pink-950/20',
  },
];

const LEXICON_SHOWCASE_CHIPS = [
  {
    category: 'Slang & Gaul',
    term: 'Lowkey · Ngl · Slay · Menyala',
    prompt:
      'Mimi, jelasin cara pakai kata slang "lowkey", "ngl", "slay", dan "valid no debat" dalam obrolan sehari-hari dong!',
  },
  {
    category: 'English Idioms',
    term: 'Hit the Books · Silver Lining · Connect the Dots',
    prompt:
      'Mimi, kasih aku contoh obrolan seru pakai idiom Inggris "hit the books", "silver lining", dan "connect the dots"!',
  },
  {
    category: 'Academic Vocab',
    term: 'Hypothesis · Equilibrium · Synthesize · Empirical',
    prompt:
      'Mimi, ajarin arti kata akademik "hypothesis", "equilibrium", "empirical", dan "synthesize" pakai analogi gampang dong!',
  },
  {
    category: 'Bahasa Daerah',
    term: 'Alon-alon · Tong Hariwang · Rancak Bana · Ewako!',
    prompt:
      'Mimi, ceritain makna hangat dari ungkapan daerah "alon-alon asal kelakon", "tong hariwang", "rancak bana", dan "ewako"!',
  },
  {
    category: 'Peribahasa',
    term: 'Sedikit demi Sedikit · Ringan Sama Dijinjing',
    prompt:
      'Mimi, kasih aku peribahasa Indonesia yang cocok buat nyemangatin diri waktu lagi berjuang belajar!',
  },
];

export const CurhatScreen: React.FC<CurhatScreenProps> = ({
  uiState,
  messages,
  isTyping,
  onSendMessage,
  milestones,
  onAddMilestone,
  onDeleteMilestone,
}) => {
  const [curhatInput, setCurhatInput] = useState('');
  const [journalNote, setJournalNote] = useState('');
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [moodClickCount, setMoodClickCount] = useState<number>(0);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendCurhat = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = curhatInput.trim();
    if (!trimmed || isTyping) return;
    onSendMessage(trimmed);
    setCurhatInput('');
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = journalNote.trim();
    if (!trimmed) return;
    onAddMilestone(`Refleksi Hati: ${trimmed}`, 30);
    setJournalNote('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Ruang Cerita Santai & Curhat */}
      <section className="p-5 sm:p-8 card-study space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-pink-400">
              <Heart className="w-4 h-4 shrink-0" />
              <span>Mode Human Random · Empatik, Variatif & Multi-Bahasa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gimana Perasaanmu Hari Ini, {uiState.studentName}?
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Di sini Mimi ngobrol layaknya sahabat manusia yang peka dan nggak kaku. Kamu bebas curhat, cerita keseharian, atau eksplorasi kosakata gaul, idiom Inggris, istilah akademik, hingga ungkapan hangat Nusantara.
            </p>
          </div>
        </div>

        {/* Mood Selector Grid (Rotates prompts on each tap to avoid repetition) */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300">
            Pilih suasana hatimu sekarang untuk mulai bercerita (tiap klik memberi variasi obrolan baru):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {MOOD_CARDS.map((mood) => {
              const Icon = mood.icon;
              const isSelected = selectedMoodId === mood.id;
              return (
                <button
                  key={mood.id}
                  type="button"
                  disabled={isTyping}
                  onClick={() => {
                    const nextCount = moodClickCount + 1;
                    setMoodClickCount(nextCount);
                    setSelectedMoodId(mood.id);
                    const variedPrompt = mood.prompts[nextCount % mood.prompts.length];
                    onSendMessage(variedPrompt);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? mood.accent
                      : 'bg-[#0B101E] border-slate-800/90 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="w-5 h-5 text-sky-400 shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-400">
                      Klik untuk Cerita
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm font-extrabold text-white">
                      {mood.label}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {mood.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Language Lexicon Explorer Bar */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-sky-300">
              Eksplorasi Kosakata Kaya Mimi (Slang · Idiom · Academic · Nusantara):
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Klik untuk ngobrol & memperkaya diksi
            </span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {LEXICON_SHOWCASE_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isTyping}
                onClick={() => onSendMessage(chip.prompt)}
                className="px-3.5 py-2 rounded-xl bg-[#0B101E] hover:bg-slate-800/90 border border-slate-800 hover:border-sky-400/50 text-left transition-all shrink-0 disabled:opacity-50"
              >
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
                  {chip.category}
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">
                  {chip.term}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Live Obrolan Hati ke Hati & Jurnal Refleksi Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Direct Curhat Chat Box with Mimi (7 cols) */}
        <section className="lg:col-span-7 card-study p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-400/40 flex items-center justify-center text-pink-300 font-extrabold text-xs">
                Mimi
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">
                  Obrolan Santai & Curhat Bersama Mimi
                </h2>
                <p className="text-xs text-slate-400">
                  Mimi mendengarkan dengan tulus dan menjawab sesuai konteks obrolanmu
                </p>
              </div>
            </div>
            <MessageCircle className="w-5 h-5 text-pink-400 shrink-0" />
          </div>

          {/* Messages Stream */}
          <div className="h-[380px] overflow-y-auto pr-1 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const cleanText = msg.text.replace(/\*\*/g, '').replace(/\*/g, '');
              const paragraphs = cleanText.split(/\n+/).filter((p) => p.trim().length > 0);
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1 px-1">
                    <span className="font-semibold">{isUser ? uiState.studentName : 'Mimi'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{msg.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3.5 text-xs sm:text-sm leading-[1.8] space-y-2.5 ${
                      isUser
                        ? 'bg-sky-400 text-slate-950 font-semibold'
                        : 'bg-[#0B101E] border border-slate-800 text-slate-100'
                    }`}
                  >
                    {paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="text-xs text-slate-400 italic px-2">
                Mimi sedang mengetik balasan untukmu...
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Curhat Input Form */}
          <form onSubmit={handleSendCurhat} className="flex items-center gap-2.5 pt-3 border-t border-slate-800">
            <input
              type="text"
              value={curhatInput}
              onChange={(e) => setCurhatInput(e.target.value)}
              disabled={isTyping}
              placeholder="Ceritakan apa saja yang lagi kamu rasakan atau pikirkan hari ini..."
              className="flex-1 px-4 py-3 text-xs sm:text-sm bg-[#0B101E] border-2 border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
            />
            <button
              type="submit"
              disabled={!curhatInput.trim() || isTyping}
              className="px-5 py-3 rounded-xl btn-tactile-sky font-extrabold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-40"
            >
              <span>Kirim</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </section>

        {/* Right: Jurnal Perasaan & Ruang Tenang Siswa (5 cols) */}
        <section className="lg:col-span-5 card-study p-6 sm:p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-extrabold text-white">
                Jurnal Syukur & Catatan Perasaan
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Menuliskan apa yang kamu rasakan atau hal kecil yang kamu syukuri hari ini membantu pikiran lebih tenang (+30 XP)
              </p>
            </div>

            <form onSubmit={handleSaveJournal} className="space-y-3">
              <textarea
                rows={3}
                value={journalNote}
                onChange={(e) => setJournalNote(e.target.value)}
                placeholder="Contoh: Hari ini sempat capek karena tugas banyak, tapi lega akhirnya bisa selesai satu per satu..."
                className="w-full p-3.5 text-xs sm:text-sm bg-[#0B101E] border-2 border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 leading-relaxed"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl btn-tactile-emerald font-extrabold text-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Simpan Catatan Perasaan (+30 XP)</span>
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800 space-y-2.5 max-h-60 overflow-y-auto">
              {milestones.map((ms) => (
                <div
                  key={ms.id}
                  className="p-3 rounded-xl bg-[#0B101E] border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-semibold text-slate-200 truncate">{ms.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                      {ms.createdAt} · +{ms.xpGain} XP
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteMilestone(ms.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg shrink-0"
                    aria-label="Hapus catatan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B101E] border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-pink-400">Pesan Hangat dari Mimi: </span>
            Tidak apa-apa kalau hari ini kamu belum bisa memahami semuanya sekaligus. Istirahat sejenak bukan berarti menyerah—kamu sudah berusaha sebaik mungkin hari ini.
          </div>
        </section>
      </div>
    </div>
  );
};
