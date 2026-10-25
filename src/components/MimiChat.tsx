import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
} from 'lucide-react';
import { ChatMessage, EducationLevel } from '../types/mimi';
import { CLASSES_BY_LEVEL, SUBJECTS_BY_LEVEL } from '../data/curriculumData';

interface MimiChatProps {
  isOpen: boolean;
  isDocked?: boolean;
  onDismiss: () => void;
  onToggleDock?: () => void;
  messages: ChatMessage[];
  isTyping: boolean;
  suggestedPrompts: string[];
  selectedLevel: EducationLevel;
  selectedClass: string;
  selectedSubject: string;
  isProfesorMode: boolean;
  onSelectLevel: (level: EducationLevel) => void;
  onSelectClass: (cls: string) => void;
  onSelectSubject: (subject: string) => void;
  onToggleProfesorMode: () => void;
  onSendMessage: (text: string) => void;
  latestXpNotification: string | null;
}

const ChatCoreContent: React.FC<MimiChatProps & { showDockToggle: boolean }> = ({
  isDocked,
  onDismiss,
  onToggleDock,
  messages,
  isTyping,
  suggestedPrompts,
  selectedLevel,
  selectedClass,
  selectedSubject,
  isProfesorMode,
  onSelectLevel,
  onSelectClass,
  onSelectSubject,
  onToggleProfesorMode,
  onSendMessage,
  latestXpNotification,
  showDockToggle,
}) => {
  const [inputText, setInputText] = useState('');
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isTyping) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  const availableClasses = CLASSES_BY_LEVEL[selectedLevel] || [];
  const availableSubjects = SUBJECTS_BY_LEVEL[selectedLevel] || [];

  return (
    <div className="flex flex-col h-full bg-[#131C31] text-slate-100">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-sky-400/15 border border-sky-400/40 flex items-center justify-center text-sky-300 font-extrabold text-xs shrink-0">
            Mimi
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="text-sm font-extrabold text-white truncate">
              MIMI · Asisten Belajar Masa Depan Indonesia
            </div>
            <div className="text-[11px] text-emerald-400 font-medium truncate">
              ● Asisten BelajarMu - GuruMu, AsistenMu, Teman CurhatMu
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {showDockToggle && onToggleDock && (
            <button
              type="button"
              onClick={onToggleDock}
              title={isDocked ? 'Ubah ke Jendela Mengambang' : 'Sematkan di Sisi Kanan'}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isDocked ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hierarchy Selector: Tingkatan (SD / SMP / SMA / SMK / UMUM) -> Kelas -> Mapel + Mimi Profesor Mode */}
      <div className="px-4 py-3 bg-[#0B101E] border-b border-slate-800/80 space-y-2.5 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1">
            {[
              EducationLevel.SD,
              EducationLevel.SMP,
              EducationLevel.SMA,
              EducationLevel.SMK,
              EducationLevel.UMUM,
            ].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => onSelectLevel(lvl)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedLevel === lvl
                    ? 'bg-sky-400 text-slate-950'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onToggleProfesorMode}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all whitespace-nowrap shrink-0 ${
              isProfesorMode
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
            }`}
            title="Aktifkan Mimi Profesor Mode untuk Hack Trik Hafal & Jembatan Keledai"
          >
            <Sparkles className="w-3 h-3" />
            <span>{isProfesorMode ? 'Profesor Mode: ON' : 'Profesor Mode'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            aria-label="Pilih Kelas"
            value={selectedClass}
            onChange={(e) => onSelectClass(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-400"
          >
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <select
            aria-label="Pilih Mata Pelajaran"
            value={selectedSubject}
            onChange={(e) => onSelectSubject(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-700 rounded-lg text-sky-300 focus:outline-none focus:border-sky-400"
          >
            {availableSubjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Latest XP Notification Banner */}
      {latestXpNotification && (
        <div className="px-5 py-2.5 bg-emerald-950/60 border-b border-emerald-800/60 text-xs text-emerald-300 font-semibold flex items-center justify-between shrink-0">
          <span>{latestXpNotification}</span>
          <span className="font-mono font-bold tabular-nums">+15 XP</span>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const paragraphs = msg.text.split(/\n+/).filter((p) => p.trim().length > 0);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5 px-1">
                <span className="font-semibold">{isUser ? 'Kamu' : 'Mimi'}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{msg.timestamp}</span>
                {msg.xpEarned && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400 font-mono font-semibold tabular-nums">
                      +{msg.xpEarned} XP
                    </span>
                  </>
                )}
              </div>
              <div
                className={`max-w-[90%] rounded-2xl px-5 py-4 text-sm leading-[1.8] tracking-normal space-y-3 ${
                  isUser
                    ? 'bg-sky-400 text-slate-950 font-semibold'
                    : 'bg-[#0B101E] border border-slate-800 text-slate-100'
                }`}
              >
                {paragraphs.map((para, idx) => (
                  <p key={idx} className="leading-[1.8]">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex flex-col items-start">
            <div className="text-xs text-slate-400 mb-1.5 px-1">
              Mimi sedang mengetik...
            </div>
            <div className="bg-[#0B101E] border border-slate-800 rounded-2xl px-5 py-3 text-xs sm:text-sm text-slate-300">
              Sebentar ya bestie... ✨
            </div>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-5 py-3 border-t border-slate-800/80 bg-[#0B101E]/60 shrink-0">
        <div className="text-xs text-slate-400 mb-2">
          Mulai obrolan cepat ({selectedLevel} · {selectedClass} · {selectedSubject}):
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isTyping}
              onClick={() => onSendMessage(prompt)}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              {prompt.length > 48 ? prompt.slice(0, 48) + '...' : prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-slate-800 bg-[#131C31] flex items-center gap-2.5 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
          placeholder="Sapa Mimi, curhat santai, atau tanya soal pelajaran..."
          className="flex-1 px-4 py-3 text-sm bg-[#0B101E] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="px-5 py-3 rounded-xl btn-tactile-sky font-extrabold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-40"
        >
          <span>Kirim</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export const MimiDesktopFloatingChatWindow: React.FC<MimiChatProps> = (props) => {
  if (!props.isOpen) return null;

  if (props.isDocked) {
    return (
      <aside className="w-[420px] shrink-0 h-full border-l border-slate-800/90 flex flex-col">
        <ChatCoreContent {...props} showDockToggle={true} />
      </aside>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[420px] h-[620px] max-h-[85vh] rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl flex flex-col">
      <ChatCoreContent {...props} showDockToggle={true} />
    </div>
  );
};

export const MimiChatBottomSheet: React.FC<MimiChatProps> = (props) => {
  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex flex-col justify-end">
      <div className="w-full h-[85vh] rounded-t-3xl overflow-hidden border-t-2 border-slate-700 flex flex-col">
        <ChatCoreContent {...props} showDockToggle={false} />
      </div>
    </div>
  );
};
