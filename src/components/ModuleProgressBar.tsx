import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, BookOpen, ExternalLink, Zap } from 'lucide-react';
import { LevelItem } from '../types/mimi';
import { OFFICIAL_DRIVE_PDF_FOLDER_URL } from '../services/googleDriveService';

interface ModuleProgressBarProps {
  subject: string;
  classLabel: string;
  educationLevel: string;
  units: LevelItem[];
  completedLevelIds: string[];
  onSelectUnit?: (unit: LevelItem) => void;
}

export const ModuleProgressBar: React.FC<ModuleProgressBarProps> = ({
  subject,
  classLabel,
  educationLevel,
  units,
  completedLevelIds,
  onSelectUnit,
}) => {
  const totalUnits = units.length;
  const completedUnits = units.filter((u) => completedLevelIds.includes(u.id)).length;
  const progressPercent =
    totalUnits > 0 ? Math.min(100, Math.round((completedUnits / totalUnits) * 100)) : 0;

  const earnedXp = units
    .filter((u) => completedLevelIds.includes(u.id))
    .reduce((acc, u) => acc + u.xpReward, 0);
  const totalPossibleXp = units.reduce((acc, u) => acc + u.xpReward, 0);

  const statusLabel =
    progressPercent === 100
      ? 'Semua Topik Tuntas! 🏆'
      : progressPercent >= 50
      ? 'Hampir Tuntas · Teruskan!'
      : progressPercent > 0
      ? 'Sedang Berjalan · Semangat!'
      : 'Mulai Topik Pertamamu';

  return (
    <div
      role="region"
      aria-label={`Progres Penyelesaian Modul Pembelajaran ${subject}`}
      className="p-4 sm:p-5 rounded-2xl bg-[#0B101E] border border-slate-800/90 shadow-lg space-y-3.5"
    >
      {/* Top Row: Subject Topic Title, Status Label & Direct Google Drive PDF Folder Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-bold">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Progres Penyelesaian Topik Modul</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300">
              {educationLevel} {classLabel}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
            {subject} — {statusLabel}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className="font-mono text-xs font-extrabold text-emerald-400 tabular-nums flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span>
              {earnedXp} / {totalPossibleXp} XP
            </span>
          </span>

          <a
            href={OFFICIAL_DRIVE_PDF_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl btn-tactile-emerald text-slate-950 font-extrabold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
            title="Pilih & Download Materi PDF sesuai mata pelajaran di Google Drive"
          >
            <span>Download Materi PDF ({subject})</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>
      </div>

      {/* Middle Row: Animated Continuous Progress Bar with Percentage */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300">
            Diselesaikan:{' '}
            <strong className="text-white font-mono tabular-nums">
              {completedUnits} dari {totalUnits} Topik
            </strong>
          </span>
          <span className="font-mono font-extrabold text-sky-400 tabular-nums">
            {progressPercent}% Selesai
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-full h-3.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5"
        >
          <motion.div
            className={`h-full rounded-full ${
              progressPercent === 100
                ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400'
                : 'bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(progressPercent, 4)}%` }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Bottom Row: Segmented Topic Checkpoints (Clickable to open unit directly) */}
      {totalUnits > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {units.map((unit, idx) => {
            const isCompleted = completedLevelIds.includes(unit.id);
            const isCurrentNext =
              !isCompleted &&
              (idx === 0 || completedLevelIds.includes(units[idx - 1]?.id));

            return (
              <button
                key={`prog-step-${unit.id}-${idx}`}
                type="button"
                onClick={() => onSelectUnit && onSelectUnit(unit)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                  isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 hover:border-emerald-400'
                    : isCurrentNext
                    ? 'bg-sky-950/40 border-sky-400/60 text-white hover:border-sky-300'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0 flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrentNext ? (
                    <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-600 text-[10px] font-mono flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                  )}
                  <span className="text-xs font-bold truncate">
                    Topik 0{unit.levelNumber}: {unit.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold shrink-0 tabular-nums">
                  {isCompleted ? '100%' : isCurrentNext ? 'Aktif' : '0%'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
