import React, { useState } from 'react';
import {
  Shield,
  LogOut,
  Plus,
  Trash2,
  KeyRound,
  CheckCircle2,
  User,
  ExternalLink,
  Award,
} from 'lucide-react';
import {
  AuthUser,
  BadgeItem,
  LearningMilestone,
  MimiUiState,
  StudyProgress,
} from '../../types/mimi';

interface ProfilScreenProps {
  uiState: MimiUiState;
  authUser: AuthUser;
  studyProgress: StudyProgress;
  milestones: LearningMilestone[];
  badges: BadgeItem[];
  onAddMilestone: (title: string, xp: number) => void;
  onDeleteMilestone: (id: string) => void;
  onUpdateProfileSecurity: (
    displayName: string,
    newPassword?: string,
    securityPin?: string
  ) => Promise<string | null>;
  onSignOut: () => void;
}

export const ProfilScreen: React.FC<ProfilScreenProps> = ({
  uiState,
  authUser,
  studyProgress,
  milestones,
  badges,
  onAddMilestone,
  onDeleteMilestone,
  onUpdateProfileSecurity,
  onSignOut,
}) => {
  const [editName, setEditName] = useState(uiState.studentName);
  const [newPassword, setNewPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string>(() => {
    return localStorage.getItem('mimi15_personal_github_username') || 'annaadriiann';
  });

  const [milestoneTitle, setMilestoneTitle] = useState('');

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    localStorage.setItem(
      'mimi15_personal_github_username',
      githubUsername.trim().replace(/^@/, '')
    );
    const err = await onUpdateProfileSecurity(
      editName,
      newPassword.trim() || undefined,
      newPin.trim() || undefined
    );
    setIsSaving(false);
    if (err) {
      setStatusMessage(err);
    } else {
      setNewPassword('');
      setNewPin('');
      setStatusMessage('Profil dan pengaturan berhasil diperbarui.');
    }
  };

  const handleAddMilestoneQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;
    onAddMilestone(milestoneTitle.trim(), 35);
    setMilestoneTitle('');
  };

  const accuracy =
    studyProgress.totalQuizQuestions > 0
      ? Math.round(
          (studyProgress.correctQuizAnswers / studyProgress.totalQuizQuestions) * 100
        )
      : 100;

  const cleanGithubHandle = githubUsername.trim().replace(/^@/, '') || 'annaadriiann';

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Identity & Sign Out Header */}
      <section className="p-6 sm:p-8 card-study flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
            <span>Profil Siswa Terverifikasi</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{authUser.uid}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {uiState.studentName}
          </h1>
          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
            <span>{uiState.studentEmail}</span>
            <span aria-hidden="true">·</span>
            <span>{uiState.cyberRank}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">
              Metode Login:{' '}
              {authUser.authMethod === 'PBKDF2_SCRYPT'
                ? 'Enkripsi scrypt-SHA256'
                : 'Google Terverifikasi'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/70 border border-red-800/70 text-red-200 font-semibold text-xs transition-colors flex items-center gap-2 self-start sm:self-auto whitespace-nowrap shrink-0"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Keluar Sesi Aman</span>
        </button>
      </section>

      {/* 2. Kartu Follow Profil GitHub Pribadi (Hanya Profil untuk Difollow, Tanpa Membagikan Source Code) */}
      <section className="p-6 card-study flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-extrabold text-sky-400">
            Kartu Profil GitHub Pribadi
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-white">
            github.com/{cleanGithubHandle}
          </h2>
          <p className="text-xs text-slate-400">
            Menampilkan tautan profil GitHub pribadimu agar teman-teman bisa langsung klik Follow (tanpa membagikan kode aplikasi).
          </p>
        </div>

        <a
          href={`https://github.com/${encodeURIComponent(cleanGithubHandle)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3 rounded-2xl btn-tactile-sky text-xs font-extrabold flex items-center gap-2 self-start sm:self-auto whitespace-nowrap shrink-0"
        >
          <span>Follow GitHub @{cleanGithubHandle}</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>
      </section>

      {/* 3. Study Progress & Security Settings Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Academic Progress & Milestones (6 cols) */}
        <section className="lg:col-span-6 p-6 card-study flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">
              Statistik Belajar & Lencana
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#0B101E] border border-slate-800">
                <div className="text-xs text-slate-400">Total XP & Level</div>
                <div className="text-lg font-extrabold font-mono text-sky-400 mt-1 tabular-nums">
                  {uiState.xp} XP · Lv.{uiState.level}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B101E] border border-slate-800">
                <div className="text-xs text-slate-400">Akurasi Evaluasi Kuis</div>
                <div className="text-lg font-extrabold font-mono text-emerald-400 mt-1 tabular-nums">
                  {accuracy}% ({studyProgress.correctQuizAnswers}/
                  {studyProgress.totalQuizQuestions})
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B101E] border border-slate-800">
                <div className="text-xs text-slate-400">Modul Buku Tuntas</div>
                <div className="text-lg font-extrabold font-mono text-white mt-1 tabular-nums">
                  {studyProgress.completedLevelIds.length} Modul
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B101E] border border-slate-800">
                <div className="text-xs text-slate-400">Waktu Belajar Tercatat</div>
                <div className="text-lg font-extrabold font-mono text-amber-400 mt-1 tabular-nums">
                  {studyProgress.studyMinutes} Menit
                </div>
              </div>
            </div>

            {/* Lencana Mini Strip */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Koleksi Lencana Pencapaian</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border text-xs ${
                      b.isUnlocked
                        ? 'bg-[#0B101E] border-emerald-500/40 text-white'
                        : 'bg-[#0B101E]/50 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span className="truncate">{b.title}</span>
                      <span className="font-mono text-[11px] text-emerald-400">
                        {b.progress}/{b.maxProgress}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones Management */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">
                Catatan Pencapaian Mandiri
              </h3>
              <form onSubmit={handleAddMilestoneQuick} className="flex gap-2">
                <input
                  type="text"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="Tambah target belajar baru (+35 XP)..."
                  className="flex-1 px-3.5 py-2 text-xs bg-[#0B101E] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </form>

              <div className="divide-y divide-slate-800/80 max-h-36 overflow-y-auto">
                {milestones.map((ms) => (
                  <div
                    key={ms.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-200 truncate">
                        {ms.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {ms.createdAt} · +{ms.xpGain} XP
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteMilestone(ms.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg"
                      aria-label="Hapus milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Sinkronisasi Cloud 24/7 terakhir:</span>
            <span className="font-mono tabular-nums">{studyProgress.lastUpdated}</span>
          </div>
        </section>

        {/* Right: Security Center & Personal GitHub Handle (6 cols) */}
        <section className="lg:col-span-6 p-6 card-study flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Pengaturan Profil & Keamanan Akun
                </h2>
                <p className="text-xs text-slate-400">
                  Perbarui nama tampilan, username profil GitHub, kata sandi scrypt, atau PIN
                </p>
              </div>
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>

            {statusMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-700/60 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveSecurity} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Tampilan Siswa
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#0B101E] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Username GitHub Pribadi (Hanya untuk tombol Follow Profil)
                </label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="Contoh: annaadriiann"
                  className="w-full px-4 py-2 text-xs sm:text-sm font-mono bg-[#0B101E] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Kata Sandi Baru (Kosongkan jika tidak diubah)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#0B101E] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  PIN Keamanan 4–6 Digit (
                  {authUser.hasSecurityPin ? 'Sudah Aktif' : 'Belum Diatur'})
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Masukkan PIN angka baru..."
                  className="w-full px-4 py-2 text-xs sm:text-sm font-mono bg-[#0B101E] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 tabular-nums"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 px-4 btn-tactile-sky font-extrabold text-xs rounded-xl transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                {isSaving
                  ? 'Menyimpan Pengaturan...'
                  : 'Simpan Profil & Keamanan'}
              </button>
            </form>

            {/* Security Audit Log */}
            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              <div className="text-xs font-semibold text-slate-300">
                Riwayat Audit Keamanan Sesi
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {(authUser.securityAudit || []).map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2.5 rounded-lg bg-[#0B101E] border border-slate-800/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-200 truncate">
                        {entry.action}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {entry.method} · {entry.timestamp}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-mono font-semibold shrink-0 ${
                        entry.status === 'TERVERIFIKASI'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
