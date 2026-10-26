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
  Heart,
  QrCode,
  Sparkles,
  Building2,
  Copy,
  Check,
  Smartphone,
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
  themeMode?: 'dark' | 'light';
  onToggleTheme?: (mode: 'dark' | 'light') => void;
  onAddMilestone: (title: string, xp: number) => void;
  onDeleteMilestone: (id: string) => void;
  onUpdateProfileSecurity: (
    displayName: string,
    newPassword?: string,
    securityPin?: string
  ) => Promise<string | null>;
  onSignOut: () => void;
  onOpenDonation?: () => void;
  onOpenErrorReport?: () => void;
  onOpenAdminDashboard?: () => void;
}

export const ProfilScreen: React.FC<ProfilScreenProps> = ({
  uiState,
  authUser,
  studyProgress,
  milestones,
  badges,
  themeMode = 'dark',
  onToggleTheme,
  onAddMilestone,
  onDeleteMilestone,
  onUpdateProfileSecurity,
  onSignOut,
  onOpenDonation,
  onOpenErrorReport,
  onOpenAdminDashboard,
}) => {
  const [editName, setEditName] = useState(uiState.studentName);
  const [newPassword, setNewPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string>(() => {
    const saved = localStorage.getItem('mimi15_personal_github_username');
    if (!saved || saved === 'annaadriiann') return 'Khasanah-Kh';
    return saved;
  });

  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [copiedDana, setCopiedDana] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  const copyNumber = async (num: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(num);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

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

  const cleanGithubHandle = githubUsername.trim().replace(/^@/, '') || 'Khasanah-Kh';

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Identity & Sign Out Header */}
      <section className="p-6 sm:p-8 card-study flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
            <span>Profil Siswa Terverifikasi</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-400">{authUser.uid}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight">
            {uiState.studentName}
          </h1>
          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2.5">
            <span>{uiState.studentEmail}</span>
            <span aria-hidden="true">·</span>
            <span className="text-sky-300 font-semibold">{uiState.cyberRank}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">
              Metode Login:{' '}
              {authUser.authMethod === 'PBKDF2_SCRYPT'
                ? 'Enkripsi scrypt-SHA256'
                : 'Google Terverifikasi'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenErrorReport && (
            <button
              type="button"
              onClick={onOpenErrorReport}
              className="px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 hover:text-amber-100 font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
            >
              <span>⚠️ Lapor Error / Masukan</span>
            </button>
          )}

          {onOpenAdminDashboard && (
            <button
              type="button"
              onClick={onOpenAdminDashboard}
              className="px-4 py-2.5 rounded-xl border border-sky-500/40 bg-sky-950/30 hover:bg-sky-900/40 text-sky-300 hover:text-sky-100 font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
            >
              <span>📊 Dashboard Owner</span>
            </button>
          )}

          {onOpenDonation && (
            <button
              type="button"
              onClick={onOpenDonation}
              className="px-4 py-2.5 rounded-xl border border-rose-500/40 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 hover:text-rose-100 font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap shadow-sm hover:brightness-110 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-rose-400/20 text-rose-300" />
              <span>💖 Dukung Mimi</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSignOut}
            className="px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/70 border border-red-800/70 text-red-200 font-semibold text-xs transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar Sesi Aman</span>
          </button>
        </div>
      </section>

      {/* 2. Kartu Follow Profil GitHub Pribadi */}
      <section className="p-6 card-study flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0B101E] border border-white/[0.08] flex items-center justify-center text-slate-200 text-xl font-bold shadow-inner shrink-0">
            🐱
          </div>
          <div className="space-y-1">
            <div className="text-sm font-extrabold text-slate-50 flex items-center gap-2">
              <span>Profil GitHub Creator</span>
              <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                @{cleanGithubHandle}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ikuti profil GitHub untuk update perkembangan Mimi & project edukasi lainnya.
            </p>
          </div>
        </div>

        <a
          href={`https://github.com/${cleanGithubHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl btn-tactile-sky font-bold text-xs flex items-center gap-2 self-start sm:self-auto whitespace-nowrap shrink-0"
        >
          <span>Follow @{cleanGithubHandle} di GitHub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </section>

      {/* 3. FITUR DONASI & DUKUNGAN RESMI (3 KARTU FIX + CHAT WA ADMIN DRG) */}
      <section className="p-6 sm:p-8 card-study space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Heart className="w-5 h-5 fill-rose-400/20" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-50 flex items-center gap-2">
                <span>Dukungan &amp; Donasi Server</span>
                <span className="text-[10px] font-bold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
                  💖 Dukung Mimi V15
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Saluran resmi terverifikasi untuk keberlanjutan server belajar AI Mimi.
              </p>
            </div>
          </div>

          {onOpenDonation && (
            <button
              type="button"
              onClick={onOpenDonation}
              className="px-4 py-2.5 rounded-xl btn-tactile-sky text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Buka Dialog Donasi Lengkap</span>
            </button>
          )}
        </div>

        {/* Heartfelt Banner: Bantu Mimi Tetap Aktif */}
        <div className="p-5 sm:p-6 rounded-[20px] bg-gradient-to-r from-violet-950/40 via-purple-950/30 to-indigo-950/40 border border-violet-500/25 shadow-lg space-y-3">
          <div className="text-xs sm:text-sm font-extrabold text-rose-300 tracking-wide leading-snug">
            ✨ Bantu Mimi Tetap Aktif — Room ini dibuat dari hati Mimi untuk seluruh pelajar Indonesia 💕
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-[1.85] tracking-normal">
            💖 Mimi V15 ini aku buat dan rawat sendiri dengan penuh cinta, biar bisa nemenin kamu kapanpun secara gratis. Kalau kamu merasa terbantu, kamu bisa traktir secangkir kopi untuk biaya pemeliharaan server. Tidak harus banyak seikhlasnya saja, serta lebih penting adalah doa dan dukungan kalian. Room Mimi V15 akan selalu gratis untuk kalian yang terus mau belajar! 🥰🙏
          </p>
        </div>

        {/* 4 KARTU AESTHETIC CLEAN ROUNDED-[20px] BORDER-WHITE/10 */}
        <div className="grid grid-cols-1 gap-4">
          {/* KARTU 1 - DANA */}
          <div className="p-5 rounded-[20px] bg-[#131C31] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-blue-400/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-black text-xs border border-blue-500/30">
                  DANA
                </span>
                <span className="text-xs text-blue-300 font-semibold">
                  E-Wallet
                </span>
              </div>
              <div className="pt-1">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Nomor Akun DANA
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono text-sky-300 tracking-wider">
                  082148184782
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyNumber('082148184782', setCopiedDana)}
                className={`px-5 py-2.5 rounded-[20px] font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                  copiedDana
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/30'
                }`}
              >
                {copiedDana ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* KARTU 2 - BANK SEABANK */}
          <div className="p-5 rounded-[20px] bg-[#131C31] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-violet-400/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 font-black text-xs border border-violet-500/30 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>BANK SEABANK</span>
                </span>
                <span className="text-xs text-violet-300 font-semibold">
                  Transfer Antar Bank
                </span>
              </div>
              <div className="pt-1">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Nomor Rekening SeaBank
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono text-purple-200 tracking-wider">
                  901075234508
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyNumber('901075234508', setCopiedBank)}
                className={`px-5 py-2.5 rounded-[20px] font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                  copiedBank
                    ? 'bg-emerald-600 text-white'
                    : 'bg-violet-600 hover:bg-violet-500 text-white border border-violet-400/30'
                }`}
              >
                {copiedBank ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* KARTU 3 - GOPAY: Tampilkan QRIS kecil 80x80px di pojok kanan */}
          <div className="p-5 rounded-[20px] bg-[#131C31] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-emerald-400/40">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/30 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>GOPAY - Lihat QRIS</span>
                </span>
                <span className="text-xs text-emerald-300 font-semibold">
                  GoPay Merchant ADREE DIGI
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                Bisa scan langsung pakai aplikasi GoPay, BCA, Mandiri, BNI, BRI dan semua e-wallet / mobile banking.
              </p>
              {onOpenDonation && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenDonation}
                    className="px-5 py-2.5 rounded-[20px] font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/30 shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Lihat QRIS</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tampilkan QRIS kecil 80x80px di pojok kanan */}
            <div
              onClick={onOpenDonation}
              title="Klik untuk perbesar QRIS"
              className="w-20 h-20 sm:w-[80px] sm:h-[80px] bg-white rounded-2xl p-1.5 shrink-0 flex items-center justify-center border-2 border-emerald-400/50 shadow-lg cursor-pointer hover:scale-105 transition-transform self-center sm:self-auto"
            >
              <img
                src="/qris-gopay.png"
                alt="QRIS ADREE DIGI GoPay Merchant"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>

          {/* KARTU 4 - WHATSAPP MIMI REAL (JANGAN NAMA ADREEDIGI) */}
          <div className="p-5 rounded-[20px] bg-[#131C31] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-3.5 transition-all hover:border-emerald-400/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-[#25D366]/20 text-[#25D366] font-black text-xs border border-[#25D366]/30">
                  WHATSAPP
                </span>
                <h4 className="text-sm font-extrabold text-slate-50">
                  WHATSAPP MIMI REAL
                </h4>
              </div>
              <div className="font-mono text-xs font-bold text-emerald-400">
                No: 082148184782
              </div>
            </div>

            {/* Tombol besar hijau: 💬 Tanya / Request Pelajaran - Chat WA Mimi */}
            <a
              href="https://wa.me/message/2CFS37UB7TKUA1"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-[20px] p-4 w-full shadow-[0_0_24px_rgba(37,211,102,0.4)] hover:brightness-110 flex items-center justify-center gap-2.5 transition-all text-sm sm:text-base text-center group cursor-pointer active:scale-[0.99]"
            >
              <span className="text-xl">💬</span>
              <span>Tanya / Request Pelajaran - Chat WA Mimi</span>
              <ExternalLink className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Teks kecil di bawah kartu */}
            <p className="text-center text-xs text-slate-400">
              Untuk konfirmasi donasi / request materi pelajaran
            </p>
          </div>
        </div>
      </section>

      {/* 4. Target Belajar & Security Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Study Milestones (6 cols) */}
        <section className="lg:col-span-6 p-6 card-study flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-50">
                  Target Belajar Mandiri
                </h2>
                <p className="text-xs text-slate-400">
                  Daftar target dan catatan kemajuan belajar yang telah kamu selesaikan
                </p>
              </div>
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
            </div>

            {/* Quick Add Milestone */}
            <form onSubmit={handleAddMilestoneQuick} className="flex gap-2">
              <input
                type="text"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
                placeholder="Tambah target belajar baru..."
                className="flex-1 px-3.5 py-2 text-xs bg-[#0B101E] border border-white/[0.08] rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl btn-tactile-sky text-xs font-bold flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Catat</span>
              </button>
            </form>

            {/* Milestones List */}
            <div className="divide-y divide-slate-800/80 max-h-48 overflow-y-auto pr-1">
              {milestones.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Belum ada target mandiri. Tambahkan target belajarmu di atas!
                </div>
              ) : (
                milestones.map((ms, idx) => (
                  <div
                    key={`profil-ms-${ms.id || 'item'}-${idx}`}
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
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                      aria-label="Hapus milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] text-xs text-slate-400 flex items-center justify-between">
            <span>Sinkronisasi Cloud 24/7 terakhir:</span>
            <span className="font-mono tabular-nums text-sky-400">{studyProgress.lastUpdated}</span>
          </div>
        </section>

        {/* Right: Security Center & Theme (6 cols) */}
        <section className="lg:col-span-6 p-6 card-study flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-50">
                  Pengaturan Profil & Keamanan Akun
                </h2>
                <p className="text-xs text-slate-400">
                  Perbarui nama tampilan, kata sandi scrypt, atau PIN keamanan
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

            {/* Pengaturan Tema Application Mode */}
            <div className="p-4 rounded-[18px] bg-[#0B101E] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Preferensi Tema Tampilan</span>
                <span className="text-[11px] font-mono text-sky-400 font-semibold">Tersimpan di Cloud</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => onToggleTheme && onToggleTheme('dark')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    themeMode === 'dark'
                      ? 'bg-sky-400 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🌙 Tema Gelap (Dark)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleTheme && onToggleTheme('light')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    themeMode === 'light'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>☀️ Tema Terang (Light)</span>
                </button>
              </div>
            </div>

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
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#0B101E] border border-white/[0.08] rounded-xl text-slate-100 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Username GitHub Pribadi
                </label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="Contoh: Khasanah-Kh"
                  className="w-full px-4 py-2 text-xs sm:text-sm font-mono bg-[#0B101E] border border-white/[0.08] rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
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
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#0B101E] border border-white/[0.08] rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
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
                  className="w-full px-4 py-2 text-xs sm:text-sm font-mono bg-[#0B101E] border border-white/[0.08] rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 tabular-nums"
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
          </div>
        </section>
      </div>
    </div>
  );
};
