import React, { useEffect, useState } from 'react';
import {
  Download,
  ExternalLink,
  CheckCircle2,
  Smartphone,
  Laptop,
  Puzzle,
  Copy,
  Check,
  X,
  Globe,
} from 'lucide-react';
import { NEW_PUBLIC_APP_URL, NEW_DEV_APP_URL } from './ShareButton';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('mimi-pwa-installable'));
  });
}

function triggerBrowserFileDownload(
  filename: string,
  content: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
}

export function downloadDesktopUrlShortcut() {
  const urlContent = `[InternetShortcut]\r\nURL=${NEW_PUBLIC_APP_URL}\r\nIconIndex=0\r\n`;
  triggerBrowserFileDownload(
    'Room-Belajar-Mimi-V15.url',
    urlContent,
    'application/internet-shortcut'
  );
}

export function downloadStandaloneHtmlShortcut() {
  const htmlContent = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="theme-color" content="#0B1120" />
  <title>Room Belajar Mimi V15 — Shortcut App</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { width: 100%; height: 100%; background: #0B1120; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; }
    .topbar { height: 42px; background: #080d1a; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; padding: 0 14px; font-size: 12px; }
    .brand { font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .btn { background: #10b981; color: #022c22; text-decoration: none; font-weight: 800; padding: 5px 12px; border-radius: 8px; font-size: 11px; }
    iframe { width: 100%; height: calc(100% - 42px); border: none; display: block; }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <span>✨ Room Belajar Mimi V15 (Shortcut App Laptop & HP)</span>
    </div>
    <a class="btn" href="${NEW_PUBLIC_APP_URL}" target="_blank" rel="noopener noreferrer">Buka Layar Penuh ↗</a>
  </div>
  <iframe src="${NEW_PUBLIC_APP_URL}" allow="microphone; clipboard-write; fullscreen"></iframe>
</body>
</html>`;
  triggerBrowserFileDownload(
    'Aplikasi-Mimi-V15-Shortcut.html',
    htmlContent,
    'text/html;charset=utf-8'
  );
}

export function downloadChromeAppBatchLauncher() {
  const batContent = `@echo off
title Room Belajar Mimi V15 - Chrome App Launcher
start chrome --app="${NEW_PUBLIC_APP_URL}" || start msedge --app="${NEW_PUBLIC_APP_URL}" || start "" "${NEW_PUBLIC_APP_URL}"
`;
  triggerBrowserFileDownload(
    'Buka-Mimi-V15-Chrome-App.bat',
    batContent,
    'application/x-bat'
  );
}

export function downloadChromeExtensionFiles() {
  const manifestJson = JSON.stringify(
    {
      manifest_version: 3,
      name: 'Room Belajar Mimi V15 — AI Tutor & Kurikulum Merdeka',
      short_name: 'Mimi V15',
      version: '15.2.0',
      description:
        'Ekstensi Chrome resmi Room Belajar Mimi V15 untuk akses kilat asisten belajar AI SD, SMP, SMA, SMK & Umum.',
      action: {
        default_title: 'Buka Room Belajar Mimi V15',
        default_popup: 'popup.html',
      },
      permissions: ['storage'],
    },
    null,
    2
  );

  const popupHtml = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Mimi V15 Extension</title>
  <style>
    body, html { margin: 0; padding: 0; width: 420px; height: 600px; background: #0B1120; overflow: hidden; font-family: system-ui, sans-serif; }
    .bar { height: 36px; background: #0f172a; color: #38bdf8; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; font-size: 11px; font-weight: 700; border-bottom: 1px solid #1e293b; }
    .bar a { color: #34d399; text-decoration: none; }
    iframe { width: 100%; height: 564px; border: 0; }
  </style>
</head>
<body>
  <div class="bar">
    <span>Mimi V15 Chrome Extension</span>
    <a href="${NEW_PUBLIC_APP_URL}" target="_blank" rel="noopener noreferrer">Tab Penuh ↗</a>
  </div>
  <iframe src="${NEW_PUBLIC_APP_URL}" allow="microphone; clipboard-write"></iframe>
</body>
</html>`;

  triggerBrowserFileDownload(
    'manifest.json',
    manifestJson,
    'application/json;charset=utf-8'
  );
  setTimeout(() => {
    triggerBrowserFileDownload(
      'popup.html',
      popupHtml,
      'text/html;charset=utf-8'
    );
  }, 350);
}

interface PwaInstallButtonProps {
  className?: string;
  compact?: boolean;
}

export const PwaInstallButton: React.FC<PwaInstallButtonProps> = ({
  className = '',
  compact = false,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    globalDeferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as any)?.standalone === true;
    return isStandalone;
  });
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [toastText, setToastText] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      globalDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleCustomInstallable = () => {
      if (globalDeferredPrompt) {
        setDeferredPrompt(globalDeferredPrompt);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
      localStorage.setItem('mimi_v15_pwa_installed', '1');
      setToastText('Aplikasi Room Belajar Mimi V15 berhasil di-install!');
      setTimeout(() => setToastText(null), 3500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('mimi-pwa-installable', handleCustomInstallable);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('mimi-pwa-installable', handleCustomInstallable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showQuickToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 3500);
  };

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const promptEvent = deferredPrompt || globalDeferredPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          localStorage.setItem('mimi_v15_pwa_installed', '1');
          globalDeferredPrompt = null;
          setDeferredPrompt(null);
          return;
        }
      } catch {
        // Fallback to download & extension hub modal
      }
    }

    setShowGuideModal(true);
  };

  const handleCopyPublicUrl = async () => {
    try {
      await navigator.clipboard.writeText(NEW_PUBLIC_APP_URL);
      setCopiedLink(true);
      showQuickToast('Link publik baru berhasil disalin!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title="Download Shortcut / Ekstensi Chrome / Install App Mimi V15"
        className={
          className ||
          `inline-flex items-center gap-1.5 rounded-xl font-bold transition-all active:scale-95 ${
            compact
              ? 'px-2.5 py-1.5 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-xs'
              : 'px-3.5 py-2 text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-sm'
          }`
        }
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>
          {compact
            ? 'Download App'
            : isInstalled
            ? 'Download Shortcut / Ekstensi'
            : 'Download App & Shortcut'}
        </span>
      </button>

      {toastText && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-950 text-white text-xs sm:text-sm font-bold shadow-xl border border-emerald-400/40"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastText}</span>
        </div>
      )}

      {showGuideModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-[#0D1326] text-slate-100 p-6 sm:p-7 shadow-2xl border border-slate-800 space-y-5 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Download Mimi V15 (Shortcut Laptop/HP & Ekstensi Chrome)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Unduh langsung lewat Chrome sebagai Shortcut, Aplikasi Web, atau Ekstensi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* New Public Link Action Buttons (Tanpa Teks URL Mentah) */}
            <div className="p-4 rounded-2xl bg-[#070b14] border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-extrabold text-sky-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Akses Link Publik Resmi (Aktif 24 Jam)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Salin link atau buka langsung di tab baru Chrome
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyPublicUrl}
                  className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>

                <a
                  href={NEW_PUBLIC_APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center gap-1.5"
                >
                  <span>Buka Aplikasi</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* 1-Click Direct Download Cards for Chrome */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1: Shortcut Laptop & HP (.html Mandiri) */}
              <div className="p-4 rounded-2xl bg-[#080d19] border border-slate-800 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>1. Shortcut App HP & Laptop</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Download file aplikasi mandiri (<code>.html</code>) yang bisa langsung diklik dari layar HP Android/iOS atau Desktop tanpa ribet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    downloadStandaloneHtmlShortcut();
                    showQuickToast('File Aplikasi-Mimi-V15-Shortcut.html berhasil di-download!');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Shortcut (.html)</span>
                </button>
              </div>

              {/* Card 2: Shortcut Desktop Windows/Mac (.url + .bat Chrome App) */}
              <div className="p-4 rounded-2xl bg-[#080d19] border border-slate-800 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-sky-400 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4" />
                    <span>2. Shortcut Desktop Laptop/PC</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Download shortcut ikon Desktop (<code>.url</code> &amp; <code>.bat</code>) untuk membuka Mimi V15 dalam mode jendela aplikasi Chrome.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      downloadDesktopUrlShortcut();
                      showQuickToast('Shortcut Desktop (.url) berhasil di-download!');
                    }}
                    className="flex-1 py-2.5 px-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Shortcut .URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadChromeAppBatchLauncher();
                      showQuickToast('Launcher Chrome App (.bat) berhasil di-download!');
                    }}
                    className="py-2.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                    title="Download Chrome App Mode Launcher (.bat)"
                  >
                    App .BAT
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Chrome Extension Package */}
            <div className="p-4 rounded-2xl bg-[#080d19] border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-indigo-300 flex items-center gap-1.5">
                  <Puzzle className="w-4 h-4 text-indigo-400" />
                  <span>3. Jadikan Ekstensi Chrome (Manifest V3)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Unduh paket ekstensi (<code>manifest.json</code> &amp; <code>popup.html</code>). Masukkan ke folder, buka <code>chrome://extensions</code> &rarr; aktifkan <strong>Developer mode</strong> &rarr; klik <strong>Load unpacked</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  downloadChromeExtensionFiles();
                  showQuickToast('File Ekstensi Chrome (manifest.json & popup.html) di-download!');
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shrink-0"
              >
                <Puzzle className="w-3.5 h-3.5" />
                <span>Download Ekstensi Chrome</span>
              </button>
            </div>

            {/* Quick Chrome Native Steps */}
            <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="font-bold text-slate-200">
                Tips Pasang Langsung dari Menu Chrome (Tanpa File):
              </div>
              <div>
                • <strong>Chrome Laptop/PC</strong>: Buka link publik di atas &rarr; Klik titik tiga <strong>⋮</strong> di kanan atas Chrome &rarr; <strong>Simpan dan bagikan (Save and share)</strong> &rarr; <strong>Buat pintasan (Create shortcut) / Instal halaman sebagai aplikasi</strong>.
              </div>
              <div>
                • <strong>Chrome HP (Android/iOS)</strong>: Buka link publik &rarr; Ketuk menu <strong>⋮</strong> atau <strong>Share</strong> &rarr; Pilih <strong>Tambahkan ke Layar Utama (Add to Home screen)</strong>.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PwaInstallButton;
