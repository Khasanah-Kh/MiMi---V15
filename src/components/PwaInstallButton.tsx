import React, { useEffect, useState } from 'react';
import { Download, ExternalLink, CheckCircle2, Smartphone, X } from 'lucide-react';

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
    const savedInstalled = localStorage.getItem('mimi_v15_pwa_installed') === '1';
    return isStandalone || savedInstalled;
  });
  const [showInstallButton, setShowInstallButton] = useState<boolean>(true);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [toastText, setToastText] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      globalDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setShowInstallButton(true);
    };

    const handleCustomInstallable = () => {
      if (globalDeferredPrompt) {
        setDeferredPrompt(globalDeferredPrompt);
        setShowInstallButton(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
      localStorage.setItem('mimi_v15_pwa_installed', '1');
      setToastText('Aplikasi Room Belajar Mimi V15 berhasil di-install!');
      setTimeout(() => setToastText(null), 3000);
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

  if (!showInstallButton) return null;

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isInstalled) {
      setToastText('Membuka Room Belajar Mimi V15 di App Mode...');
      setTimeout(() => setToastText(null), 2500);
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
      return;
    }

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
        }
      } catch {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title={isInstalled ? 'Buka di App Mimi V15' : 'Download App Room Belajar Mimi V15'}
        className={
          className ||
          `inline-flex items-center gap-1.5 rounded-xl font-bold transition-all active:scale-95 ${
            isInstalled
              ? compact
                ? 'px-2.5 py-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'px-3.5 py-2 text-xs sm:text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 shadow-xs'
              : compact
              ? 'px-2.5 py-1.5 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-xs'
              : 'px-3.5 py-2 text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-sm'
          }`
        }
      >
        {isInstalled ? (
          <>
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span>Buka di App</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 shrink-0" />
            <span>{compact ? 'Download App' : 'Download App Mimi'}</span>
          </>
        )}
      </button>

      {toastText && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-950 text-white text-xs sm:text-sm font-bold shadow-xl border border-emerald-400/30"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastText}</span>
        </div>
      )}

      {showGuideModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Download App Room Belajar Mimi V15
                  </h3>
                  <p className="text-xs text-slate-500">
                    Install PWA resmi ke layar utama HP / Laptop kamu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 mb-4">
              <p className="font-bold text-slate-800">Cara Install Cepat (1 Klik):</p>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>
                  Di <strong>Chrome Android / Desktop</strong>: klik ikon{' '}
                  <strong>Install App / Tambahkan ke Layar Utama</strong> di pojok kanan address bar.
                </li>
                <li>
                  Di <strong>Safari iPhone / iPad</strong>: tap tombol <strong>Share</strong> lalu pilih{' '}
                  <strong>Add to Home Screen (Tambahkan ke Layar Utama)</strong>.
                </li>
              </ol>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsInstalled(true);
                  localStorage.setItem('mimi_v15_pwa_installed', '1');
                  setShowGuideModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500"
              >
                Tandai Sudah Di-install (Buka di App)
              </button>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PwaInstallButton;
