import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  FileText,
  FileCode,
  GitBranch,
  Terminal,
  Globe,
  BookOpen,
} from 'lucide-react';
import { MimiUiState, StudyProgress } from '../types/mimi';

interface ShareAndDownloadHubDialogProps {
  uiState: MimiUiState;
  studyProgress: StudyProgress;
  onDismiss: () => void;
}

const GITHUB_CONFIG_KEY = 'mimi15_github_config';

export const ShareAndDownloadHubDialog: React.FC<ShareAndDownloadHubDialogProps> = ({
  uiState,
  studyProgress,
  onDismiss,
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'report'>('github');
  const [githubUser, setGithubUser] = useState('username-kamu');
  const [githubRepo, setGithubRepo] = useState('mimi-v15-room-belajar');
  const [githubBranch, setGithubBranch] = useState('main');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(GITHUB_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.githubUser) setGithubUser(parsed.githubUser);
        if (parsed.githubRepo) setGithubRepo(parsed.githubRepo);
        if (parsed.githubBranch) setGithubBranch(parsed.githubBranch);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleSaveGithubConfig = (user: string, repo: string, branch: string) => {
    setGithubUser(user);
    setGithubRepo(repo);
    setGithubBranch(branch);
    try {
      localStorage.setItem(
        GITHUB_CONFIG_KEY,
        JSON.stringify({ githubUser: user, githubRepo: repo, githubBranch: branch })
      );
    } catch {
      // Ignore
    }
  };

  const unlockedBadgesCount = uiState.badges.filter((b) => b.isUnlocked).length;
  const accuracy =
    studyProgress.totalQuizQuestions > 0
      ? Math.round((studyProgress.correctQuizAnswers / studyProgress.totalQuizQuestions) * 100)
      : 100;

  const webUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mimi-v15.app';
  const cleanUser = githubUser.trim() || 'username-kamu';
  const cleanRepo = githubRepo.trim() || 'mimi-v15-room-belajar';
  const cleanBranch = githubBranch.trim() || 'main';
  const repoUrl = `https://github.com/${cleanUser}/${cleanRepo}`;

  const gitCommands = `git init
git add .
git commit -m "feat: Room Belajar Mimi V15 (Gemini AI 3.6 Flash)"
git branch -M ${cleanBranch}
git remote add origin ${repoUrl}.git
git push -u origin ${cleanBranch}`;

  const githubReadmeSnippet = `# Room Belajar Mimi V15 (Gemini AI 3.6 Flash)

Website Room Belajar interaktif bersama **Mimi V15** — asisten, guru, profesor, sekaligus teman belajarmu yang peka dan menuntun pemahaman dengan kisi-kisi.

- **Web App Live**: [${webUrl}](${webUrl})
- **Repositori GitHub**: [${repoUrl}](${repoUrl})
- **Profil Belajar**: ${uiState.studentName} · ${uiState.cyberRank} (Level ${uiState.level} · ${uiState.xp} XP)
`;

  const summaryText = `LAPORAN PROGRES ROOM BELAJAR — MIMI V15
==================================================
Nama Teman Belajar : ${uiState.studentName}
Email Terdaftar    : ${uiState.studentEmail}
Jenjang & Kelas    : ${uiState.selectedEducationLevel} (${uiState.selectedClass})
Gelar Belajar      : ${uiState.cyberRank}
Level & Total XP   : Level ${uiState.level} (${uiState.xp} XP)
Streak Belajar     : ${uiState.streakDays} Hari Berturut-turut
Modul Selesai      : ${studyProgress.completedLevelIds.length} Modul Kurikulum
Akurasi Latihan    : ${accuracy}% (${studyProgress.correctQuizAnswers}/${studyProgress.totalQuizQuestions} Soal Benar)
Kemenangan Laga    : ${uiState.rivalWins} Menang dari ${uiState.rivalMatches} Sesi
Lencana Terbuka    : ${unlockedBadgesCount} / ${uiState.badges.length} Lencana
Topik Terakhir     : ${studyProgress.lastStudiedTopic}
Repositori GitHub  : ${repoUrl}
Tanggal Unduh      : ${new Date().toLocaleString('id-ID')}
==================================================`;

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2200);
    } catch {
      // Fallback
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan-MimiV15-${uiState.studentName.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadReadme = () => {
    const blob = new Blob([githubReadmeSnippet + '\n\n```bash\n' + gitCommands + '\n```\n'], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const payload = {
      application: 'Mimi V15 — Room Belajar',
      engine: 'Gemini AI 3.6 Flash',
      githubRepository: repoUrl,
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
    a.download = `Cadangan-MimiV15-${uiState.studentName.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl card-study p-7 sm:p-8 space-y-6 my-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Pengaturan GitHub & Bagikan Room Belajar
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Atur repositori GitHub untuk membagikan web Mimi V15 atau unduh laporan hasil belajarmu
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#0B101E] border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'github'
                ? 'bg-sky-400 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Atur & Share ke GitHub
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'report'
                ? 'bg-sky-400 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kartu & Laporan Belajar
          </button>
        </div>

        {activeTab === 'github' ? (
          <div className="space-y-6">
            {/* GitHub Repository Config Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Username GitHub
                </label>
                <input
                  type="text"
                  value={githubUser}
                  onChange={(e) =>
                    handleSaveGithubConfig(e.target.value, githubRepo, githubBranch)
                  }
                  placeholder="username-kamu"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#0B101E] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Nama Repositori
                </label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) =>
                    handleSaveGithubConfig(githubUser, e.target.value, githubBranch)
                  }
                  placeholder="mimi-v15-room-belajar"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#0B101E] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Branch Utama
                </label>
                <div className="relative">
                  <GitBranch className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={githubBranch}
                    onChange={(e) =>
                      handleSaveGithubConfig(githubUser, githubRepo, e.target.value)
                    }
                    placeholder="main"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-mono bg-[#0B101E] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>
            </div>

            {/* Generated Git Push Commands */}
            <div className="p-5 rounded-2xl bg-[#0B101E] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <Terminal className="w-4 h-4" />
                  <span>Perintah Terminal untuk Push ke GitHub</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(gitCommands, 'git')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  {copiedKey === 'git' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Perintah Git</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                {gitCommands}
              </pre>
            </div>

            {/* Quick Share Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => copyToClipboard(webUrl, 'web')}
                className="py-3 px-4 rounded-xl btn-tactile-sky font-extrabold text-xs flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                {copiedKey === 'web' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tautan Web Disalin!</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Salin Link Web Room Belajar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadReadme}
                className="py-3 px-4 rounded-xl btn-tactile-slate font-bold text-xs flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Unduh README.md GitHub</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Certificate Preview Box */}
            <div className="p-6 rounded-2xl bg-[#0B101E] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Kartu Pencapaian Room Belajar Mimi V15</span>
                <span className="font-mono text-sky-400 tabular-nums">
                  {uiState.selectedEducationLevel} · {uiState.selectedClass}
                </span>
              </div>

              <div>
                <div className="text-2xl font-extrabold text-white">{uiState.studentName}</div>
                <div className="text-xs sm:text-sm text-sky-400 font-semibold mt-1">
                  {uiState.cyberRank}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-center">
                <div>
                  <div className="text-lg font-extrabold font-mono text-sky-400 tabular-nums">
                    {uiState.xp} XP
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Level {uiState.level}</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold font-mono text-emerald-400 tabular-nums">
                    {studyProgress.completedLevelIds.length} Modul
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Materi Tuntas</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold font-mono text-amber-400 tabular-nums">
                    {accuracy}%
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Akurasi Latihan</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="py-3 px-4 rounded-xl btn-tactile-sky font-extrabold text-xs flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Unduh Laporan (.TXT)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="py-3 px-4 rounded-xl btn-tactile-slate font-bold text-xs flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                <FileCode className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Cadangkan Data (.JSON)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(summaryText, 'summary')}
              className="w-full py-3 px-4 rounded-xl btn-tactile-slate font-bold text-xs flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              {copiedKey === 'summary' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400">Ringkasan Berhasil Disalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>Salin Teks Ringkasan Pencapaian</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
