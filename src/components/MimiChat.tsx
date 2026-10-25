import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Mic,
  MicOff,
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
  const [isListening, setIsListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechNotice('Browser ini tidak mendukung pengenal suara langsung. Silakan ketik pertanyaanmu!');
      setTimeout(() => setSpeechNotice(null), 4000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setSpeechNotice(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechNotice('🎙️ Mendengarkan suara bestie... Bicara sekarang dalam Bahasa Indonesia!');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setSpeechNotice(
          event.error === 'not-allowed'
            ? 'Izin mikrofon ditolak. Berikan izin di browser untuk bicara!'
            : 'Selesai mendengarkan suara.'
        );
        setTimeout(() => setSpeechNotice(null), 3500);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => setSpeechNotice(null), 2500);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition failed to start:', err);
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isTyping) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
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
            <div className="text-[11px] text-emerald-400 font-medium truncate flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>● Response Kilat Gemini Flash · Multi-Model Failover Active</span>
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
      <div className="px-4 py-2.5 bg-[#0B101E] border-b border-slate-800/80 space-y-2 shrink-0">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 shrink-0">
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
            <span>{isProfesorMode ? 'Profesor: ON' : 'Profesor'}</span>
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
        <div className="px-4 py-2 bg-emerald-950/60 border-b border-emerald-800/60 text-xs text-emerald-300 font-semibold flex items-center justify-between shrink-0">
          <span className="truncate">{latestXpNotification}</span>
          <span className="font-mono font-bold tabular-nums shrink-0">+15 XP</span>
        </div>
      )}

      {/* Voice-to-Text Status Notification Banner */}
      {speechNotice && (
        <div
          className={`px-4 py-2 border-b text-xs font-semibold flex items-center justify-between shrink-0 transition-all ${
            isListening
              ? 'bg-rose-950/80 border-rose-800 text-rose-200 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}
        >
          <span className="truncate">{speechNotice}</span>
          {isListening && (
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping shrink-0" />
          )}
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const cleanText = msg.text.replace(/\*\*/g, '').replace(/\*/g, '');
          const paragraphs = cleanText.split(/\n+/).filter((p) => p.trim().length > 0);

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
                className={`max-w-[92%] sm:max-w-[90%] rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm leading-[1.8] tracking-normal space-y-2.5 ${
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
              Mimi sedang memikirkan balasan kilat...
            </div>
            <div className="bg-[#0B101E] border border-slate-800 rounded-2xl px-5 py-3 text-xs sm:text-sm text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>Sebentar ya bestie... ✨</span>
            </div>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 sm:px-5 py-2.5 border-t border-slate-800/80 bg-[#0B101E]/60 shrink-0">
        <div className="text-[11px] text-slate-400 mb-1.5 truncate">
          Mulai obrolan cepat ({selectedLevel} · {selectedClass} · {selectedSubject}):
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isTyping}
              onClick={() => onSendMessage(prompt)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              {prompt.length > 46 ? prompt.slice(0, 46) + '...' : prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form with Voice-to-Text Button */}
      <form
        onSubmit={handleSubmit}
        className="p-3.5 sm:p-4 border-t border-slate-800 bg-[#131C31] flex items-center gap-2 shrink-0 pb-safe"
      >
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          disabled={isTyping}
          title={
            isListening
              ? 'Hentikan Rekaman Suara'
              : 'Bicara Sekarang (Voice-to-Text Bahasa Indonesia)'
          }
          className={`p-2.5 sm:p-3 rounded-xl transition-all shrink-0 flex items-center justify-center ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/40'
              : 'bg-[#0B101E] border border-slate-800 text-sky-400 hover:text-sky-300 hover:border-sky-400/50'
          }`}
        >
          {isListening ? (
            <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          ) : (
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
          placeholder={
            isListening
              ? 'Mendengarkan... silakan bicara...'
              : 'Bicara dengan tombol mic 🎙️ atau ketik di sini...'
          }
          className={`flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-[#0B101E] border rounded-xl text-white placeholder:text-slate-500 focus:outline-none transition-colors ${
            isListening ? 'border-rose-500/80 ring-2 ring-rose-500/30' : 'border-slate-800 focus:border-sky-400'
          }`}
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl btn-tactile-sky font-extrabold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-40"
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
    <div className="fixed bottom-6 right-6 z-40 w-[420px] h-[620px] max-h-[85dvh] rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl flex flex-col">
      <ChatCoreContent {...props} showDockToggle={true} />
    </div>
  );
};

export const MimiChatBottomSheet: React.FC<MimiChatProps> = (props) => {
  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex flex-col justify-end">
      <div className="w-full h-[88dvh] rounded-t-3xl overflow-hidden border-t-2 border-slate-700 flex flex-col">
        <ChatCoreContent {...props} showDockToggle={false} />
      </div>
    </div>
  );
};
