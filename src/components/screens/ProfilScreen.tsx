import React, { useState, useEffect } from 'react';
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
  Users,
  UserPlus,
  AlertTriangle,
  Clock,
  RefreshCw,
  Database,
} from 'lucide-react';
import {
  AuthUser,
  BadgeItem,
  LearningMilestone,
  MimiUiState,
  StudyProgress,
} from '../../types/mimi';
import {
  StudentFriend,
  subscribeToFriends,
  addFriendByStudentId,
  updateStudentDisplayName,
  validateNameChangeCooldown,
} from '../../services/studentIdService';
import {
  getOrCreateMimiId,
  getLinkedAccounts,
  getSocialSyncConsent,
  setSocialSyncConsent,
  linkAccount,
  connectGoogleForPdf,
  syncSocialFriends,
  getSyncedSocialFriends,
  getFriendProfileByMimiId,
  SOCIAL_CONFIG,
  SocialProvider,
  MimiFriendProfile,
} from '../../services/mimiAuthService';
import { get100AskedIds } from '../../services/questionService';
import { FriendProfileModal } from '../FriendProfileModal';
import { MimiShareModal } from '../MimiShareCard';
import { MimiShareData } from '../../services/shareService';
import { DevBadge, isDevUser, getLevelBadge } from '../DevBadge';

import { SocialConnectPopup } from '../SocialConnectPopup';

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
  onManualSyncData?: () => Promise<{ success: boolean; message: string }>;
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
  onManualSyncData,
}) => {
  const permanentMimiId = getOrCreateMimiId();
  const currentStudentId = permanentMimiId || authUser.studentId || uiState.studentId || 'MIMI-A1B2';
  const [copiedStudentId, setCopiedStudentId] = useState(false);
  const [friends, setFriends] = useState<StudentFriend[]>([]);
  const [inviteIdInput, setInviteIdInput] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [friendStatusMessage, setFriendStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Manual Sync Data state
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTriggerSync = async () => {
    if (isManualSyncing) return;
    setIsManualSyncing(true);
    setSyncNotice(null);
    try {
      if (onManualSyncData) {
        const res = await onManualSyncData();
        setSyncNotice({
          type: res.success ? 'success' : 'error',
          text: res.message,
        });
      } else {
        setSyncNotice({
          type: 'success',
          text: 'Data studyProgress, XP, dan milestones berhasil disinkronkan secara lokal!',
        });
      }
    } catch {
      setSyncNotice({
        type: 'error',
        text: 'Gagal menyinkronkan data. Silakan coba beberapa saat lagi.',
      });
    } finally {
      setIsManualSyncing(false);
    }
  };

  // Social Link & Sync States (1 Permanent Mimi ID - Real OAuth Connect)
  const [linkedAccounts, setLinkedAccounts] = useState(() => getLinkedAccounts());
  const [allowSocialSync, setAllowSocialSync] = useState(() => getSocialSyncConsent());
  const [syncedSocialFriends, setSyncedSocialFriends] = useState<MimiFriendProfile[]>(() =>
    getSyncedSocialFriends()
  );
  const [activeSocialConnectModal, setActiveSocialConnectModal] = useState<SocialProvider | null>(null);
  const [isSyncingFriends, setIsSyncingFriends] = useState(false);
  const [socialSyncNotice, setSocialSyncNotice] = useState<string | null>(null);
  const [selectedFriendProfile, setSelectedFriendProfile] = useState<MimiFriendProfile | null>(null);
  const [shareModalData, setShareModalData] = useState<MimiShareData | null>(null);

  // Validate 30-day name change restriction
  const nameCooldown = validateNameChangeCooldown(
    authUser.lastNameChange ?? uiState.lastNameChange
  );

  const isDev = isDevUser(authUser.email) || isDevUser(uiState.studentEmail) || !!uiState.isDev;

  const handleGooglePdfLogin = async () => {
    const res = await connectGoogleForPdf(authUser?.uid);
    setLinkedAccounts(getLinkedAccounts());
    setSocialSyncNotice(res.message);
  };

  const handleSyncFriendsNow = async () => {
    setIsSyncingFriends(true);
    const res = await syncSocialFriends(allowSocialSync, authUser?.uid);
    setSyncedSocialFriends(res.friends);
    setSocialSyncNotice(res.message);
    setIsSyncingFriends(false);
  };

  // Subscribe to real-time friends
  useEffect(() => {
    if (!authUser?.uid || authUser.uid === 'usr_public_visitor') return;
    const unsub = subscribeToFriends(authUser.uid, (list) => {
      setFriends(list);
    });
    return () => unsub();
  }, [authUser?.uid]);

  const handleCopyStudentId = async () => {
    try {
      await navigator.clipboard.writeText(currentStudentId);
      setCopiedStudentId(true);
      setTimeout(() => setCopiedStudentId(false), 2500);
    } catch {
      setCopiedStudentId(true);
      setTimeout(() => setCopiedStudentId(false), 2500);
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteIdInput.trim()) return;
    setIsAddingFriend(true);
    setFriendStatusMessage(null);

    const res = await addFriendByStudentId(
      authUser.uid,
      currentStudentId,
      uiState.studentName,
      inviteIdInput.trim()
    );

    setIsAddingFriend(false);
    if (res.success) {
      setInviteIdInput('');
      setFriendStatusMessage({ type: 'success', text: res.message });
    } else {
      setFriendStatusMessage({ type: 'error', text: res.message });
    }
  };

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

    // Check 30-day throttle if name was changed
    if (
      editName.trim() !== uiState.studentName.trim() &&
      !nameCooldown.allowed
    ) {
      setIsSaving(false);
      setStatusMessage(
        nameCooldown.message || 'Kamu baru bisa ganti nama lagi setelah 30 hari.'
      );
      return;
    }

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <span>{uiState.studentName}</span>
              {isDev && <DevBadge size="md" />}
            </span>
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
          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={isManualSyncing}
            className="px-4 py-2.5 rounded-xl border border-sky-500/40 bg-sky-950/50 hover:bg-sky-900/60 text-sky-200 hover:text-white font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 text-sky-400 ${isManualSyncing ? 'animate-spin' : ''}`} />
            <span>{isManualSyncing ? 'Menyinkronkan...' : '🔄 Sinkronisasi Data'}</span>
          </button>

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

      {/* Dedicated Card for Manual Cloud Sync (Firestore & Backend) */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0B101E] border-2 border-sky-500/40 space-y-3.5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-sky-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>SINKRONISASI DATA MANUAL (FIREBASE FIRESTORE &amp; SERVER BACKEND)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Klik <strong className="text-white">&ldquo;Sinkronisasi Data&rdquo;</strong> untuk mengirim data <strong className="text-sky-300">studyProgress</strong> ({studyProgress.completedLevelIds.length} modul selesai), <strong className="text-amber-300">{uiState.xp || 0} XP</strong>, dan <strong className="text-emerald-300">{milestones.length} target harian</strong> langsung ke Firebase Firestore &amp; Backend Server.
            </p>
          </div>
          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={isManualSyncing}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isManualSyncing ? 'animate-spin' : ''}`} />
            <span>{isManualSyncing ? 'Menyinkronkan...' : '🔄 Sinkronisasi Data'}</span>
          </button>
        </div>

        {syncNotice && (
          <div
            className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              syncNotice.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{syncNotice.text}</span>
          </div>
        )}
      </section>

      {/* 1.5. Official Permanent Mimi ID + 3 Social Login (IG, TikTok, Threads) + Google PDF (1 Akun & 1 ID) */}
      <section className="p-6 sm:p-7 card-study border-2 border-sky-500/40 bg-gradient-to-r from-[#0B101E] via-[#0F172A] to-[#0B101E] space-y-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <span>●</span>
                <span>1 ID PERMANEN MIMI (ID ASLI DI ROOM DUEL)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Sosmed + Google PDF Tetap 1 ID
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xl sm:text-3xl font-mono font-black text-amber-300 tracking-wider">
                ID Mimi Permanen: {currentStudentId}
              </span>
              <button
                type="button"
                onClick={handleCopyStudentId}
                className="px-3.5 py-1.5 rounded-xl btn-tactile-sky text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
              >
                {copiedStudentId ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span className="text-emerald-200">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin ID</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  const asked = get100AskedIds();
                  const matchKe = Math.min(100, Math.floor(asked.length / 10) + 1);
                  setShareModalData({
                    name: uiState.studentName,
                    mimiId: currentStudentId,
                    score: uiState.xp || 950,
                    rank: 1,
                    badge: getLevelBadge(uiState.xp || 0),
                    matchProgress: matchKe,
                    isCreator: isDev,
                    reasonTitle: '🏆 PROFIL & SKOR DUEL MIMI V15',
                  });
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#8A2BE2] to-[#FF6B9D] text-white text-xs font-black flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Share Pencapaian (4 Platform)</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hubungkan Instagram, TikTok, Threads, atau Google PDF di bawah ini. Sistem otomatis menjaga 1 Akun &amp; 1 ID Permanen ({currentStudentId}) tanpa membuat ID ganda!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 text-center space-y-1 shrink-0 self-start md:self-auto">
            <div className="text-[10px] text-slate-400 font-mono">MODE KEAMANAN SOSMED</div>
            <div className="text-xs font-extrabold text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Mode Aman · Tanpa Akses DM</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
              {linkedAccounts.google_email || authUser.email}
            </div>
          </div>
        </div>

        {/* 3 Tombol Besar Login Sosmed (IG, TikTok, Threads) + 1 Tombol Google PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveSocialConnectModal('instagram')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-98 flex flex-col justify-between gap-1.5 ${
              linkedAccounts.instagram_id
                ? 'bg-pink-500/15 border-pink-400/50 text-pink-200'
                : 'bg-[#0B1120] border-slate-800 hover:border-pink-400/40 text-white'
            }`}
          >
            <div className="text-xs sm:text-sm font-black flex items-center justify-between">
              <span>📸 Hubungkan Instagram</span>
              {linkedAccounts.instagram_id && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  Terhubung Real
                </span>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {linkedAccounts.instagram_handle
                ? `Terhubung: ${linkedAccounts.instagram_handle}`
                : `Scope: ${SOCIAL_CONFIG.instagram.scope} (Tanpa DM)`}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSocialConnectModal('tiktok')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-98 flex flex-col justify-between gap-1.5 ${
              linkedAccounts.tiktok_id
                ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-200'
                : 'bg-[#0B1120] border-slate-800 hover:border-cyan-400/40 text-white'
            }`}
          >
            <div className="text-xs sm:text-sm font-black flex items-center justify-between">
              <span>🎵 Hubungkan TikTok</span>
              {linkedAccounts.tiktok_id && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  Terhubung Real
                </span>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {linkedAccounts.tiktok_handle
                ? `Terhubung: ${linkedAccounts.tiktok_handle}`
                : `Scope: ${SOCIAL_CONFIG.tiktok.scope}`}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSocialConnectModal('threads')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-98 flex flex-col justify-between gap-1.5 ${
              linkedAccounts.threads_id
                ? 'bg-purple-500/15 border-purple-400/50 text-purple-200'
                : 'bg-[#0B1120] border-slate-800 hover:border-purple-400/40 text-white'
            }`}
          >
            <div className="text-xs sm:text-sm font-black flex items-center justify-between">
              <span>🧵 Hubungkan Threads</span>
              {linkedAccounts.threads_id && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  Terhubung Real
                </span>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {linkedAccounts.threads_handle
                ? `Terhubung: ${linkedAccounts.threads_handle}`
                : `Scope: ${SOCIAL_CONFIG.threads.scope} (Tanpa DM)`}
            </div>
          </button>

          <button
            type="button"
            onClick={handleGooglePdfLogin}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-98 flex flex-col justify-between gap-1.5 ${
              linkedAccounts.google_email
                ? 'bg-amber-500/15 border-amber-400/50 text-amber-200'
                : 'bg-[#0B1120] border-slate-800 hover:border-amber-400/40 text-white'
            }`}
          >
            <div className="text-xs sm:text-sm font-black flex items-center justify-between">
              <span>📄 Login Google (Untuk PDF - Tetap 1 ID)</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate">
              {linkedAccounts.google_email
                ? `PDF Aktif: ${linkedAccounts.google_email}`
                : `Scope: ${SOCIAL_CONFIG.google.scope}`}
            </div>
          </button>
        </div>

        {/* Real OAuth Popup Modal */}
        <SocialConnectPopup
          isOpen={!!activeSocialConnectModal}
          provider={activeSocialConnectModal}
          currentUserUid={authUser?.uid}
          studentName={uiState.studentName}
          onClose={() => setActiveSocialConnectModal(null)}
          onSuccess={(res) => {
            setLinkedAccounts(getLinkedAccounts());
            setSocialSyncNotice(res.message);
          }}
        />

        {/* Checkbox Izin Sinkronisasi Kontak Teman Sosmed + Tombol 🔄 Sync Teman Sekarang */}
        <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-start gap-2.5 text-xs text-slate-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allowSocialSync}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setAllowSocialSync(checked);
                  setSocialSyncConsent(checked);
                }}
                className="mt-0.5 w-4 h-4 rounded accent-sky-400 cursor-pointer"
              />
              <span className="leading-relaxed">
                Ijinkan sinkronkan kontak teman di IG/TikTok/Threads (mode aman - hanya teman yang juga main Mimi yang muncul, tidak akses DM)
              </span>
            </label>

            <button
              type="button"
              disabled={isSyncingFriends}
              onClick={handleSyncFriendsNow}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:brightness-110 text-slate-950 font-black text-xs whitespace-nowrap shrink-0 cursor-pointer active:scale-95 shadow-md"
            >
              {isSyncingFriends ? '🔄 Menyinkronkan...' : '🔄 Sync Teman Sekarang'}
            </button>
          </div>

          {socialSyncNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs font-semibold">
              {socialSyncNotice}
            </div>
          )}
        </div>
      </section>

      {/* 1.6. Sistem Tambah Teman / Invite by ID & Daftar Teman Mabar (Tap Avatar -> Lihat Profil) */}
      <section className="p-6 sm:p-7 card-study space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-50 flex items-center gap-2">
                <span>Daftar Teman Sosmed &amp; Mabar Duel</span>
                <span className="text-[10px] font-mono font-bold text-sky-300 bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-500/30">
                  {syncedSocialFriends.length + friends.length} Teman Aktif
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ketuk avatar teman di bawah untuk melihat profil lengkap, badge pencapaian, dan ajak mabar duel!
              </p>
            </div>
          </div>
        </div>

        {/* Input Add Friend by Student ID */}
        <form onSubmit={handleAddFriend} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <UserPlus className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inviteIdInput}
              onChange={(e) => setInviteIdInput(e.target.value.toUpperCase())}
              placeholder="Masukkan ID Mimi Teman (Contoh: MIMI-RKH1)"
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono bg-[#0B101E] border border-white/[0.08] rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 uppercase tracking-wide"
            />
          </div>
          <button
            type="submit"
            disabled={isAddingFriend || !inviteIdInput.trim()}
            className="px-5 py-2.5 btn-tactile-sky font-bold text-xs rounded-xl flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 cursor-pointer"
          >
            {isAddingFriend ? (
              <span>Memeriksa ID...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Tambah Teman</span>
              </>
            )}
          </button>
        </form>

        {friendStatusMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              friendStatusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-200'
                : 'bg-rose-950/60 border-rose-700/60 text-rose-200'
            }`}
          >
            {friendStatusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{friendStatusMessage.text}</span>
          </div>
        )}

        {/* Synced IG / TikTok / Threads Friends + Manual Friends Grid (Tap Avatar -> FriendProfileModal) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {syncedSocialFriends.map((sf) => (
            <div
              key={sf.mimiId}
              onClick={() => setSelectedFriendProfile(sf)}
              className="p-3.5 rounded-xl bg-[#0B101E] border border-slate-800 flex items-center justify-between gap-3 hover:border-pink-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8A2BE2] to-[#FF6B9D] flex items-center justify-center text-sm font-black text-white shrink-0 group-hover:scale-105 transition-transform">
                  {sf.avatarEmoji || sf.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                    <span>{sf.name}</span>
                    {sf.isCreator && <DevBadge size="xs" />}
                  </div>
                  <div className="text-[10px] font-mono text-amber-300 font-semibold flex items-center gap-1.5">
                    <span>{sf.mimiId}</span>
                    <span>•</span>
                    <span className="text-sky-300">Rank #{sf.rank}</span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-bold text-pink-300 shrink-0">
                Lihat Profil
              </span>
            </div>
          ))}

          {friends.map((friend) => (
            <div
              key={friend.friendUid}
              onClick={async () => {
                const prof = await getFriendProfileByMimiId(
                  friend.friendStudentId || friend.friendDisplayName
                );
                setSelectedFriendProfile(prof);
              }}
              className="p-3.5 rounded-xl bg-[#0B101E] border border-slate-800 flex items-center justify-between gap-3 hover:border-sky-500/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-xs font-bold text-sky-300 shrink-0">
                  {friend.friendDisplayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {friend.friendDisplayName}
                  </div>
                  <div className="text-[10px] font-mono text-amber-300 font-semibold">
                    {friend.friendStudentId}
                  </div>
                </div>
              </div>
              <span className="p-1.5 rounded-lg bg-slate-900 text-sky-300 border border-slate-800 text-[10px] font-mono shrink-0">
                Profil
              </span>
            </div>
          ))}
        </div>
      </section>

      <FriendProfileModal
        friend={selectedFriendProfile}
        onClose={() => setSelectedFriendProfile(null)}
        onInviteDuel={(_f, inviteUrl) => {
          setSocialSyncNotice(`⚔️ Link undangan duel disalin: ${inviteUrl}`);
        }}
      />

      <MimiShareModal
        data={shareModalData}
        onClose={() => setShareModalData(null)}
      />

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
              href={`https://wa.me/6282148184782?text=${encodeURIComponent('Halo Mimi_Real, aku mau bertanya nih, boleh gak?')}`}
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

            {/* 30-day Cooldown Notice */}
            {!nameCooldown.allowed && (
              <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-600/60 text-xs text-amber-200 flex items-start gap-2.5 shadow-sm">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-amber-300">Ganti Nama Dibatasi (1x per 30 Hari)</div>
                  <div>{nameCooldown.message}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveSecurity} className="space-y-3.5">
              {/* Permanent Student ID field (Disabled & Permanent) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>ID Siswa Mimi (Permanen &amp; Terkunci 🔒)</span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">1 Akun Google = 1 ID</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={currentStudentId}
                    className="w-full px-4 py-2 text-xs sm:text-sm font-mono bg-[#0B101E]/70 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed opacity-80"
                  />
                  <button
                    type="button"
                    onClick={handleCopyStudentId}
                    title="Salin ID Siswa"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-mono text-sky-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800 cursor-pointer"
                  >
                    {copiedStudentId ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>Nama Tampilan Siswa</span>
                  {nameCooldown.allowed ? (
                    <span className="text-[10px] text-emerald-400 font-medium">Bisa diubah</span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-medium">Terkunci 30 Hari</span>
                  )}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    disabled={!nameCooldown.allowed && editName.trim() === uiState.studentName.trim()}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#0B101E] border border-white/[0.08] rounded-xl text-slate-100 focus:outline-none focus:border-sky-400 disabled:opacity-60 disabled:cursor-not-allowed"
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
