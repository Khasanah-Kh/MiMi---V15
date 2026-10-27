import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
  label?: string;
  compact?: boolean;
  onShareSuccess?: (method: 'native' | 'clipboard') => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  title = 'Room Belajar Mimi V15',
  text = 'Belajar bareng Mimi yuk!',
  url,
  className = '',
  label = 'Share Link',
  compact = false,
  onShareSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setToastMessage(null);
    }, 2600);
  };

  const fallbackCopyText = (shareUrl: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Link tercopy!');
      onShareSuccess?.('clipboard');
    } catch {
      showToast('Link tercopy!');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = url || window.location.href;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        showToast('Link tercopy!');
        onShareSuccess?.('native');
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        // Fallback to clipboard when Web Share API is blocked in iframe or desktop
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link tercopy!');
        onShareSuccess?.('clipboard');
        return;
      } catch {
        fallbackCopyText(shareUrl);
        return;
      }
    }

    fallbackCopyText(shareUrl);
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleShare}
        title="Bagikan Room Belajar Mimi V15"
        className={
          className ||
          `inline-flex items-center gap-1.5 rounded-xl font-bold transition-all active:scale-95 ${
            compact
              ? 'px-2.5 py-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80'
              : 'px-3.5 py-2 text-xs sm:text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 shadow-xs'
          }`
        }
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          <Share2 className="w-4 h-4 shrink-0" />
        )}
        <span>{copied ? 'Link tercopy!' : label}</span>
      </button>

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-xl border border-white/15 animate-bounce"
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
