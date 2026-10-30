/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * REAL SOCIAL OAUTH CONNECT POPUP & CONSENT MODAL — MIMI V15
 * - Menggunakan URL OAuth Resmi Direct Dialog (Mencegah buka aplikasi IG / 2x popup)
 *   Meta Dialog: https://www.facebook.com/v20.0/dialog/oauth?client_id=...&redirect_uri=...&scope=instagram_basic,business_basic&response_type=code&display=page
 *   TikTok Auth: https://www.tiktok.com/v2/auth/authorize/?client_key=...&redirect_uri=...&scope=user.info.basic&response_type=code
 * - Menggunakan window.location.href (Single Tab Navigation - Anti Double Popup)
 * - TAMPILKAN BOX INPUT REAL [ 🔑 BUTUH KODE DARI KAMU MET! ] JIKA APP ID / CLIENT KEY BELUM ADA
 * - ZERO MOCK DATA / ZERO FAKE HANDLE
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  Lock,
  ExternalLink,
  Sparkles,
  AlertCircle,
  KeyRound,
  Save,
} from 'lucide-react';
import {
  SocialProvider,
  SOCIAL_CONFIG,
  linkAccount,
  getOrCreateMimiId,
} from '../services/mimiAuthService';
import { BASE_URL } from '../services/userStatsService';

interface SocialConnectPopupProps {
  isOpen: boolean;
  provider: SocialProvider | null;
  currentUserUid?: string;
  studentName?: string;
  onClose: () => void;
  onSuccess: (res: {
    provider: SocialProvider;
    handle: string;
    mimiId: string;
    isVerified: boolean;
    message: string;
  }) => void;
}

export const SocialConnectPopup: React.FC<SocialConnectPopupProps> = ({
  isOpen,
  provider,
  currentUserUid,
  studentName = 'Bestie',
  onClose,
  onSuccess,
}) => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userPastedKey, setUserPastedKey] = useState<string>('');

  const mimiId = getOrCreateMimiId();

  // Helper untuk membaca Client ID / App ID
  const getActiveKeyForProvider = (p: SocialProvider): { key: string; isPasted: boolean } => {
    if (typeof window === 'undefined') return { key: '', isPasted: false };
    if (p === 'instagram' || p === 'threads') {
      const envKey = (import.meta.env.VITE_FB_APP_ID || '').trim();
      const localKey = (localStorage.getItem('VITE_FB_APP_ID') || '').trim();
      if (envKey) return { key: envKey, isPasted: false };
      if (localKey) return { key: localKey, isPasted: true };
      return { key: '', isPasted: false };
    }
    if (p === 'tiktok') {
      const envKey = (import.meta.env.VITE_TIKTOK_CLIENT_KEY || '').trim();
      const localKey = (localStorage.getItem('VITE_TIKTOK_CLIENT_KEY') || '').trim();
      if (envKey) return { key: envKey, isPasted: false };
      if (localKey) return { key: localKey, isPasted: true };
      return { key: '', isPasted: false };
    }
    return { key: '', isPasted: false };
  };

  const getRedirectUriForProvider = (p: SocialProvider): string => {
    if (p === 'instagram' || p === 'threads') {
      return (
        import.meta.env.VITE_IG_REDIRECT_URI || `${BASE_URL}/auth/instagram/callback`
      ).trim();
    }
    if (p === 'tiktok') {
      return (
        import.meta.env.VITE_TIKTOK_REDIRECT_URI || `${BASE_URL}/auth/tiktok/callback`
      ).trim();
    }
    return `${BASE_URL}/auth/${p}/callback`;
  };

  const keyInfo = provider ? getActiveKeyForProvider(provider) : { key: '', isPasted: false };
  const activeKey = userPastedKey.trim() || keyInfo.key;
  const redirectUri = provider ? getRedirectUriForProvider(provider) : '';

  useEffect(() => {
    if (!isOpen || !provider) {
      setIsAuthorizing(false);
      setAuthError(null);
      setUserPastedKey('');
      return;
    }
  }, [isOpen, provider]);

  if (!isOpen || !provider) return null;

  const cfg = SOCIAL_CONFIG[provider];

  const handleSavePastedKey = () => {
    if (!userPastedKey.trim()) return;
    const clean = userPastedKey.trim();
    if (provider === 'instagram' || provider === 'threads') {
      localStorage.setItem('VITE_FB_APP_ID', clean);
    } else if (provider === 'tiktok') {
      localStorage.setItem('VITE_TIKTOK_CLIENT_KEY', clean);
    }
  };

  const buildOAuthAuthUrl = (): string => {
    const key = activeKey;
    if (provider === 'instagram' || provider === 'threads') {
      return `https://www.facebook.com/v20.0/dialog/oauth?client_id=${encodeURIComponent(
        key
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=instagram_basic,business_basic&response_type=code&display=page`;
    }
    if (provider === 'tiktok') {
      return `https://www.tiktok.com/v2/auth/authorize/?client_key=${encodeURIComponent(
        key
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=user.info.basic&response_type=code`;
    }
    return `/auth/${provider}/login?mimiId=${encodeURIComponent(mimiId)}`;
  };

  const handleAuthorizeClick = () => {
    if (!activeKey) {
      setAuthError('App ID / Client Key belum diisi. Masukkan kode kamu di bawah ini.');
      return;
    }

    if (userPastedKey.trim()) {
      handleSavePastedKey();
    }

    setIsAuthorizing(true);
    setAuthError(null);

    // Simpan return URL untuk redirect setelah login
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oauth_return_url', window.location.href);
      } catch {}
    }

    const authUrl = buildOAuthAuthUrl();

    // SINGLE TAB NAVIGATION: Menggunakan window.location.href (No window.open / Anti 2x Popup)
    window.location.href = authUrl;
  };

  const getThemeGradient = () => {
    switch (provider) {
      case 'instagram':
        return 'from-purple-600 via-pink-600 to-amber-500';
      case 'tiktok':
        return 'from-cyan-500 via-slate-900 to-pink-500';
      case 'threads':
        return 'from-slate-900 via-purple-900 to-slate-950';
      case 'google':
        return 'from-blue-600 via-emerald-600 to-amber-500';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0F172A] border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden text-white max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Branding Provider */}
        <div className={`relative p-5 sm:p-6 bg-gradient-to-r ${getThemeGradient()} shrink-0`}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup OAuth Modal"
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black/30 border border-white/20 flex items-center justify-center text-2xl shadow-inner shrink-0">
              {cfg.icon}
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>REAL OAUTH PERMISSION DIALOG</span>
              </div>
              <h3 className="text-xl font-black text-white leading-tight">
                Hubungkan {cfg.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Missing Keys Request Box [ 🔑 BUTUH KODE DARI KAMU MET! ] */}
          {!activeKey ? (
            <div className="p-4 rounded-2xl bg-amber-950/40 border-2 border-amber-500/60 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs sm:text-sm">
                <KeyRound className="w-4 h-4 shrink-0 text-amber-400" />
                <span>[ 🔑 BUTUH KODE DARI KAMU MET! ]</span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                Untuk menyambungkan <strong className="text-white">{cfg.name}</strong>, aku butuh:
              </p>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-amber-200 mb-1">
                    □ {provider === 'tiktok' ? 'Client Key TikTok' : 'App ID Facebook/Meta'}:
                  </label>
                  <input
                    type="text"
                    value={userPastedKey}
                    onChange={(e) => setUserPastedKey(e.target.value)}
                    placeholder={
                      provider === 'tiktok'
                        ? 'Contoh: aw8xyz... (TikTok Client Key)'
                        : 'Contoh: 14195345... (Meta App ID)'
                    }
                    className="w-full px-3 py-2 bg-[#0B1120] border border-amber-500/50 rounded-xl text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-200 mb-1">
                    □ Redirect URI:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={redirectUri}
                    className="w-full px-3 py-2 bg-[#0B1120]/70 border border-slate-700 rounded-xl text-sky-300 text-[11px] font-mono select-all"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-300 space-y-1 bg-black/30 p-2.5 rounded-xl border border-white/10">
                <div className="font-bold text-amber-300">Kamu ambil di:</div>
                {provider === 'tiktok' ? (
                  <div>• TikTok: developers.tiktok.com &gt; My Apps</div>
                ) : (
                  <div>• FB/IG/Threads: developers.facebook.com &gt; My Apps &gt; MIMI</div>
                )}
                <div className="text-[10px] text-slate-400">
                  Tempel kode di atas atau masukkan ke .env, lalu klik Lanjutkan.
                </div>
              </div>
            </div>
          ) : (
            /* Status Client ID Configured */
            <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-2">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>OAUTH CONFIGURATION READY ({cfg.name}):</span>
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="text-slate-300 break-all">
                  <span className="text-slate-400">App ID / Client Key:</span>{' '}
                  <span className="text-emerald-400 font-bold">{activeKey.slice(0, 6)}***</span>
                </div>
                <div className="text-slate-300 break-all">
                  <span className="text-slate-400">Redirect URI:</span>{' '}
                  <span className="text-sky-300 font-bold">{redirectUri}</span>
                </div>
              </div>
            </div>
          )}

          {/* Requested Scopes list */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Izin OAuth Resmi ({cfg.name}):</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0B1120] border border-slate-800/90 text-xs space-y-2 text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">
                    Direct Permission Box ({provider === 'tiktok' ? 'TikTok Auth' : 'Facebook Dialog'})
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Membuka kotak persetujuan resmi di browser tanpa membuka aplikasi native feed.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-slate-800">
                <Lock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sky-300">Jaminan Mode Aman (Tanpa Akses DM)</span>
                  <p className="text-[11px] text-slate-400">
                    Mimi TIDAK AKAN PERNAH meminta, membaca, atau mengakses pesan pribadi (DM)/chat kamu.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {authError && (
            <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Peringatan Konfigurasi</span>
              </div>
              <p className="text-[11px] leading-relaxed break-all font-mono">{authError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isAuthorizing}
              className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isAuthorizing || (!activeKey && !userPastedKey.trim())}
              onClick={handleAuthorizeClick}
              className={`flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r ${getThemeGradient()} hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50`}
            >
              {isAuthorizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengarahkan ke Permission Box...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>Mulai Real OAuth Connect</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialConnectPopup;
