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
    label: 'Lagi Senang & Semangat',
    desc: 'Hari ini rasanya menyenangkan dan pengen berbagi cerita seru',
    prompt: 'Mimi, hari ini aku lagi senang banget! Mau dengerin ceritaku nggak?',
    icon: Smile,
    accent: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
  },
  {
    id: 'tired',
    label: 'Agak Capek & Butuh Jeda',
    desc: 'Seharian kegiatan padat, kepala rasanya agak penuh',
    prompt: 'Mimi, jujur hari ini aku rasanya capek banget habis sekolah dan banyak kegiatan.',
    icon: Coffee,
    accent: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
  },
  {
    id: 'sad',
    label: 'Sedih / Soal Pertemanan',
    desc: 'Lagi ada hal yang mengganjal di hati dan butuh teman cerita',
    prompt: 'Mimi, aku lagi agak sedih dan kepikiran sesuatu hari ini. Boleh aku cerita?',
    icon: CloudRain,
    accent: 'text-sky-400 border-sky-500/40 bg-sky-950/20',
  },
  {
    id: 'future',
    label: 'Bingung Jurusan / Masa Depan',
    desc: 'Pengen diskusi santai soal minat, bakat, dan rencana ke depan',
    prompt: 'Mimi, kadang aku suka bingung mikirin rencana masa depan dan minatku. Menurutmu gimana?',
    icon: Compass,
    accent: 'text-violet-400 border-violet-500/40 bg-violet-950/20',
  },
  {
    id: 'casual',
    label: 'Ngobrol Santai Aja',
    desc: 'Lagi pengen ngobrol ringan soal hobi, musik, atau keseharian',
    prompt: 'Hai Mimi! Lagi pengen ngobrol santai aja nih di luar pelajaran sekolah.',
    icon: Sparkles,
    accent: 'text-pink-400 border-pink-500/40 bg-pink-950/20',
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
      <section className="p-7 sm:p-9 card-study space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-pink-400">
              <Heart className="w-4 h-4 shrink-0" />
              <span>Ruang Cerita Santai & Curhat Manusiawi · Mimi V15</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gimana Perasaanmu Hari Ini, {uiState.studentName}?
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Belajar itu bukan cuma soal angka dan nilai. Kalau kamu lagi capek, butuh teman ngobrol santai, atau ingin mencurahkan isi hati tanpa dihakimi, Mimi selalu siap mendengarkanmu seperti sahabat sendiri.
            </p>
          </div>
        </div>

        {/* Mood Selector Grid */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300">
            Pilih suasana hatimu sekarang untuk mulai bercerita:
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
                    setSelectedMoodId(mood.id);
                    onSendMessage(mood.prompt);
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
              const paragraphs = msg.text.split(/\n+/).filter((p) => p.trim().length > 0);
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
