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

  return (
    <div className="space-y-6 sm:space-y-9 pb-16 sm:pb-12">
      {/* 1. Hero Student Welcome Card (Adaptive Smartphone & PC) */}
      <section className="p-5 sm:p-7 md:p-9 card-study space-y-5 sm:space-y-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-800/80 pb-5 sm:pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-sky-400 font-semibold tracking-wide">
              <span>MIMI — Asisten Belajar Masa Depan Indonesia</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">
                ● GuruMu, AsistenMu, Teman CurhatMu
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Halo bestie {uiState.studentName}! ✨ Semangat Belajar Hari Ini!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Sumber resmi Buku Paket Kemendikbud Kurikulum Merdeka (SD, SMP, SMA, SMK & Umum). Aktivitas terakhir:{' '}
              <span className="text-white font-semibold">
                {studyProgress.lastStudiedTopic}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => onAskMimiTopic('Halo Mimi!')}
              className="px-5 py-3 rounded-2xl btn-tactile-emerald font-extrabold text-xs flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Chat Bareng Mimi</span>
            </button>

            <div className="grid grid-cols-2 sm:flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenBookDriveHub}
                className="px-3.5 sm:px-4 py-3 rounded-2xl btn-tactile-slate font-extrabold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <FolderSync className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Buku PDF & Drive</span>
              </button>

              <button
                type="button"
                onClick={handleSharePublicWebsiteLink}
                className="px-3.5 sm:px-4 py-3 rounded-2xl btn-tactile-sky font-extrabold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                title="Salin link website publik yang bisa langsung dilihat semua orang"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span>Bagikan Link</span>
              </button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => onNavigateTab(BottomNavTab.CURHAT)}
            className="p-5 rounded-2xl bg-[#0B101E] border-2 border-slate-800 hover:border-pink-400/60 text-left transition-all flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-pink-400 flex items-center gap-1.5">
                <Heart className="w-4 h-4" />
                <span>Kolom Cerita Santai & Curhat</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-1">
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
            className="p-5 rounded-2xl bg-[#0B101E] border-2 border-slate-800 hover:border-sky-400/60 text-left transition-all flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-sky-400 flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                <span>Kolom Belajar Coding</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-1">
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
            className="p-5 rounded-2xl bg-[#0B101E] border-2 border-slate-800 hover:border-emerald-400/60 text-left transition-all flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Unduh Buku PDF & Google Drive</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-1">
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

      {/* 3. Interactive Learning Path Units with Smooth Framer Motion Level Transition */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white">
              Modul Buku Resmi & Simulasi ({uiState.selectedEducationLevel})
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Setiap unit dilengkapi rujukan buku resmi Kemendikdasmen, tombol Unduh PDF, dan laboratorium interaktif
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
            {completedCount} dari {levels.length} Unit Selesai
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${uiState.selectedEducationLevel}-${uiState.selectedClass}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
                    <span>Unduh Materi PDF</span>
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
        </AnimatePresence>
      </section>

      {/* 4. Custom Learning Milestones Tracker */}
      <section className="p-7 card-study space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-white">
              Jurnal Target Belajar Harian
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Catat target belajar yang sudah kamu capai hari ini untuk klaim bonus XP
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-sky-400 tabular-nums">
            Total {milestones.length} Catatan
          </span>
        </div>

        <form
          onSubmit={handleCreateMilestone}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3.5"
        >
          <div className="sm:col-span-7">
            <input
              type="text"
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
              placeholder="Contoh: Membaca bab pecahan dari buku Kemendikdasmen..."
              className="w-full px-4 py-3 text-xs sm:text-sm bg-[#0B101E] border-2 border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>
          <div className="sm:col-span-3">
            <select
              aria-label="Target XP"
              value={milestoneXp}
              onChange={(e) => setMilestoneXp(Number(e.target.value))}
              className="w-full px-3.5 py-3 text-xs sm:text-sm font-mono bg-[#0B101E] border-2 border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-400 tabular-nums"
            >
              <option value={25}>Target Ringan (+25 XP)</option>
              <option value={40}>Target Reguler (+40 XP)</option>
              <option value={60}>Target Intensif (+60 XP)</option>
              <option value={80}>Target Proyek (+80 XP)</option>
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

        <div className="divide-y divide-slate-800/80">
          {milestones.map((ms) => (
            <div
              key={ms.id}
              className="py-4 flex items-center justify-between gap-4 text-xs sm:text-sm"
            >
              <div className="space-y-1 min-w-0">
                <div className="font-bold text-slate-100 truncate">{ms.title}</div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>{ms.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ms.createdAt}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">
                    +{ms.xpGain} XP
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDeleteMilestone(ms.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
                aria-label="Hapus catatan"
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
    </div>
  );
};
