import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Play,
  Plus,
  Trash2,
  MessageSquare,
  Sliders,
  RotateCcw,
  X,
  ArrowRight,
  BookOpen,
  Download,
  ExternalLink,
  Heart,
  Code2,
  FolderSync,
  Share2,
  Sparkles,
} from 'lucide-react';
import {
  BottomNavTab,
  EducationLevel,
  LearningMilestone,
  LevelItem,
  MimiUiState,
  StudyProgress,
} from '../../types/mimi';
import { CLASSES_BY_LEVEL, SUBJECTS_BY_LEVEL } from '../../data/curriculumData';
import { downloadGeneratedModulePdf } from '../../services/googleDriveService';

interface HomeScreenProps {
  uiState: MimiUiState;
  levels: LevelItem[];
  studyProgress: StudyProgress;
  milestones: LearningMilestone[];
  onSelectEducationLevel: (level: EducationLevel) => void;
  onSelectClass: (cls: string) => void;
  onSelectSubject: (subject: string) => void;
  onToggleProfesorMode: () => void;
  onLevelClick: (levelItem: LevelItem) => void;
  onCompleteLevel: (levelItem: LevelItem) => void;
  onCloseLevelModal: () => void;
  onAskMimiTopic: (topicPrompt: string) => void;
  onAddMilestone: (title: string, xp: number) => void;
  onDeleteMilestone: (id: string) => void;
  onNavigateTab: (tab: BottomNavTab) => void;
  onOpenBookDriveHub: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  uiState,
  levels,
  studyProgress,
  milestones,
  onSelectEducationLevel,
  onSelectClass,
  onSelectSubject,
  onToggleProfesorMode,
  onLevelClick,
  onCompleteLevel,
  onCloseLevelModal,
  onAskMimiTopic,
  onAddMilestone,
  onDeleteMilestone,
  onNavigateTab,
  onOpenBookDriveHub,
}) => {
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneXp, setMilestoneXp] = useState(40);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const activeModal = uiState.activeLevelModal;
  const [simValue, setSimValue] = useState<number>(
    activeModal?.simulation.defaultValue ?? 5
  );
  const [selectedPracticeOpt, setSelectedPracticeOpt] = useState<number | null>(
    null
  );

  const openModuleModal = (item: LevelItem) => {
    setSimValue(item.simulation.defaultValue);
    setSelectedPracticeOpt(null);
    onLevelClick(item);
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = milestoneTitle.trim();
    if (!trimmed) return;
    onAddMilestone(trimmed, milestoneXp);
    setMilestoneTitle('');
  };

  // Duolingo Stepping Path & Dola Task Sync states
  const [isDuoPathView, setIsDuoPathView] = useState<boolean>(true);
  const [duoNodeModal, setDuoNodeModal] = useState<LevelItem | null>(null);
  const [isGoogleTasksModalOpen, setIsGoogleTasksModalOpen] = useState<boolean>(false);
  const [tasksSyncToast, setTasksSyncToast] = useState<string | null>(null);

  const availableClasses = CLASSES_BY_LEVEL[uiState.selectedEducationLevel] || [];
  const availableSubjects = SUBJECTS_BY_LEVEL[uiState.selectedEducationLevel] || [];
  const completedCount = levels.filter((l) =>
    studyProgress.completedLevelIds.includes(l.id)
  ).length;

  const handleSharePublicWebsiteLink = async () => {
    const publicUrl = window.location.origin;
    const shareText = `Yuk belajar seru bareng MIMI - Asisten Belajar Masa Depan Indonesia ("Asisten BelajarMu - GuruMu, AsistenMu, Teman CurhatMu")! Klik langsung tanpa ribet: ${publicUrl}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'MIMI — Asisten Belajar Masa Depan Indonesia',
          text: shareText,
          url: publicUrl,
        });
      } else {
        await navigator.clipboard.writeText(publicUrl);
      }
      setShareToast('Link Website Publik berhasil disalin! Siapa pun yang membuka link ini bisa langsung melihat & belajar.');
      setTimeout(() => setShareToast(null), 4500);
    } catch {
      try {
        await navigator.clipboard.writeText(publicUrl);
        setShareToast('Link Website Publik berhasil disalin! Siapa pun bisa langsung mengakses website ini.');
        setTimeout(() => setShareToast(null), 4500);
      } catch {
        // Ignore
      }
    }
  };

  const handleSyncGoogleTasksText = async () => {
    const targetListText = milestones
      .map((m, idx) => `${idx + 1}. [${m.completed ? '✓' : ' '}] ${m.title} (+${m.xpGain} XP)`)
      .join('\n');
    const fullPayload = `📋 TARGET BELAJAR HARIAN MIMI V15 (${uiState.selectedEducationLevel} · ${uiState.selectedClass})\n\n${targetListText || 'Belum ada target harian.'}\n\nDisusun oleh Asisten Belajar MIMI (Kemendikbud Kurikulum Merdeka)`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullPayload);
      }
      setTasksSyncToast('Daftar target berhasil diformat & disalin untuk Google Tasks!');
      setTimeout(() => setTasksSyncToast(null), 4000);
    } catch {
      setTasksSyncToast('Format target siap disinkronkan ke Google Tasks.');
      setTimeout(() => setTasksSyncToast(null), 4000);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-9 pb-16 sm:pb-12">
      {/* 1. Hero Student Welcome Card (Adaptive Smartphone & PC) */}
      <section className="p-6 sm:p-8 card-study space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch border-b border-slate-800/80 pb-6">
          {/* Left Hero Column: Greeting & Action Hub (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-sky-400 font-semibold tracking-wide">
                <span>MIMI — Asisten Belajar Masa Depan Indonesia</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-bold">
                  ● GuruMu, AsistenMu, Teman CurhatMu
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
                Halo bestie {uiState.studentName}! ✨ Semangat Belajar Hari Ini!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Sumber resmi Buku Paket Kemendikbud Kurikulum Merdeka (SD, SMP, SMA, SMK & Umum). Aktivitas terakhir:{' '}
                <span className="text-white font-semibold">
                  {studyProgress.lastStudiedTopic}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onAskMimiTopic('Halo Mimi!')}
                className="px-5 py-3 rounded-2xl btn-tactile-emerald font-extrabold text-xs flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-lg"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Chat Bareng Mimi</span>
              </button>

              <button
                type="button"
                onClick={onOpenBookDriveHub}
                className="px-4 py-3 rounded-2xl btn-tactile-slate font-extrabold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <FolderSync className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Buku PDF & Drive</span>
              </button>

              <button
                type="button"
                onClick={handleSharePublicWebsiteLink}
                className="px-4 py-3 rounded-2xl btn-tactile-sky font-extrabold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                title="Salin link website publik yang bisa langsung dilihat semua orang"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span>Bagikan Link</span>
              </button>
            </div>
          </div>

          {/* Right Hero Column: Cyber Progress & Status Widget (5 cols on PC) */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#0B101E] border-2 border-slate-800 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="text-xs font-extrabold text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Status Pelajar Mimi V15</span>
              </div>
              <span className="font-mono text-xs font-extrabold text-emerald-400 tabular-nums">
                Level {uiState.level}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Target XP Level Berikutnya</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  {uiState.xp} / {(uiState.level + 1) * 150} XP
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
                <motion.div
                  className="h-full bg-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      100,
                      Math.round(((uiState.xp % 150) / 150) * 100)
                    )}%`,
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Rank Cyber</div>
                <div className="text-xs font-extrabold text-sky-300 truncate mt-0.5">
                  {uiState.cyberRank}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Streak Belajar</div>
                <div className="text-xs font-extrabold text-amber-300 font-mono tabular-nums mt-0.5">
                  {uiState.streakDays} Hari
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Unit Selesai</div>
                <div className="text-xs font-extrabold text-emerald-300 font-mono tabular-nums mt-0.5">
                  {completedCount} / {levels.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {shareToast && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-600/60 text-xs font-bold text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>✅ {shareToast}</span>
            <span className="font-mono text-[11px] text-emerald-300 break-all">
              {typeof window !== 'undefined' ? window.location.origin : ''}
            </span>
          </div>
        )}

        {/* 3 Featured Hub Cards: Curhat Manusiawi, Belajar Coding, & Katalog Buku PDF Kemendikdasmen/Drive */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          <button
            type="button"
            onClick={() => onNavigateTab(BottomNavTab.CURHAT)}
            className="p-5 sm:p-6 rounded-2xl bg-[#0B101E] border-2 border-slate-800 hover:border-pink-400/60 text-left transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-pink-400 flex items-center gap-1.5">
                <Heart className="w-4 h-4" />
                <span>Kolom Cerita Santai & Curhat</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pink-400 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <div className="text-sm font-extrabold text-white">
                Teman Cerita yang Peka & Manusiawi
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lagi capek belajar, kepikiran sesuatu, atau cuma pengen ngobrol santai? Curhat ke Mimi di sini.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab(BottomNavTab.CODING)}
            className="p-5 sm:p-6 rounded-2xl bg-[#0B101E] border-2 border-slate-800 hover:border-sky-400/60 text-left transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-sky-400 flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                <span>Kolom Belajar Coding</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <div className="text-sm font-extrabold text-white">
                Praktik JavaScript, Python & Web
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Editor kode interaktif lengkap dengan buku resmi PPLG Kemendikdasmen, MDN, & Eloquent JS.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenBookDriveHub}
            className="p-5 sm:p-6 rounded-2xl bg-[#0B101E] border-2 border-slate-800 hover:border-emerald-400/60 text-left transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Unduh Buku PDF & Google Drive</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <div className="text-sm font-extrabold text-white">
                Katalog Kemendikdasmen & Link Drive
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unduh materi PDF SD–SMA/SMK dan sinkronisasi otomatis dari link folder Google Drive & Classroom.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* 2. Hierarchy Selection: Tingkatan (SD / SMP / SMA / SMK / UMUM) -> Kelas -> Mata Pelajaran + Mimi Profesor Mode */}
      <section className="p-5 sm:p-7 card-study space-y-4 sm:space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Pilih Tingkatan, Kelas & Mata Pelajaran (SD, SMP, SMA, SMK & Umum)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Sumber Wajib: Buku Paket Resmi Kemendikbud Kurikulum Merdeka (
              <a
                href="https://buku.kemendikdasmen.go.id/daftar-katalog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline"
              >
                buku.kemendikdasmen.go.id
              </a>
              ) · Matematika = 3 Langkah + 3 Opsi A/B/C · Mapel Lain = Clue + Kisi + Sumber + Analogi Seru
            </p>
          </div>

          {/* Interactive Segmented Control for SD / SMP / SMA / SMK / UMUM (Swipeable on Smartphone, Wrapped on PC) */}
          <div className="w-full lg:w-auto overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 p-1.5 bg-[#0B101E] border-2 border-slate-800 rounded-2xl w-max sm:w-auto">
              {[
                { id: EducationLevel.SD, label: 'SD (1–6)' },
                { id: EducationLevel.SMP, label: 'SMP (7–9)' },
                { id: EducationLevel.SMA, label: 'SMA (10–12)' },
                { id: EducationLevel.SMK, label: 'SMK (10–12)' },
                { id: EducationLevel.UMUM, label: 'UMUM / Random' },
              ].map((item) => {
                const isSelected = uiState.selectedEducationLevel === item.id;
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onSelectEducationLevel(item.id)}
                    className={`relative px-3.5 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 overflow-hidden ${
                      isSelected
                        ? 'text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="homeEducationLevelPill"
                        className="absolute inset-0 bg-sky-400 rounded-xl"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: Class Buttons (Touch Swipeable on Mobile) */}
        <div className="pt-3 border-t border-slate-800/70 space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5">
          <span className="text-xs font-semibold text-slate-400 block sm:inline mr-2">
            1. Pilih Kelas:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap">
            {availableClasses.map((cls) => {
              const active = uiState.selectedClass === cls;
              return (
                <motion.button
                  key={cls}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectClass(cls)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 overflow-hidden ${
                    active
                      ? 'text-slate-950'
                      : 'bg-[#0B101E] text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="homeClassPill"
                      className="absolute inset-0 btn-tactile-sky rounded-xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cls}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Subject Buttons + Mimi Profesor Mode Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pt-3 border-t border-slate-800/70">
          <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-2 min-w-0">
            <span className="text-xs font-semibold text-slate-400 block sm:inline mr-1">
              2. Pilih Mapel:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap">
              {availableSubjects.map((subj) => {
                const active = uiState.selectedSubject === subj;
                return (
                  <motion.button
                    key={subj}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelectSubject(subj)}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 overflow-hidden ${
                      active
                        ? 'text-slate-950 font-extrabold'
                        : 'bg-[#0B101E] text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="homeSubjectPill"
                        className="absolute inset-0 bg-emerald-400 rounded-xl"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{subj}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:flex items-center gap-2 shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={onToggleProfesorMode}
              className={`px-4 py-2.5 sm:py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                uiState.isProfesorMode
                  ? 'bg-amber-400 text-slate-950 shadow-lg'
                  : 'bg-[#0B101E] text-amber-300 border border-amber-400/50 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>
                {uiState.isProfesorMode
                  ? 'Mimi Profesor Mode: AKTIF'
                  : 'Aktifkan Mimi Profesor Mode'}
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() =>
                onAskMimiTopic(
                  `Mimi Profesor, kasih aku HACK TRIK HAFAL & Jembatan Keledai buat mapel ${uiState.selectedSubject} (${uiState.selectedClass}) dong! 🚀`
                )
              }
              className="px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-300 text-center whitespace-nowrap shrink-0"
            >
              Minta Hack Hafal
            </motion.button>
          </div>
        </div>
      </section>

      {/* 3. Aesthetic Unit Banner & Duolingo Stepping Path vs. Compact Cards Switcher */}
      <section className="space-y-6">
        {/* Aesthetic Gradient Banner (Vibrant Teen/Gen-Z Aesthetic) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white shadow-2xl shadow-indigo-900/40 border-2 border-violet-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-sky-400/20 blur-2xl pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="text-xs font-mono font-extrabold uppercase tracking-widest text-violet-200 flex items-center gap-2">
              <span>UNIT 1 · {uiState.selectedEducationLevel} KELAS {uiState.selectedClass.toUpperCase().replace('KELAS ', '')}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-300 font-bold">Kurikulum Merdeka</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              {uiState.selectedSubject} — Kurikulum Merdeka
            </h2>
            <div className="text-xs sm:text-sm text-violet-100 font-medium flex items-center gap-3">
              <span>{completedCount} dari {levels.length} Unit Selesai</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono font-bold text-amber-300 tabular-nums">
                +{completedCount * 45} XP Didapat
              </span>
            </div>
          </div>

          {/* Duolingo Path vs Card View Switcher Segmented Control */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/60 backdrop-blur-md border border-white/20 rounded-2xl shrink-0 self-start sm:self-auto relative z-10">
            <button
              type="button"
              onClick={() => setIsDuoPathView(true)}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isDuoPathView
                  ? 'bg-sky-400 text-slate-950 shadow-md scale-105'
                  : 'text-violet-200 hover:text-white'
              }`}
            >
              <span>🛤️ Jalur Duo</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDuoPathView(false)}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                !isDuoPathView
                  ? 'bg-sky-400 text-slate-950 shadow-md scale-105'
                  : 'text-violet-200 hover:text-white'
              }`}
            >
              <span>🃏 Kartu</span>
            </button>
          </div>
        </div>

        {/* View Content: Either Duolingo Stepping Path or Compact Cards Grid */}
        <AnimatePresence mode="wait">
          {isDuoPathView ? (
            /* 🛤️ DUOLINGO STEPPING PATH VIEW (3D Tactile Nodes) */
            <motion.div
              key="duo-path"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-10 rounded-3xl bg-[#0D1326] border-2 border-indigo-900/50 flex flex-col items-center space-y-12 relative overflow-hidden"
            >
              <div className="text-center space-y-1 max-w-md">
                <div className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">
                  Jalur Peta Belajar Mimi (Duolingo Style)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ketuk node lingkaran di bawah untuk membuka pratinjau unit, simulasi laboratorium, dan klaim XP!
                </p>
              </div>

              {/* Stepping Path Nodes Stream */}
              <div className="w-full max-w-sm flex flex-col items-center space-y-10 relative">
                {levels.map((lvl, index) => {
                  const isDone = studyProgress.completedLevelIds.includes(lvl.id);
                  const isNextActive =
                    !isDone &&
                    (index === 0 ||
                      studyProgress.completedLevelIds.includes(levels[index - 1]?.id));

                  // Alternating horizontal offset pattern for winding path look
                  const offsetClasses =
                    index % 4 === 0
                      ? 'translate-x-0'
                      : index % 4 === 1
                      ? '-translate-x-12 sm:-translate-x-16'
                      : index % 4 === 2
                      ? 'translate-x-12 sm:translate-x-16'
                      : 'translate-x-0';

                  return (
                    <div
                      key={lvl.id}
                      className={`relative flex flex-col items-center transition-all ${offsetClasses}`}
                    >
                      {/* Active "Mulai Di Sini!" Floating Tooltip */}
                      {isNextActive && (
                        <motion.div
                          initial={{ y: -8, opacity: 0 }}
                          animate={{ y: [0, -6, 0], opacity: 1 }}
                          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                          className="absolute -top-11 z-20 px-3 py-1 rounded-xl bg-sky-400 text-slate-950 font-black text-[11px] shadow-lg shadow-sky-400/40 whitespace-nowrap flex items-center gap-1 border border-white/40"
                        >
                          <span>Mulai Di Sini! 🚀</span>
                        </motion.div>
                      )}

                      {/* 3D Tactile Node Button */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setDuoNodeModal(lvl)}
                        className={`relative z-10 flex items-center justify-center transition-all cursor-pointer ${
                          isDone
                            ? 'w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500 border-b-8 border-emerald-700 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-950/60'
                            : isNextActive
                            ? 'w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 border-b-8 border-sky-700 text-slate-950 font-black shadow-2xl shadow-sky-400/50 ring-4 ring-sky-400/30'
                            : 'w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800 border-b-8 border-slate-950 text-slate-400 hover:text-white hover:bg-slate-700 shadow-md'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        ) : isNextActive ? (
                          <div className="flex flex-col items-center">
                            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-slate-950 animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-tight text-slate-950 leading-none mt-1">
                              Unit 0{lvl.levelNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-base sm:text-lg font-black">
                            0{lvl.levelNumber}
                          </span>
                        )}
                      </motion.button>

                      {/* Node Label Below */}
                      <div className="text-center mt-2.5 max-w-[150px]">
                        <div className="text-xs font-extrabold text-white truncate">
                          {lvl.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                          +{lvl.xpReward} XP
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Final Trophy Exam Node */}
                <div className="relative flex flex-col items-center pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() =>
                      onAskMimiTopic(
                        `Mimi, aku mau ikutan Ujian Akhir Bab ${uiState.selectedSubject} (${uiState.selectedClass}) buat dapet Bonus +100 XP!`
                      )
                    }
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 border-b-8 border-amber-700 text-slate-950 font-black shadow-2xl shadow-amber-400/40 flex flex-col items-center justify-center cursor-pointer"
                  >
                    <span className="text-2xl leading-none">🏆</span>
                    <span className="text-[10px] font-black uppercase text-slate-950 mt-1">
                      Ujian Akhir
                    </span>
                  </motion.button>
                  <div className="text-center mt-2">
                    <div className="text-xs font-extrabold text-amber-300">
                      Tantangan Akhir Bab
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 font-bold tabular-nums">
                      +100 XP Bonus
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* 🃏 COMPACT CARDS GRID VIEW */
            <motion.div
              key="cards-grid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7"
            >
              {levels.map((lvl, index) => {
                const isDone = studyProgress.completedLevelIds.includes(lvl.id);
                return (
                  <motion.div
                    key={lvl.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: index * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="p-7 card-study hover:border-slate-700 transition-colors flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sky-400 font-extrabold tabular-nums">
                            Unit 0{lvl.levelNumber}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-300">
                            {lvl.subject}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{lvl.classRange}</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-extrabold tabular-nums">
                          +{lvl.xpReward} XP
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold text-white leading-snug">
                        {lvl.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {lvl.subtitle}
                      </p>

                      {/* Official Published Book Citation Badge */}
                      <div className="p-3.5 rounded-xl bg-[#0B101E] border border-slate-800/90 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-amber-400 font-bold">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 shrink-0" />
                            <span>Sumber Buku Teks Terbitan Resmi</span>
                          </span>
                          <a
                            href={lvl.bookSource.catalogUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:underline flex items-center gap-1 shrink-0"
                          >
                            <span>Katalog</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="text-xs font-bold text-slate-100 leading-snug">
                          {lvl.bookSource.title} ({lvl.bookSource.year})
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {lvl.bookSource.authorOrPublisher}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          downloadGeneratedModulePdf({
                            title: lvl.title,
                            level: lvl.educationLevel,
                            classRange: lvl.classRange,
                            subject: lvl.subject,
                            bookTitle: lvl.bookSource.title,
                            publisher: lvl.bookSource.authorOrPublisher,
                            catalogUrl: lvl.bookSource.catalogUrl,
                            summaryPoints: lvl.summaryPoints,
                            formula: lvl.simulation.formulaDisplay,
                          })
                        }
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Unduh PDF</span>
                      </button>

                      <div className="flex items-center gap-2.5">
                        {isDone && (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Tuntas</span>
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => openModuleModal(lvl)}
                          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap shrink-0 ${
                            isDone ? 'btn-tactile-slate' : 'btn-tactile-sky'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 shrink-0" />
                          <span>{isDone ? 'Ulangi Unit' : 'Mulai Belajar'}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 4. Dola-Style Daily Target & Google Tasks Integration */}
      <section className="p-6 sm:p-8 card-study space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <span>Target Harian Dola Style · Google Tasks Integration</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Target Belajar Harian & Sinkron Google Tasks
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Tandai target harian yang sudah selesai atau sinkronkan langsung ke Google Tasks
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsGoogleTasksModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl btn-tactile-sky text-xs font-extrabold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow"
          >
            <span>Sinkron Google Tasks</span>
          </button>
        </div>

        {tasksSyncToast && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-600/60 text-xs font-bold text-emerald-200">
            ✅ {tasksSyncToast}
          </div>
        )}

        {/* Inline Target Input Form */}
        <form
          onSubmit={handleCreateMilestone}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-8">
            <input
              type="text"
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
              placeholder="+ Tambah target belajar harian baru..."
              className="w-full px-4 py-3 text-xs sm:text-sm bg-[#0B101E] border-2 border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>
          <div className="sm:col-span-2">
            <select
              aria-label="Bonus XP Target"
              value={milestoneXp}
              onChange={(e) => setMilestoneXp(Number(e.target.value))}
              className="w-full px-3 py-3 text-xs font-mono bg-[#0B101E] border-2 border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-400 tabular-nums"
            >
              <option value={25}>+25 XP</option>
              <option value={40}>+40 XP</option>
              <option value={60}>+60 XP</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-full py-3 px-4 rounded-xl btn-tactile-emerald font-extrabold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Simpan</span>
            </button>
          </div>
        </form>

        {/* Target List with Tactile Checkbox Toggle */}
        <div className="space-y-2.5 divide-y divide-slate-800/80">
          {milestones.map((ms) => (
            <div
              key={ms.id}
              className="pt-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onDeleteMilestone(ms.id)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${
                    ms.completed
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black'
                      : 'bg-slate-900 border-slate-700 text-transparent hover:border-sky-400'
                  }`}
                  title={ms.completed ? 'Sudah tuntas' : 'Tandai tuntas'}
                >
                  ✓
                </button>
                <div className="min-w-0 space-y-0.5">
                  <div
                    className={`font-semibold text-slate-100 truncate ${
                      ms.completed ? 'line-through opacity-60' : ''
                    }`}
                  >
                    {ms.title}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>{ms.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono font-bold text-emerald-400 tabular-nums">
                      +{ms.xpGain} XP
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteMilestone(ms.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
                aria-label="Hapus target"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Interactive Two-Zone Sandbox Lesson & Simulation Modal (Bottom-Sheet on Mobile, Centered Dialog on PC) */}
      <AnimatePresence>
      {activeModal && (
        <motion.div
          key={activeModal.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="w-full max-w-4xl card-study rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 space-y-6 my-0 sm:my-auto max-h-[92dvh] overflow-y-auto shadow-2xl pb-safe"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="text-xs text-sky-400 font-bold flex items-center gap-2">
                  <span>Unit 0{activeModal.levelNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeModal.subject}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeModal.classRange}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {activeModal.title}
                </h2>
                <div className="text-xs text-slate-400">
                  Sumber Buku: <strong className="text-slate-200">{activeModal.bookSource.title}</strong> ({activeModal.bookSource.authorOrPublisher})
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseLevelModal}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Tutup modul"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Two-Zone Sandbox Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Zone: Interactive Visual Stage (7 cols) */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0B101E] border-2 border-slate-800 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="space-y-0.5">
                    <div className="text-xs text-slate-400">
                      Laboratorium Simulasi Interaktif
                    </div>
                    <div className="text-sm font-extrabold text-white">
                      {activeModal.simulation.title}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold tabular-nums ${
                      simValue === activeModal.simulation.targetValue
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {simValue === activeModal.simulation.targetValue
                      ? '● TARGET TERCAPAI'
                      : '▲ SESUAIKAN PARAMETER'}
                  </span>
                </div>

                {/* Dynamic Visual Proportion / Meter Stage */}
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="text-slate-300">
                      Nilai Saat Ini: {simValue} {activeModal.simulation.unit}
                    </span>
                    <span className="text-sky-400 font-bold">
                      Target Eksperimen: {activeModal.simulation.targetValue}{' '}
                      {activeModal.simulation.unit}
                    </span>
                  </div>

                  {/* Interactive Visual Bar Grid */}
                  <div className="h-14 w-full bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center gap-1.5">
                    {Array.from({ length: 12 }).map((_, idx) => {
                      const ratio =
                        (simValue - activeModal.simulation.min) /
                        Math.max(
                          1,
                          activeModal.simulation.max - activeModal.simulation.min
                        );
                      const activeBars = Math.max(1, Math.round(ratio * 12));
                      const isFilled = idx < activeBars;
                      const isTargetReached =
                        simValue === activeModal.simulation.targetValue;
                      return (
                        <div
                          key={idx}
                          className={`flex-1 h-full rounded-md transition-opacity duration-150 ${
                            isFilled
                              ? isTargetReached
                                ? 'bg-emerald-400 opacity-100'
                                : 'bg-sky-400 opacity-90'
                              : 'bg-slate-800/60 opacity-40'
                          }`}
                        />
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Persamaan Model:</span>
                    <code className="text-xs sm:text-sm font-mono font-bold text-sky-300 tabular-nums">
                      {activeModal.simulation.formulaDisplay}
                    </code>
                  </div>
                </div>

                {/* Labeled Slider with Current Value and Reset */}
                <div className="space-y-3 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="sim-slider"
                      className="font-bold text-slate-200 flex items-center gap-2"
                    >
                      <Sliders className="w-3.5 h-3.5 text-sky-400" />
                      <span>
                        {activeModal.simulation.parameterLabel}: {simValue}{' '}
                        {activeModal.simulation.unit}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setSimValue(activeModal.simulation.defaultValue)
                      }
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                  <input
                    id="sim-slider"
                    type="range"
                    min={activeModal.simulation.min}
                    max={activeModal.simulation.max}
                    step={activeModal.simulation.step}
                    value={simValue}
                    onChange={(e) => setSimValue(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeModal.simulation.explanation}
                  </p>
                </div>
              </div>

              {/* Right Zone: Concept Deck & Practice Verification (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                <div className="p-6 rounded-2xl bg-[#0B101E] border-2 border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-white">
                    Intisari Konsep Utama
                  </h3>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {activeModal.summaryPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="font-mono text-sky-400 font-bold tabular-nums">
                          0{i + 1}.
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Practice Check */}
                <div className="p-6 rounded-2xl bg-[#0B101E] border-2 border-slate-800 space-y-3.5">
                  <div className="text-xs font-bold text-sky-400">
                    Uji Pemahaman Cepat
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                    {activeModal.practiceQuestion.question}
                  </p>
                  <div className="space-y-2">
                    {activeModal.practiceQuestion.options.map((opt, idx) => {
                      const isPicked = selectedPracticeOpt === idx;
                      const isRight =
                        idx === activeModal.practiceQuestion.correctIndex;
                      let btnStyle =
                        'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700';
                      if (selectedPracticeOpt !== null) {
                        if (isRight) {
                          btnStyle =
                            'bg-emerald-950/70 border-emerald-500/60 text-emerald-200';
                        } else if (isPicked) {
                          btnStyle =
                            'bg-red-950/70 border-red-500/60 text-red-200';
                        }
                      }
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPracticeOpt(idx)}
                          className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs sm:text-sm transition-colors ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {selectedPracticeOpt !== null && (
                    <p className="text-xs text-slate-300 pt-2.5 border-t border-slate-800 leading-relaxed">
                      <span className="font-bold text-sky-400">Pembahasan: </span>
                      {activeModal.practiceQuestion.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-slate-800">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onCloseLevelModal();
                    onAskMimiTopic(
                      `Mimi, kasih aku kisi-kisi singkat buat memahami materi "${activeModal.title}" dong.`
                    );
                  }}
                  className="px-4 py-3 rounded-2xl btn-tactile-slate text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <MessageSquare className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Tanya Kisi-Kisi ke Mimi</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    downloadGeneratedModulePdf({
                      title: activeModal.title,
                      level: activeModal.educationLevel,
                      classRange: activeModal.classRange,
                      subject: activeModal.subject,
                      bookTitle: activeModal.bookSource.title,
                      publisher: activeModal.bookSource.authorOrPublisher,
                      catalogUrl: activeModal.bookSource.catalogUrl,
                      summaryPoints: activeModal.summaryPoints,
                      formula: activeModal.simulation.formulaDisplay,
                    })
                  }
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unduh PDF Materi Ini</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onCompleteLevel(activeModal)}
                className="px-6 py-3 rounded-2xl btn-tactile-emerald font-extrabold text-xs flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>Selesaikan Unit (+{activeModal.xpReward} XP)</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
      {/* 6. Duolingo Style Unit Node Preview Modal */}
      <AnimatePresence>
        {duoNodeModal && (
          <motion.div
            key={duoNodeModal.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="w-full max-w-md rounded-3xl bg-[#0D1326] border-2 border-indigo-500/60 p-6 space-y-5 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono font-extrabold text-sky-400">
                    Unit 0{duoNodeModal.levelNumber} · {duoNodeModal.subject}
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {duoNodeModal.title}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {duoNodeModal.bookSource.title} ({duoNodeModal.bookSource.authorOrPublisher})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDuoNodeModal(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B101E] border border-slate-800 space-y-2">
                <div className="text-xs font-extrabold text-amber-400">Intisari Materi:</div>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  {duoNodeModal.summaryPoints.slice(0, 3).map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-sky-400 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const targetItem = duoNodeModal;
                    setDuoNodeModal(null);
                    openModuleModal(targetItem);
                  }}
                  className="w-full py-3.5 rounded-2xl btn-tactile-sky font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Play className="w-4 h-4 shrink-0" />
                  <span>Mulai Belajar (+{duoNodeModal.xpReward} XP)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    downloadGeneratedModulePdf({
                      title: duoNodeModal.title,
                      level: duoNodeModal.educationLevel,
                      classRange: duoNodeModal.classRange,
                      subject: duoNodeModal.subject,
                      bookTitle: duoNodeModal.bookSource.title,
                      publisher: duoNodeModal.bookSource.authorOrPublisher,
                      catalogUrl: duoNodeModal.bookSource.catalogUrl,
                      summaryPoints: duoNodeModal.summaryPoints,
                      formula: duoNodeModal.simulation.formulaDisplay,
                    });
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unduh PDF Materi Ini</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. Dola Style Google Tasks Text Sync Dialog */}
      <AnimatePresence>
        {isGoogleTasksModalOpen && (
          <motion.div
            key="google-tasks-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="w-full max-w-lg rounded-3xl bg-[#0D1326] border-2 border-sky-500/60 p-6 sm:p-7 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <span>Integration Dola Style · Google Tasks API</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                    Sinkronkan Target ke Google Tasks
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Daftar target belajar harian disiapkan khusus untuk aplikasi Google Tasks
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGoogleTasksModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-extrabold text-slate-200">
                  Daftar Target Harian ({milestones.length} item):
                </div>
                <div className="p-4 rounded-2xl bg-[#0B101E] border border-slate-800 text-xs font-mono text-slate-200 space-y-2 max-h-48 overflow-y-auto">
                  {milestones.map((m, idx) => (
                    <div key={m.id} className="flex items-start gap-2">
                      <span className="text-sky-400 font-bold">{idx + 1}.</span>
                      <span className={m.completed ? 'line-through text-slate-500' : ''}>
                        [{m.completed ? '✓' : ' '}] {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await handleSyncGoogleTasksText();
                    setIsGoogleTasksModalOpen(false);
                  }}
                  className="w-full py-3.5 rounded-2xl btn-tactile-emerald font-extrabold text-xs flex items-center justify-center gap-2"
                >
                  <span>Salin & Format Google Tasks (+25 XP)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGoogleTasksModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
