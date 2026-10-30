import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  BookOpen,
  Volume2,
  MessageSquare,
  Sparkles,
  Check,
  Copy,
  Layers,
  Briefcase,
  MessageCircle,
  MessagesSquare,
  AlertCircle,
} from 'lucide-react';
import {
  DAILY_CONVERSATION_VOCAB,
  FORMAL_ACADEMIC_VOCAB,
  VERB_123_LIST,
  CONVERSATION_DIALOGS_LIST,
  TOTAL_DICTIONARY_ENTRIES_COUNT,
  DictionaryJenjang,
} from '../data/englishDictionaryData';

export type DictionaryCategoryTab = 'DAILY' | 'FORMAL' | 'VERBS' | 'DIALOGS';

interface EnglishDictionaryModalProps {
  isOpen: boolean;
  initialTab?: DictionaryCategoryTab;
  onClose: () => void;
  onAskMimiTopic?: (prompt: string) => void;
}

const JENJANG_OPTIONS: Array<'SEMUA' | DictionaryJenjang> = [
  'SEMUA',
  'SD',
  'SMP',
  'SMA',
  'SMK',
  'UMUM',
];

export const EnglishDictionaryModal: React.FC<EnglishDictionaryModalProps> = ({
  isOpen,
  initialTab = 'DAILY',
  onClose,
  onAskMimiTopic,
}) => {
  const [activeTab, setActiveTab] = useState<DictionaryCategoryTab>(initialTab);
  const [selectedJenjang, setSelectedJenjang] = useState<'SEMUA' | DictionaryJenjang>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verbFilter, setVerbFilter] = useState<'ALL' | 'Irregular' | 'Regular'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [voiceWarning, setVoiceWarning] = useState<string | null>(null);

  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const speakTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // BUG 2B FIX: initVoices() dengan onvoiceschanged karena getVoices() kosong di awal (bug Chrome/Mobile)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const initVoices = () => {
      const loaded = window.speechSynthesis.getVoices();
      if (loaded && loaded.length > 0) {
        voicesRef.current = loaded;
      }
    };

    initVoices();
    window.speechSynthesis.onvoiceschanged = initVoices;

    return () => {
      if (speakTimeoutRef.current !== null) {
        window.clearTimeout(speakTimeoutRef.current);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Prioritas suara cewek terbaik: Google US English (Chrome), Samantha/Ava (iPhone Safari), Microsoft Zira/Jenny (Windows)
  const getBestFemaleVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const allVoices =
      voicesRef.current.length > 0
        ? voicesRef.current
        : window.speechSynthesis.getVoices();

    if (!allVoices || allVoices.length === 0) return null;

    const englishVoices = allVoices.filter(
      (v) => v.lang && (v.lang.toLowerCase().startsWith('en-') || v.lang.toLowerCase() === 'en')
    );
    const pool = englishVoices.length > 0 ? englishVoices : allVoices;

    const priorityFemaleVoices = [
      'google us english',
      'samantha',
      'ava',
      'microsoft zira',
      'microsoft jenny',
      'google uk english female',
      'microsoft aria',
      'microsoft sonia',
      'karen',
      'victoria',
      'moira',
      'tessa',
      'allison',
      'susan',
      'female',
    ];

    const maleBlacklist = [
      'david',
      'mark',
      'daniel',
      'alex',
      'fred',
      'george',
      'guy',
      'james',
      'richard',
      'christopher',
      'eric',
      'ryan',
      'male',
    ];

    for (const target of priorityFemaleVoices) {
      const found = pool.find((v) => {
        const nameLower = v.name.toLowerCase();
        const isMale = maleBlacklist.some((m) => nameLower.includes(m));
        return nameLower.includes(target) && !isMale;
      });
      if (found) return found;
    }

    const nonMaleFallback = pool.find((v) => {
      const nameLower = v.name.toLowerCase();
      return !maleBlacklist.some((m) => nameLower.includes(m));
    });

    return nonMaleFallback || pool[0] || null;
  };

  // Fungsi speakEnglish(text) sesuai spesifikasi FIX BUG 2B:
  // - Pakai cancel() dulu biar gak numpuk
  // - Fix iPhone/Mobile: hanya keluar setelah onClick langsung + setTimeout 100ms
  // - Intonasi: rate=0.85 (santai), pitch=1.15 (cewek muda warm), volume=1, lang='en-US'
  // - Error handling: jika not-allowed, minta klik 2x tombol 🔊
  const speakEnglish = (text: string) => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setVoiceWarning('Browser perangkat ini belum mendukung fitur suara Web Speech API.');
        return;
      }

      setVoiceWarning(null);

      if (speakTimeoutRef.current !== null) {
        window.clearTimeout(speakTimeoutRef.current);
      }

      // Cancel antrean suara sebelumnya agar tidak bertumpuk
      window.speechSynthesis.cancel();
      if (typeof window.speechSynthesis.resume === 'function') {
        window.speechSynthesis.resume();
      }

      setSpeakingText(text);

      speakTimeoutRef.current = window.setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          const selectedVoice = getBestFemaleVoice();

          utterance.lang = 'en-US';
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            if (selectedVoice.lang && selectedVoice.lang.toLowerCase().startsWith('en')) {
              utterance.lang = selectedVoice.lang;
            }
          }

          // Setting intonasi santai & suara cewek muda warm (bukan robot kaku)
          utterance.rate = 0.85;
          utterance.pitch = 1.15;
          utterance.volume = 1;

          utterance.onend = () => {
            setSpeakingText((prev) => (prev === text ? null : prev));
          };

          utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
            setSpeakingText(null);
            if (event.error === 'not-allowed' || event.error === 'audio-busy') {
              setVoiceWarning(
                'Suara tertahan izin perangkat (iPhone/Mobile). Silakan klik 2x tombol 🔊 untuk mengaktifkan suara Mimi.'
              );
            }
          };

          window.speechSynthesis.speak(utterance);
        } catch {
          setSpeakingText(null);
        }
      }, 100);
    } catch {
      setSpeakingText(null);
    }
  };

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const filteredDaily = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return DAILY_CONVERSATION_VOCAB.filter((item) => {
      if (selectedJenjang !== 'SEMUA' && item.jenjang !== selectedJenjang) return false;
      if (!q) return true;
      return (
        item.english.toLowerCase().includes(q) ||
        item.indonesian.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        item.exampleEn.toLowerCase().includes(q) ||
        item.exampleId.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedJenjang]);

  const filteredFormal = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FORMAL_ACADEMIC_VOCAB.filter((item) => {
      if (selectedJenjang !== 'SEMUA' && item.jenjang !== selectedJenjang) return false;
      if (!q) return true;
      return (
        item.formalWord.toLowerCase().includes(q) ||
        item.informalEquivalent.toLowerCase().includes(q) ||
        item.indonesian.toLowerCase().includes(q) ||
        item.context.toLowerCase().includes(q) ||
        item.exampleEn.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedJenjang]);

  const filteredVerbs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return VERB_123_LIST.filter((item) => {
      if (selectedJenjang !== 'SEMUA' && item.jenjang !== selectedJenjang) return false;
      const matchesType = verbFilter === 'ALL' || item.type === verbFilter;
      if (!matchesType) return false;
      if (!q) return true;
      return (
        item.v1.toLowerCase().includes(q) ||
        item.v2.toLowerCase().includes(q) ||
        item.v3.toLowerCase().includes(q) ||
        item.vIng.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.examplePastOrPerfect.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, verbFilter, selectedJenjang]);

  const filteredDialogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CONVERSATION_DIALOGS_LIST.filter((item) => {
      if (selectedJenjang !== 'SEMUA' && item.jenjang !== selectedJenjang) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.situation.toLowerCase().includes(q) ||
        item.speakerA.toLowerCase().includes(q) ||
        item.speakerAId.toLowerCase().includes(q) ||
        item.speakerB.toLowerCase().includes(q) ||
        item.speakerBId.toLowerCase().includes(q) ||
        item.keyPhrase.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedJenjang]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-5xl card-study rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 space-y-4 my-0 sm:my-auto max-h-[92dvh] overflow-y-auto shadow-2xl border border-slate-800"
        >
          {/* Header (Strictly Internal Attribution Only) */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-sky-400 font-bold">
                <BookOpen className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  Kamus Bahasa Inggris Terpadu ({TOTAL_DICTIONARY_ENTRIES_COUNT}+ Kosakata &amp; Percakapan) · Kurikulum Merdeka
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <button
                  type="button"
                  onClick={() =>
                    speakEnglish(
                      'Hello! I am Mimi. Let us practice English vocabulary and natural conversations together!'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/40 text-pink-300 text-[11px] font-bold transition-colors cursor-pointer"
                  title="Klik untuk mengetes suara cewek Mimi"
                >
                  <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                  <span>🔊 Tes Suara Cewek Mimi (en-US Warm)</span>
                </button>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Kamus Pintar Bahasa Inggris (SD, SMP, SMA, SMK &amp; Umum)
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dilengkapi <strong className="text-slate-200">{TOTAL_DICTIONARY_ENTRIES_COUNT}+ kosakata aktif</strong>, ungkapan percakapan natural sehari-hari, kosakata akademik formal, Verb 1-2-3, dan dialog kontekstual dengan pelafalan suara cewek Mimi yang santai dan jelas di PC, HP, maupun Tablet.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Tutup Kamus Bahasa Inggris"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Not-Allowed / Mobile Audio Warning Banner */}
          {voiceWarning && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-bold">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{voiceWarning}</span>
              </div>
              <button
                type="button"
                onClick={() => setVoiceWarning(null)}
                className="text-amber-300 hover:text-white text-[11px] underline shrink-0"
              >
                Tutup
              </button>
            </div>
          )}

          {/* 4 Main Category Selector Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('DAILY')}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 ${
                activeTab === 'DAILY'
                  ? 'bg-sky-500/20 border-sky-400 text-white shadow-md'
                  : 'bg-[#0B101E] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold truncate">
                    1. Kosakata Harian
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {DAILY_CONVERSATION_VOCAB.length} Ungkapan Natural
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('DIALOGS')}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 ${
                activeTab === 'DIALOGS'
                  ? 'bg-pink-500/20 border-pink-400 text-white shadow-md'
                  : 'bg-[#0B101E] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center shrink-0">
                  <MessagesSquare className="w-4 h-4 text-pink-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold truncate">
                    2. Dialog Percakapan
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {CONVERSATION_DIALOGS_LIST.length} Situasi Nyata
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('FORMAL')}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 ${
                activeTab === 'FORMAL'
                  ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                  : 'bg-[#0B101E] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold truncate">
                    3. Kosakata Formal
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {FORMAL_ACADEMIC_VOCAB.length} Kata Akademik
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('VERBS')}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 ${
                activeTab === 'VERBS'
                  ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                  : 'bg-[#0B101E] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold truncate">
                    4. Kamus Verb 1-2-3
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {VERB_123_LIST.length} Kata Kerja
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Filter Jenjang (SD, SMP, SMA, SMK, UMUM) + Search Bar */}
          <div className="space-y-2.5 bg-[#0B101E] p-3.5 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 mr-1">
                  Filter Jenjang:
                </span>
                {JENJANG_OPTIONS.map((jenjangOpt) => (
                  <button
                    key={jenjangOpt}
                    type="button"
                    onClick={() => setSelectedJenjang(jenjangOpt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-colors ${
                      selectedJenjang === jenjangOpt
                        ? 'bg-sky-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {jenjangOpt === 'SEMUA' ? 'Semua Jenjang' : jenjangOpt}
                  </button>
                ))}
              </div>

              {activeTab === 'VERBS' && (
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {(['ALL', 'Irregular', 'Regular'] as const).map((typeOpt) => (
                    <button
                      key={typeOpt}
                      type="button"
                      onClick={() => setVerbFilter(typeOpt)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap ${
                        verbFilter === typeOpt
                          ? 'bg-amber-400 text-slate-950 font-extrabold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {typeOpt === 'ALL'
                        ? 'Semua Verb'
                        : typeOpt === 'Irregular'
                        ? 'Irregular'
                        : 'Regular (-ed)'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'VERBS'
                    ? 'Cari Verb 1, Verb 2, Verb 3, atau arti Bahasa Indonesia (contoh: go, went, makan, write, build)...'
                    : activeTab === 'DIALOGS'
                    ? 'Cari topik percakapan sehari-hari (contoh: sekolah, kantin, wawancara, bandara, debat)...'
                    : 'Cari kosakata Bahasa Inggris, arti Bahasa Indonesia, atau contoh kalimat...'
                }
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* TAB 1 CONTENT: KOSAKATA PERCAKAPAN SEHARI-HARI */}
          {activeTab === 'DAILY' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Menampilkan <strong className="text-white font-mono tabular-nums">{filteredDaily.length}</strong> kosakata &amp; ungkapan percakapan sehari-hari
                </span>
                <span className="text-sky-400 font-semibold">
                  Klik tombol 🔊 untuk mendengar pelafalan
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[48vh] overflow-y-auto pr-1">
                {filteredDaily.map((item) => {
                  const isSpeakingWord = speakingText === item.english;
                  const isSpeakingSentence = speakingText === item.exampleEn;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#0B101E] border border-slate-800 hover:border-sky-500/50 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-black text-white">
                                {item.english}
                              </span>
                              <span className="text-xs font-mono text-sky-400">
                                {item.pronunciation}
                              </span>
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                                {item.jenjang}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">
                              Artinya: {item.indonesian}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30">
                              {item.topic}
                            </span>
                            <button
                              type="button"
                              onClick={() => speakEnglish(item.english)}
                              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                isSpeakingWord
                                  ? 'bg-pink-500 text-white border-pink-400'
                                  : 'bg-slate-900 hover:bg-sky-500/20 text-sky-400 border-slate-800'
                              }`}
                              title="Dengarkan pengucapan kata (Suara Cewek Mimi)"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText(
                                  item.id,
                                  `${item.english} (${item.indonesian}) - Contoh: ${item.exampleEn}`
                                )
                              }
                              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                              title="Salin kosakata"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-xs text-slate-200 font-medium">
                              &ldquo;{item.exampleEn}&rdquo;
                            </div>
                            <button
                              type="button"
                              onClick={() => speakEnglish(item.exampleEn)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
                                isSpeakingSentence
                                  ? 'bg-pink-500 text-white'
                                  : 'bg-slate-800 hover:bg-sky-500/20 text-sky-300'
                              }`}
                              title="Dengarkan kalimat contoh"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Kalimat</span>
                            </button>
                          </div>
                          <div className="text-[11px] text-slate-400 italic">
                            &ldquo;{item.exampleId}&rdquo;
                          </div>
                        </div>
                      </div>

                      {onAskMimiTopic && (
                        <div className="flex items-center justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onAskMimiTopic(
                                `Mimi, buatkan 3 contoh percakapan pendek sehari-hari menggunakan ungkapan Bahasa Inggris "${item.english}" (${item.indonesian}) beserta terjemahannya!`
                              );
                            }}
                            className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Latih Percakapan Ini Bareng Mimi</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT: DIALOG PERCAKAPAN KONTEKSTUAL */}
          {activeTab === 'DIALOGS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Menampilkan <strong className="text-white font-mono tabular-nums">{filteredDialogs.length}</strong> dialog percakapan Bahasa Inggris kontekstual
                </span>
                <span className="text-pink-400 font-semibold">
                  Klik 🔊 di tiap baris dialog untuk mendengar intonasi percakapan
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[48vh] overflow-y-auto pr-1">
                {filteredDialogs.map((dlg) => (
                  <div
                    key={dlg.id}
                    className="p-4 rounded-2xl bg-[#0B101E] border border-slate-800 hover:border-pink-500/50 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-pink-500/15 text-pink-300 border border-pink-500/30">
                              {dlg.jenjang}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              {dlg.situation}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-black text-white mt-1">
                            {dlg.title}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            speakEnglish(`${dlg.speakerA} ... ${dlg.speakerB}`)
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-400/40 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                          title="Putar seluruh dialog percakapan"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                          <span>Putar Dialog</span>
                        </button>
                      </div>

                      {/* Speaker A */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs font-bold text-sky-300">
                            A: &ldquo;{dlg.speakerA}&rdquo;
                          </div>
                          <button
                            type="button"
                            onClick={() => speakEnglish(dlg.speakerA)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-sky-400 shrink-0 cursor-pointer"
                            title="Dengarkan kalimat A"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-400 italic">
                          &ldquo;{dlg.speakerAId}&rdquo;
                        </div>
                      </div>

                      {/* Speaker B */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs font-bold text-emerald-300">
                            B: &ldquo;{dlg.speakerB}&rdquo;
                          </div>
                          <button
                            type="button"
                            onClick={() => speakEnglish(dlg.speakerB)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 shrink-0 cursor-pointer"
                            title="Dengarkan kalimat B"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-400 italic">
                          &ldquo;{dlg.speakerBId}&rdquo;
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-400">
                        Frasa Kunci:{' '}
                        <strong className="text-amber-300">{dlg.keyPhrase}</strong>
                      </span>
                      {onAskMimiTopic && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onAskMimiTopic(
                              `Mimi, ayo kita roleplay percakapan Bahasa Inggris tentang "${dlg.title}" menggunakan frasa "${dlg.keyPhrase}"!`
                            );
                          }}
                          className="font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Roleplay Bareng Mimi</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3 CONTENT: KOSAKATA FORMAL & AKADEMIK */}
          {activeTab === 'FORMAL' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Menampilkan <strong className="text-white font-mono tabular-nums">{filteredFormal.length}</strong> kosakata formal untuk esai, pidato, karya tulis &amp; ujian
                </span>
                <span className="text-emerald-400 font-semibold">
                  Dilengkapi perbandingan Kata Santai vs Kata Formal
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[48vh] overflow-y-auto pr-1">
                {filteredFormal.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#0B101E] border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-black text-emerald-400">
                              {item.formalWord}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              {item.pronunciation}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              Setara: {item.informalEquivalent}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              {item.jenjang}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-white mt-1">
                            Artinya: {item.indonesian}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => speakEnglish(item.formalWord)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-500/20 text-emerald-400 border border-slate-800 transition-colors cursor-pointer"
                            title="Dengarkan pengucapan kata formal"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyText(
                                item.id,
                                `${item.formalWord} (Formal dari "${item.informalEquivalent}") = ${item.indonesian}. Contoh: ${item.exampleEn}`
                              )
                            }
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                            title="Salin kosakata formal"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                            Konteks: {item.context}
                          </div>
                          <button
                            type="button"
                            onClick={() => speakEnglish(item.exampleEn)}
                            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Dengar Kalimat</span>
                          </button>
                        </div>
                        <div className="text-xs text-slate-200 font-medium">
                          &ldquo;{item.exampleEn}&rdquo;
                        </div>
                        <div className="text-[11px] text-slate-400 italic">
                          &ldquo;{item.exampleId}&rdquo;
                        </div>
                      </div>
                    </div>

                    {onAskMimiTopic && (
                      <div className="flex items-center justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onAskMimiTopic(
                              `Mimi, jelaskan cara memakai kata formal Bahasa Inggris "${item.formalWord}" (${item.indonesian}) dalam penulisan paragraf akademik beserta 2 contoh kalimatnya!`
                            );
                          }}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Minta Contoh Kalimat Esai ke Mimi</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4 CONTENT: KAMUS VERB 1, VERB 2, VERB 3 */}
          {activeTab === 'VERBS' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span>
                  Menampilkan <strong className="text-white font-mono tabular-nums">{filteredVerbs.length}</strong> kata kerja (Verb 1 = Present, Verb 2 = Past, Verb 3 = Past Participle)
                </span>
                <span className="text-amber-400 font-semibold">
                  Klik tombol 🔊 untuk mendengar pelafalan V1 - V2 - V3
                </span>
              </div>

              <div className="overflow-x-auto max-h-[48vh] overflow-y-auto rounded-2xl border border-slate-800 bg-[#0B101E]">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-300 z-10">
                    <tr>
                      <th className="py-3 px-3.5">Verb 1 (Base)</th>
                      <th className="py-3 px-3.5">Verb 2 (Past)</th>
                      <th className="py-3 px-3.5">Verb 3 (Participle)</th>
                      <th className="py-3 px-3.5">V-ing</th>
                      <th className="py-3 px-3.5">Arti Indonesia</th>
                      <th className="py-3 px-3.5">Tipe &amp; Contoh Kalimat</th>
                      <th className="py-3 px-3.5 text-center">Suara</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-xs sm:text-sm">
                    {filteredVerbs.map((verb) => (
                      <tr
                        key={verb.id}
                        className="hover:bg-slate-900/60 transition-colors"
                      >
                        <td className="py-3 px-3.5 font-black text-white whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{verb.v1}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {verb.jenjang}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-bold text-amber-400 whitespace-nowrap">
                          {verb.v2}
                        </td>
                        <td className="py-3 px-3.5 font-bold text-sky-400 whitespace-nowrap">
                          {verb.v3}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-xs text-slate-300 whitespace-nowrap">
                          {verb.vIng}
                        </td>
                        <td className="py-3 px-3.5 font-bold text-emerald-400">
                          {verb.meaning}
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex w-fit text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                verb.type === 'Irregular'
                                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                  : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                              }`}
                            >
                              {verb.type}
                            </span>
                            <span className="text-xs text-slate-400 italic">
                              &ldquo;{verb.examplePastOrPerfect}&rdquo;
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                speakEnglish(
                                  `${verb.v1.replace(/\s*\(.*?\)/g, '')}, ${verb.v2.replace(/\s*\(.*?\)/g, '')}, ${verb.v3.replace(/\s*\(.*?\)/g, '')}`
                                )
                              }
                              className="p-2 rounded-xl bg-slate-900 hover:bg-amber-500/20 text-amber-400 border border-slate-800 transition-colors cursor-pointer"
                              title="Dengarkan pelafalan V1, V2, V3"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Quick Info */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Tips Mimi: Klik tombol <strong className="text-white">🔊</strong> untuk mendengar pelafalan bersuara cewek muda yang santai dan natural, lalu ucapkan ulang secara lantang!
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors self-end sm:self-auto"
            >
              Selesai Membaca Kamus
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
