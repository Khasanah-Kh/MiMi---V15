import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  PanelRightClose,
  PanelRightOpen,
  MessageSquare,
} from 'lucide-react';
import { ChatMessage, EducationLevel } from '../types/mimi';
import { CLASSES_BY_LEVEL } from '../data/curriculumData';

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
  onSelectLevel: (level: EducationLevel) => void;
  onSelectClass: (cls: string) => void;
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
  onSelectLevel,
  onSelectClass,
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

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-100">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-sky-400/15 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold text-xs shrink-0">
            M15
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">Tutor Pintar Mimi</div>
            <div className="text-[11px] text-slate-400 truncate">
              Pendamping {selectedLevel} · {selectedClass}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {showDockToggle && onToggleDock && (
            <button
              type="button"
              onClick={onToggleDock}
              title={isDocked ? 'Ubah ke Jendela Mengambang' : 'Sematkan di Sisi Kanan'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Education Level & Class Context Selector Bar */}
      <div className="px-4 py-2.5 bg-[#0B1120] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1">
          {[EducationLevel.SD, EducationLevel.SMP, EducationLevel.SMA].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onSelectLevel(lvl)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedLevel === lvl
                  ? 'bg-sky-400 text-slate-950'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <select
          aria-label="Pilih Kelas"
          value={selectedClass}
          onChange={(e) => onSelectClass(e.target.value)}
          className="px-2.5 py-1 text-xs font-medium bg-slate-900 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-sky-400"
        >
          {availableClasses.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* Latest XP Notification Banner */}
      {latestXpNotification && (
        <div className="px-4 py-2 bg-emerald-950/60 border-b border-emerald-800/60 text-xs text-emerald-300 font-medium flex items-center justify-between shrink-0">
          <span>{latestXpNotification}</span>
          <span className="font-mono font-bold tabular-nums">+15 XP</span>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                <span>{isUser ? 'Kamu' : 'Mimi Tutor'}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{msg.timestamp}</span>
                {msg.xpEarned && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400 font-mono tabular-nums">
                      +{msg.xpEarned} XP
                    </span>
                  </>
                )}
              </div>
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-sky-500 text-slate-950 font-medium'
                    : 'bg-[#0B1120] border border-slate-800 text-slate-100'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex flex-col items-start">
            <div className="text-[11px] text-slate-400 mb-1 px-1">
              Mimi sedang menyusun penjelasan...
            </div>
            <div className="bg-[#0B1120] border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-300">
              Menganalisis pertanyaan sesuai kurikulum {selectedLevel} ({selectedClass})...
            </div>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 py-2.5 border-t border-slate-800/80 bg-[#0B1120]/60 shrink-0">
        <div className="text-[11px] text-slate-400 mb-1.5">Ide pertanyaan cepat:</div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isTyping}
              onClick={() => onSendMessage(prompt)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              {prompt.length > 48 ? prompt.slice(0, 48) + '...' : prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-slate-800 bg-[#0F172A] flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
          placeholder={`Tanyakan materi ${selectedLevel} (${selectedClass})...`}
          className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-[#0B1120] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="px-4 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-40"
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
      <aside className="w-96 shrink-0 h-full border-l border-slate-800/90 flex flex-col">
        <ChatCoreContent {...props} showDockToggle={true} />
      </aside>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[400px] h-[560px] max-h-[82vh] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
      <ChatCoreContent {...props} showDockToggle={true} />
    </div>
  );
};

export const MimiChatBottomSheet: React.FC<MimiChatProps> = (props) => {
  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col justify-end">
      <div className="w-full h-[82vh] rounded-t-2xl overflow-hidden border-t border-slate-700 flex flex-col">
        <ChatCoreContent {...props} showDockToggle={false} />
      </div>
    </div>
  );
};
