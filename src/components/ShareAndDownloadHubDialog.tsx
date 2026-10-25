import React, { useState } from 'react';
import { X, Download, Copy, Check, FileText, FileCode } from 'lucide-react';
import { MimiUiState, StudyProgress } from '../types/mimi';

interface ShareAndDownloadHubDialogProps {
  uiState: MimiUiState;
  studyProgress: StudyProgress;
  onDismiss: () => void;
}

export const ShareAndDownloadHubDialog: React.FC<ShareAndDownloadHubDialogProps> = ({
  uiState,
  studyProgress,
  onDismiss,
}) => {
  const [copied, setCopied] = useState(false);

  const unlockedBadgesCount = uiState.badges.filter((b) => b.isUnlocked).length;
  const accuracy =
    studyProgress.totalQuizQuestions > 0
      ? Math.round((studyProgress.correctQuizAnswers / studyProgress.totalQuizQuestions) * 100)
      : 100;

  const summaryText = `LAPORAN PROGRES BELAJAR — MIMI 15
==================================================
Nama Siswa       : ${uiState.studentName}
Email Terdaftar  : ${uiState.studentEmail}
Jenjang & Kelas  : ${uiState.selectedEducationLevel} (${uiState.selectedClass})
Pangkat Siber    : ${uiState.cyberRank}
Level & Total XP : Level ${uiState.level} (${uiState.xp} XP)
Streak Belajar   : ${uiState.streakDays} Hari Berturut-turut
Modul Selesai    : ${studyProgress.completedLevelIds.length} Modul Kurikulum
Akurasi Kuis     : ${accuracy}% (${studyProgress.correctQuizAnswers}/${studyProgress.totalQuizQuestions} Soal Benar)
Kemenangan Arena : ${uiState.rivalWins} Menang dari ${uiState.rivalMatches} Duel
Lencana Terbuka  : ${unlockedBadgesCount} / ${uiState.badges.length} Lencana
Topik Terakhir   : ${studyProgress.lastStudiedTopic}
Tanggal Unduh    : ${new Date().toLocaleString('id-ID')}
==================================================`;

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan-Mimi15-${uiState.studentName.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const payload = {
      application: 'Mimi 15',
      exportedAt: new Date().toISOString(),
      student: {
        name: uiState.studentName,
        email: uiState.studentEmail,
        educationLevel: uiState.selectedEducationLevel,
        selectedClass: uiState.selectedClass,
        level: uiState.level,
        xp: uiState.xp,
        rank: uiState.cyberRank,
        streakDays: uiState.streakDays,
      },
      studyProgress,
      unlockedBadges: uiState.badges.filter((b) => b.isUnlocked).map((b) => b.title),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cadangan-Progres-Mimi15-${uiState.studentName.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Pusat Unduh & Bagikan Progres</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ekspor sertifikat ringkasan hasil belajar atau cadangan data Mimi 15
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Preview Box */}
        <div className="p-5 rounded-xl bg-[#0B1120] border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Kartu Pencapaian Siswa Mimi 15</span>
            <span className="font-mono text-sky-400 tabular-nums">
              {uiState.selectedEducationLevel} · {uiState.selectedClass}
            </span>
          </div>

          <div className="text-xl font-extrabold text-white">{uiState.studentName}</div>
          <div className="text-xs text-slate-400">{uiState.cyberRank}</div>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-center">
            <div>
              <div className="text-base font-bold font-mono text-sky-400 tabular-nums">
                {uiState.xp} XP
              </div>
              <div className="text-[11px] text-slate-400">Level {uiState.level}</div>
            </div>
            <div>
              <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                {studyProgress.completedLevelIds.length} Modul
              </div>
              <div className="text-[11px] text-slate-400">Kurikulum Tuntas</div>
            </div>
            <div>
              <div className="text-base font-bold font-mono text-amber-400 tabular-nums">
                {accuracy}%
              </div>
              <div className="text-[11px] text-slate-400">Akurasi Kuis</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="py-2.5 px-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Unduh Laporan (.TXT)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="py-2.5 px-4 bg-[#0B1120] hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <FileCode className="w-4 h-4 shrink-0" />
            <span>Cadangkan Data (.JSON)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-emerald-400">Ringkasan Berhasil Disalin ke Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 shrink-0" />
              <span>Salin Teks Ringkasan Pencapaian</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
