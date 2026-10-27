import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Play,
  MessageSquare,
  Plus,
  Check,
  Download,
  Sparkles,
  CheckCircle2,
  Bookmark,
  SlidersHorizontal,
  ArrowUpRight,
  Clock,
  Zap,
} from 'lucide-react';
import {
  EducationLevel,
  LevelItem,
} from '../types/mimi';
import {
  SUBJECTS_BY_LEVEL,
  getFilteredUnitsForSelection,
  KEMENDIKDASMEN_CATALOG_URL,
} from '../data/curriculumData';
import { downloadGeneratedModulePdf } from '../services/googleDriveService';

interface NewCoursesSectionProps {
  educationLevel: EducationLevel;
  selectedClass: string;
  selectedSubject: string;
  completedLevelIds: string[];
  onStartModule: (moduleItem: LevelItem) => void;
  onAskMimiTopic: (prompt: string) => void;
  onAddMilestone: (title: string, xp: number) => void;
  onSelectSubjectGlobal?: (subject: string) => void;
}

type CourseFilterTab = 'preferred' | 'current' | 'uncompleted';

const STORAGE_KEY_PREFS = 'mimi15_subject_preferences_v1';

export const NewCoursesSection: React.FC<NewCoursesSectionProps> = ({
  educationLevel,
  selectedClass,
  selectedSubject,
  completedLevelIds,
  onStartModule,
  onAskMimiTopic,
  onAddMilestone,
  onSelectSubjectGlobal,
}) => {
  const availableSubjects = useMemo(
    () => SUBJECTS_BY_LEVEL[educationLevel] || [],
    [educationLevel]
  );

  // Student's saved preferred subjects per education level
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFS}_${educationLevel}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return [selectedSubject, ...availableSubjects.slice(0, 2)].filter(
      (v, i, a) => Boolean(v) && a.indexOf(v) === i
    );
  });

  const [activeTab, setActiveTab] = useState<CourseFilterTab>('preferred');
  const [isEditingPreferences, setIsEditingPreferences] = useState<boolean>(false);
  const [savedMilestoneIds, setSavedMilestoneIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync preferredSubjects when educationLevel or selectedSubject changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFS}_${educationLevel}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.includes(selectedSubject)) {
            const updated = [selectedSubject, ...parsed].slice(0, 4);
            setPreferredSubjects(updated);
          } else {
            setPreferredSubjects(parsed);
          }
          return;
        }
      }
    } catch {
      // ignore
    }
    const defaults = [selectedSubject, ...availableSubjects.slice(0, 2)].filter(
      (v, i, a) => Boolean(v) && a.indexOf(v) === i
    );
    setPreferredSubjects(defaults);
  }, [educationLevel, selectedSubject, availableSubjects]);

  const togglePreferredSubject = (subject: string) => {
    setPreferredSubjects((prev) => {
      const exists = prev.includes(subject);
      let next: string[];
      if (exists) {
        // Keep at least 1 preferred subject
        next = prev.length > 1 ? prev.filter((s) => s !== subject) : prev;
      } else {
        next = [...prev, subject];
      }
      try {
        localStorage.setItem(
          `${STORAGE_KEY_PREFS}_${educationLevel}`,
          JSON.stringify(next)
        );
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Build latest course modules based on student's preferred subjects and current class
  const allNewCourseModules = useMemo(() => {
    const subjectsToLoad =
      preferredSubjects.length > 0 ? preferredSubjects : [selectedSubject];

    const modulesList: Array<
      LevelItem & {
        releaseTag: string;
        engagementHighlight: string;
        isPreferredSubject: boolean;
      }
    > = [];

    subjectsToLoad.forEach((subj, subjIdx) => {
      const units = getFilteredUnitsForSelection(
        educationLevel,
        selectedClass,
        subj,
        completedLevelIds
      );

      // Take top 2 modules from each preferred subject and enrich with latest release metadata
      units.slice(0, 2).forEach((unit, unitIdx) => {
        const customId = `new-course-${unit.id}`;
        const isCompleted = completedLevelIds.includes(unit.id);
        modulesList.push({
          ...unit,
          id: unit.id,
          xpReward: unit.xpReward + 10,
          releaseTag:
            unitIdx === 0 && subj === selectedSubject
              ? 'Modul Utama Pilihanmu'
              : subjIdx === 0
              ? 'Terbaru · Kurikulum Merdeka'
              : 'Rekomendasi Minatmu',
          engagementHighlight:
            unit.summaryPoints?.[0] ||
            `Eksplorasi konsep praktis & simulasi interaktif ${subj} untuk ${selectedClass}.`,
          isPreferredSubject: preferredSubjects.includes(subj),
        });
        void customId;
      });

      // Also add 1 special enrichment "Kursus Baru Eksplorasi Cepat" per active subject
      if (subj === selectedSubject) {
        const bonusId = `unit-new-enrichment-${educationLevel}-${selectedClass}-${subj}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-');
        modulesList.unshift({
          id: bonusId,
          levelNumber: units.length + 1,
          title: `Masterclass Cepat: Studi Kasus & Trik Soal ${subj}`,
          subtitle: `Modul intensif terbaru ${selectedClass} dengan latihan terarah dan simulasi konsep interaktif`,
          subject: subj,
          mapel: subj,
          kelas: selectedClass,
          educationLevel,
          classRange: selectedClass,
          xpReward: 75,
          estimatedMinutes: 15,
          isUnlocked: true,
          isCompleted: completedLevelIds.includes(bonusId),
          bookSource: {
            title: `Modul Pengayaan ${subj} ${selectedClass} Edisi Terbaru`,
            authorOrPublisher: 'Pusat Perbukuan Kemendikdasmen RI',
            year: '2025',
            catalogUrl: KEMENDIKDASMEN_CATALOG_URL,
            companionBookTitle: `Buku Panduan Praktik ${subj} ${selectedClass}`,
            companionBookUrl: KEMENDIKDASMEN_CATALOG_URL,
          },
          summaryPoints: [
            `Bedah pola soal yang paling sering muncul pada materi ${subj} (${selectedClass}).`,
            `Teknik menghubungkan konsep dasar ${subj} dengan fenomena sehari-hari secara cepat.`,
            `Latihan mandiri terstruktur untuk menguji pemahaman dalam waktu 15 menit.`,
          ],
          practiceQuestion:
            units[0]?.practiceQuestion || {
              question: `Dalam mempelajari materi baru ${subj} (${selectedClass}), strategi manakah yang paling efektif untuk memahami konsep secara mendalam?`,
              options: [
                'Memahami konsep inti dan mengujinya melalui simulasi serta latihan kontekstual',
                'Menghafal seluruh teks tanpa mencoba latihan soal',
                'Melewati bagian konsep dasar dan langsung menebak jawaban',
                'Membaca judul bab saja tanpa memperhatikan contoh penerapan',
              ],
              correctIndex: 0,
              explanation:
                'Pemahaman konsep inti yang dipadukan dengan simulasi dan latihan soal kontekstual membangun daya ingat jangka panjang.',
            },
          simulation:
            units[0]?.simulation || {
              type: 'ALGEBRA_BALANCE',
              title: `Laboratorium Eksplorasi ${subj}`,
              parameterLabel: 'Tingkat Eksplorasi Variabel',
              unit: 'skala',
              min: 1,
              max: 10,
              step: 1,
              defaultValue: 3,
              targetValue: 7,
              formulaDisplay: `Target Penguasaan Konsep ${subj} = Skala 7`,
              explanation: `Geser pengatur ke skala 7 untuk menyimulasikan keseimbangan konsep pada materi ${subj}.`,
            },
          releaseTag: 'Kursus Baru Minggu Ini',
          engagementHighlight: `Dirancang khusus untuk mendongkrak pemahaman ${subj} (${selectedClass}) lewat metode visual & latihan cepat.`,
          isPreferredSubject: true,
        });
      }
    });

    return modulesList;
  }, [
    educationLevel,
    selectedClass,
    selectedSubject,
    preferredSubjects,
    completedLevelIds,
  ]);

  const displayedCourses = useMemo(() => {
    if (activeTab === 'current') {
      return allNewCourseModules.filter(
        (c) => c.subject === selectedSubject || c.mapel === selectedSubject
      );
    }
    if (activeTab === 'uncompleted') {
      const uncompleted = allNewCourseModules.filter(
        (c) => !completedLevelIds.includes(c.id)
      );
      return uncompleted.length > 0 ? uncompleted : allNewCourseModules;
    }
    return allNewCourseModules.slice(0, 6);
  }, [allNewCourseModules, activeTab, selectedSubject, completedLevelIds]);

  const handleSaveToTarget = (course: LevelItem) => {
    if (savedMilestoneIds.includes(course.id)) return;
    onAddMilestone(`Kursus Baru: ${course.title} (${course.subject})`, course.xpReward);
    setSavedMilestoneIds((prev) => [...prev, course.id]);
    setToastMessage(`Modul "${course.title}" berhasil ditambahkan ke Target Harian! (+${course.xpReward} XP)`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <section
      aria-label="Kursus Baru Berdasarkan Preferensi"
      className="p-5 sm:p-7 rounded-3xl border border-slate-800/90 bg-[#0B101E] shadow-xl space-y-5 relative overflow-hidden"
    >
      {/* Subtle top-right ambient glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Row: Title, Context & Interactive Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Katalog Modul Terbaru</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 font-medium">
              {educationLevel} {selectedClass}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Kursus Baru untuk Kamu
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Daftar modul pembelajaran terbaru yang disesuaikan dengan preferensi mata pelajaranmu ({preferredSubjects.join(', ')}).
          </p>
        </div>

        {/* Interactive Filter Tabs & Customize Preferences Button */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <div className="flex items-center gap-1 p-1 bg-[#070b14] border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('preferred')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'preferred'
                  ? 'bg-emerald-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sesuai Preferensi ({allNewCourseModules.slice(0, 6).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('current')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'current'
                  ? 'bg-emerald-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fokus {selectedSubject}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('uncompleted')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'uncompleted'
                  ? 'bg-emerald-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Belum Selesai
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingPreferences((prev) => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              isEditingPreferences
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/50'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
            <span>Atur Minat Mapel</span>
          </button>
        </div>
      </div>

      {/* Collapsible Subject Preference Selector Drawer */}
      <AnimatePresence>
        {isEditingPreferences && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-[#070b14] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pilih Mata Pelajaran Favoritmu ({educationLevel}):</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Klik mapel untuk menambah/menghapus dari daftar Kursus Baru
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableSubjects.map((subj) => {
                  const isSelected = preferredSubjects.includes(subj);
                  return (
                    <button
                      key={`pref-toggle-${subj}`}
                      type="button"
                      onClick={() => togglePreferredSubject(subj)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-sm'
                          : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{subj}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {displayedCourses.map((course, idx) => {
          const isCompleted = completedLevelIds.includes(course.id);
          const isSavedToTarget = savedMilestoneIds.includes(course.id);

          return (
            <motion.article
              key={`new-course-card-${course.id}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              className="p-5 rounded-2xl bg-[#080d19] border border-slate-800/90 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-4 group"
            >
              <div className="space-y-2.5">
                {/* Clean Unboxed Metadata Line (Zero-Pill Discipline) */}
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-emerald-400 truncate">
                      {course.subject}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{course.classRange}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-sky-300 font-medium truncate">
                      {course.releaseTag}
                    </span>
                  </div>

                  <span className="font-mono font-bold text-amber-300 tabular-nums shrink-0 flex items-center gap-0.5">
                    <Zap className="w-3 h-3 fill-amber-300" />
                    <span>+{course.xpReward} XP</span>
                  </span>
                </div>

                {/* Course Title */}
                <h3
                  onClick={() => onStartModule(course)}
                  className="text-sm sm:text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-snug cursor-pointer"
                >
                  {course.title}
                </h3>

                {/* Subtitle & Engagement Highlight */}
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {course.subtitle}
                </p>

                <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-3 font-mono tabular-nums">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{course.estimatedMinutes} menit</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 text-slate-300 font-sans">
                    <BookOpen className="w-3 h-3 text-sky-400" />
                    <span className="truncate max-w-[180px]">
                      {course.simulation?.title || 'Simulasi Interaktif'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Action Controls Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onAskMimiTopic(
                        `Mimi, kita bahas kursus baru "${course.title}" untuk mapel ${course.subject} (${course.classRange}) yuk! Kasih aku gambaran seru dan contoh soalnya!`
                      )
                    }
                    title="Diskusikan modul ini bersama Mimi"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 hover:text-white border border-slate-800 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={isSavedToTarget}
                    onClick={() => handleSaveToTarget(course)}
                    title="Simpan ke Target Belajar Harian"
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors flex items-center gap-1 ${
                      isSavedToTarget
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    {isSavedToTarget ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Tersimpan</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 text-sky-400" />
                        <span>Target</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      downloadGeneratedModulePdf({
                        title: course.title,
                        level: course.educationLevel,
                        classRange: course.classRange,
                        subject: course.subject,
                        bookTitle: course.bookSource.title,
                        publisher: course.bookSource.authorOrPublisher,
                        catalogUrl: course.bookSource.catalogUrl,
                        summaryPoints: course.summaryPoints,
                        formula: course.simulation.formulaDisplay,
                      })
                    }
                    title="Unduh Rangkuman PDF Modul"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      onSelectSubjectGlobal &&
                      course.subject !== selectedSubject &&
                      availableSubjects.includes(course.subject)
                    ) {
                      onSelectSubjectGlobal(course.subject);
                    }
                    onStartModule(course);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                    isCompleted
                      ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30'
                      : 'btn-tactile-emerald text-slate-950 shadow-md'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ulangi</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Mulai Kursus</span>
                    </>
                  )}
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Bottom Engagement Prompt */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-800/60">
        <span>
          Menampilkan <strong className="text-white font-mono tabular-nums">{displayedCourses.length}</strong> modul pembelajaran terbaru berdasarkan preferensi mata pelajaranmu.
        </span>
        <button
          type="button"
          onClick={() =>
            onAskMimiTopic(
              `Mimi, rekomendasikan urutan belajar dari daftar Kursus Baru untuk mapel ${preferredSubjects.join(', ')} di ${selectedClass} dong!`
            )
          }
          className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Minta Rekomendasi Kursus ke Mimi</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
