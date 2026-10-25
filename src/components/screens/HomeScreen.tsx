import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  EducationLevel,
  LearningMilestone,
  LevelItem,
  MimiUiState,
  StudyProgress,
} from '../../types/mimi';
import { CLASSES_BY_LEVEL } from '../../data/curriculumData';

interface HomeScreenProps {
  uiState: MimiUiState;
  levels: LevelItem[];
  studyProgress: StudyProgress;
  milestones: LearningMilestone[];
  onSelectEducationLevel: (level: EducationLevel) => void;
  onSelectClass: (cls: string) => void;
  onLevelClick: (levelItem: LevelItem) => void;
  onCompleteLevel: (levelItem: LevelItem) => void;
  onCloseLevelModal: () => void;
  onAskMimiTopic: (topicPrompt: string) => void;
  onAddMilestone: (title: string, xp: number) => void;
  onDeleteMilestone: (id: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  uiState,
  levels,
  studyProgress,
  milestones,
  onSelectEducationLevel,
  onSelectClass,
  onLevelClick,
  onCompleteLevel,
  onCloseLevelModal,
  onAskMimiTopic,
  onAddMilestone,
  onDeleteMilestone,
}) => {
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneXp, setMilestoneXp] = useState(40);

  // Interactive modal states
  const activeModal = uiState.activeLevelModal;
  const [simValue, setSimValue] = useState<number>(activeModal?.simulation.defaultValue ?? 5);
  const [selectedPracticeOpt, setSelectedPracticeOpt] = useState<number | null>(null);

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
  const completedCount = levels.filter((l) =>
    studyProgress.completedLevelIds.includes(l.id)
  ).length;

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Hero Student Command Card */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0F172A] border border-slate-800/90 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
              <span>Dasbor Pembelajaran Mimi 15</span>
              <span aria-hidden="true">·</span>
              <span>{uiState.cyberRank}</span>
              <span aria-hidden="true">·</span>
              <span>Level {uiState.level}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Selamat Belajar, {uiState.studentName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Topik terakhir dipelajari: <span className="text-slate-200 font-medium">{studyProgress.lastStudiedTopic}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                onAskMimiTopic(
                  `Halo Mimi! Berikan rangkuman materi penting untuk ${uiState.selectedEducationLevel} ${uiState.selectedClass}.`
                )
              }
              className="px-4 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Diskusi Materi Hari Ini</span>
            </button>
          </div>
        </div>

        {/* 4-Column Quantitative Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800/80">
            <div className="text-xs text-slate-400">Total Poin Pengalaman</div>
            <div className="text-xl font-extrabold font-mono text-sky-400 mt-1 tabular-nums">
              {uiState.xp} XP
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
              {150 - (uiState.xp % 150)} XP menuju Level {uiState.level + 1}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800/80">
            <div className="text-xs text-slate-400">Modul Jenjang {uiState.selectedEducationLevel}</div>
            <div className="text-xl font-extrabold font-mono text-emerald-400 mt-1 tabular-nums">
              {completedCount} / {levels.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Simulasi & Latihan Selesai
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800/80">
            <div className="text-xs text-slate-400">Konsistensi Belajar</div>
            <div className="text-xl font-extrabold font-mono text-amber-400 mt-1 tabular-nums">
              {uiState.streakDays} Hari
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
              Total durasi {studyProgress.studyMinutes} menit
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800/80">
            <div className="text-xs text-slate-400">Target Mandiri</div>
            <div className="text-xl font-extrabold font-mono text-white mt-1 tabular-nums">
              {milestones.length} Target
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Jurnal Progres Siswa
            </div>
          </div>
        </div>
      </section>

      {/* 2. Education Level (SD / SMP / SMA) & Class Selector */}
      <section className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Pilih Jenjang & Kelas Kurikulum</h2>
            <p className="text-xs text-slate-400">
              Seluruh modul simulasi, kuis, dan gaya penjelasan Tutor Mimi menyesuaikan pilihanmu
            </p>
          </div>

          {/* Interactive Segmented Control for SD / SMP / SMA */}
          <div className="flex items-center gap-1 p-1 bg-[#0B1120] border border-slate-800 rounded-xl self-start">
            {[
              { id: EducationLevel.SD, label: 'SD (Kelas 1–6)' },
              { id: EducationLevel.SMP, label: 'SMP (Kelas 7–9)' },
              { id: EducationLevel.SMA, label: 'SMA (Kelas 10–12)' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectEducationLevel(item.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  uiState.selectedEducationLevel === item.id
                    ? 'bg-sky-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Class Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/70">
          <span className="text-xs text-slate-400 mr-2">Kelas Aktif:</span>
          {availableClasses.map((cls) => {
            const active = uiState.selectedClass === cls;
            return (
              <button
                key={cls}
                type="button"
                onClick={() => onSelectClass(cls)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-slate-100 text-slate-950'
                    : 'bg-[#0B1120] text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {cls}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Interactive Curriculum Modules & Simulations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Peta Modul & Simulasi Interaktif ({uiState.selectedEducationLevel})
            </h2>
            <p className="text-xs text-slate-400">
              Klik modul untuk membuka laboratorium simulasi konsep dan latihan terarah
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {completedCount} dari {levels.length} Modul Tuntas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {levels.map((lvl) => {
            const isDone = studyProgress.completedLevelIds.includes(lvl.id);
            return (
              <div
                key={lvl.id}
                className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800/90 hover:border-slate-700 transition-colors flex flex-col justify-between gap-5"
              >
                <div className="space-y-2.5">
                  {/* Unboxed clean metadata with middle dot separator */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sky-400 font-semibold tabular-nums">
                        Modul 0{lvl.levelNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{lvl.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span>{lvl.classRange}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-semibold tabular-nums">
                      +{lvl.xpReward} XP
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {lvl.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lvl.subtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-emerald-400 font-medium">Selesai Dipelajari</span>
                      </>
                    ) : (
                      <span className="font-mono tabular-nums">
                        Estimasi {lvl.estimatedMinutes} menit · Simulasi Aktif
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openModuleModal(lvl)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isDone
                        ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        : 'bg-sky-400 hover:bg-sky-300 text-slate-950'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 shrink-0" />
                    <span>{isDone ? 'Ulangi Simulasi' : 'Mulai Modul'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Custom Learning Milestones Tracker */}
      <section className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800/90 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white">Jurnal Target Belajar Mandiri</h2>
            <p className="text-xs text-slate-400">
              Catat pencapaian belajar harianmu untuk mendapatkan bonus XP langsung
            </p>
          </div>
          <span className="text-xs font-mono text-sky-400 tabular-nums">
            Total {milestones.length} Catatan
          </span>
        </div>

        <form onSubmit={handleCreateMilestone} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7">
            <input
              type="text"
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
              placeholder="Contoh: Menyelesaikan 10 latihan soal persamaan linear..."
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#0B1120] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>
          <div className="sm:col-span-3">
            <select
              aria-label="Target XP"
              value={milestoneXp}
              onChange={(e) => setMilestoneXp(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-xs sm:text-sm font-mono bg-[#0B1120] border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-400 tabular-nums"
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
              className="w-full h-full py-2.5 px-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
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
              className="py-3.5 flex items-center justify-between gap-4 text-xs sm:text-sm"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="font-semibold text-slate-100 truncate">{ms.title}</div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>{ms.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ms.createdAt}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-emerald-400 tabular-nums">+{ms.xpGain} XP</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDeleteMilestone(ms.id)}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
                aria-label="Hapus catatan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Interactive Two-Zone Sandbox Lesson & Simulation Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#0F172A] border border-slate-700 rounded-2xl p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs text-sky-400 font-medium flex items-center gap-1.5">
                  <span>Modul 0{activeModal.levelNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeModal.subject}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeModal.classRange}</span>
                </div>
                <h2 className="text-xl font-extrabold text-white mt-1">
                  {activeModal.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onCloseLevelModal}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Tutup modul"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Two-Zone Sandbox Layout (Education Reference Rule) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Zone: Interactive Visual Stage (7 cols) */}
              <div className="lg:col-span-7 p-5 rounded-xl bg-[#0B1120] border border-slate-800 flex flex-col justify-between space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="text-xs text-slate-400">Laboratorium Simulasi Interaktif</div>
                    <div className="text-sm font-bold text-white mt-0.5">
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
                    <span className="text-sky-400">
                      Target Eksperimen: {activeModal.simulation.targetValue}{' '}
                      {activeModal.simulation.unit}
                    </span>
                  </div>

                  {/* Interactive Visual Bar Grid */}
                  <div className="h-14 w-full bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center gap-1.5">
                    {Array.from({ length: 12 }).map((_, idx) => {
                      const ratio =
                        (simValue - activeModal.simulation.min) /
                        Math.max(1, activeModal.simulation.max - activeModal.simulation.min);
                      const activeBars = Math.max(1, Math.round(ratio * 12));
                      const isFilled = idx < activeBars;
                      const isTargetReached = simValue === activeModal.simulation.targetValue;
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

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Persamaan Model:</span>
                    <code className="text-xs sm:text-sm font-mono font-bold text-sky-300 tabular-nums">
                      {activeModal.simulation.formulaDisplay}
                    </code>
                  </div>
                </div>

                {/* Labeled Slider with Current Value and Reset */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="sim-slider"
                      className="font-semibold text-slate-200 flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5 text-sky-400" />
                      <span>
                        {activeModal.simulation.parameterLabel}: {simValue}{' '}
                        {activeModal.simulation.unit}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setSimValue(activeModal.simulation.defaultValue)}
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
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {activeModal.simulation.explanation}
                  </p>
                </div>
              </div>

              {/* Right Zone: Concept Deck & Practice Verification (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                <div className="p-5 rounded-xl bg-[#0B1120] border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white">Intisari Konsep Utama</h3>
                  <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                    {activeModal.summaryPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-mono text-sky-400 font-bold tabular-nums">
                          0{i + 1}.
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Practice Check */}
                <div className="p-5 rounded-xl bg-[#0B1120] border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-sky-400">
                    Uji Pemahaman Cepat
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white leading-relaxed">
                    {activeModal.practiceQuestion.question}
                  </p>
                  <div className="space-y-1.5">
                    {activeModal.practiceQuestion.options.map((opt, idx) => {
                      const isPicked = selectedPracticeOpt === idx;
                      const isRight = idx === activeModal.practiceQuestion.correctIndex;
                      let btnStyle =
                        'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';
                      if (selectedPracticeOpt !== null) {
                        if (isRight) {
                          btnStyle = 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200';
                        } else if (isPicked) {
                          btnStyle = 'bg-red-950/70 border-red-500/60 text-red-200';
                        }
                      }
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPracticeOpt(idx)}
                          className={`w-full text-left px-3.5 py-2 rounded-lg border text-xs transition-colors ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {selectedPracticeOpt !== null && (
                    <p className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                      <span className="font-semibold text-sky-400">Pembahasan: </span>
                      {activeModal.practiceQuestion.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onCloseLevelModal();
                  onAskMimiTopic(
                    `Tolong jelaskan lebih mendalam tentang "${activeModal.title}" untuk ${uiState.selectedEducationLevel} ${uiState.selectedClass} beserta contoh soalnya.`
                  );
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <MessageSquare className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Tanyakan Materi Ini ke Tutor Mimi</span>
              </button>

              <button
                type="button"
                onClick={() => onCompleteLevel(activeModal)}
                className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>Selesaikan Modul (+{activeModal.xpReward} XP)</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
