/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MIMI SHARE CARD & MODAL (4 PLATFORM: WA STORY, IG STORY, THREADS, TIKTOK) — MIMI V15 V2
 * - `generateMimiCard()`: Canvas 1080x1920 gradient ungu-pink (#8A2BE2 -> #FF6B9D),
 *   angka besar 220px bold Rank/Skor, nama besar, badge, Match X/100, MIMI ID,
 *   link `mimi15.asia/duel?invite=...` di gambar + QR matrix.
 * - `MimiShareModal`: Preview kartu + caption + link klik + 4 tombol sosmed + 180 particle confetti.
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  MimiShareData,
  PUBLIC_LINKS,
  getShareCaption,
  dataUrlToPngFile,
  downloadShareCardPng,
} from '../services/shareService';

/**
 * Efek Confetti 180 Particle saat modal muncul atau saat user menekan tombol share.
 */
export function fire180ShareConfetti(): void {
  if (typeof window === 'undefined') return;
  try {
    confetti({
      particleCount: 180,
      spread: 95,
      origin: { y: 0.58 },
      colors: ['#8A2BE2', '#FF6B9D', '#FFD700', '#38BDF8', '#34D399'],
    });
  } catch {}
}

/**
 * Menggambar kartu pencapaian vertikal 1080x1920px kualitas tinggi untuk IG Story, WA Story, Threads & TikTok.
 */
export function generateMimiCard(data: MimiShareData): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Background Gradient Ungu-Pink (#8A2BE2 -> #FF6B9D)
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
  bgGrad.addColorStop(0, '#8A2BE2');
  bgGrad.addColorStop(0.52, '#B8338A');
  bgGrad.addColorStop(1, '#FF6B9D');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // Decorative Cyber Glow Circles
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(920, 260, 320, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(160, 1620, 380, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Inner Dark Glass Card Frame
  ctx.save();
  ctx.fillStyle = 'rgba(11, 17, 32, 0.82)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(70, 110, 940, 1700, 56);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Top Header Pill
  ctx.textAlign = 'center';
  ctx.fillStyle = '#38BDF8';
  ctx.font = '900 34px sans-serif';
  ctx.fillText('⚡ MIMI V15 • ARENA DUEL INDONESIA ⚡', 540, 220);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText(data.reasonTitle || '🏆 VICTORY & RANK ACHIEVEMENT', 540, 290);

  // 2. Angka Besar 220px Bold (Skor / Rank)
  ctx.save();
  const numGrad = ctx.createLinearGradient(240, 380, 840, 620);
  numGrad.addColorStop(0, '#FDE047');
  numGrad.addColorStop(1, '#F97316');
  ctx.fillStyle = numGrad;
  ctx.font = '900 220px sans-serif';
  ctx.fillText(`${data.score}`, 540, 560);
  ctx.restore();

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '900 44px sans-serif';
  ctx.fillText(`TOTAL POIN • RANK #${data.rank}`, 540, 635);

  // 3. Nama Besar & Badge
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 74px sans-serif';
  const displayTitle = data.isCreator ? `${data.name} 👑 DEV` : data.name;
  ctx.fillText(displayTitle.slice(0, 22), 540, 790);

  // Level Badge Pill
  ctx.save();
  ctx.fillStyle = 'rgba(250, 204, 21, 0.2)';
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(290, 845, 500, 90, 45);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FDE047';
  ctx.font = '900 44px sans-serif';
  ctx.fillText(`👑 LEVEL ${String(data.badge).toUpperCase()}`, 540, 905);
  ctx.restore();

  // 4. Match X/100 & MIMI ID Permanen Box
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(140, 1000, 800, 260, 36);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 42px monospace';
  ctx.fillText(`🎯 Match ${data.matchProgress}/100 • Anti-Ulang 1000 Soal`, 540, 1095);

  ctx.fillStyle = '#FACC15';
  ctx.font = '900 56px monospace';
  ctx.fillText(`ID MIMI: ${data.mimiId}`, 540, 1195);
  ctx.restore();

  // 5. Stylized QR Code Matrix + Public Link on Image
  const qrSize = 180;
  const qrX = 450;
  const qrY = 1320;
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 20);
  ctx.fill();

  ctx.fillStyle = '#0F172A';
  const cells = 9;
  const cellSize = qrSize / cells;
  const seedStr = `${data.mimiId}_${data.score}_${data.rank}`;
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const isCorner =
        (r < 3 && c < 3) || (r < 3 && c >= cells - 3) || (r >= cells - 3 && c < 3);
      const charCode = seedStr.charCodeAt((r * cells + c) % seedStr.length);
      if (isCorner || (charCode + r * 7 + c * 13) % 2 === 0) {
        ctx.fillRect(qrX + c * cellSize, qrY + r * cellSize, cellSize - 2, cellSize - 2);
      }
    }
  }
  ctx.restore();

  // Public Link Box at Bottom
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('MABAR DUEL YUK? KLIK / BUKA LINK:', 540, 1605);

  ctx.fillStyle = '#38BDF8';
  ctx.font = '900 38px monospace';
  ctx.fillText(`mimi15.asia/duel?invite=${data.mimiId}`, 540, 1668);

  ctx.fillStyle = '#F472B6';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('#MimiV15 • Ruang Belajar & Arena Duel Masa Depan', 540, 1745);

  return canvas.toDataURL('image/png');
}

interface MimiShareModalProps {
  data: MimiShareData | null;
  onClose: () => void;
}

export const MimiShareModal: React.FC<MimiShareModalProps> = ({ data, onClose }) => {
  const [cardDataUrl, setCardDataUrl] = useState<string>('');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    fire180ShareConfetti();
    const url = generateMimiCard(data);
    setCardDataUrl(url);
  }, [data]);

  if (!data) return null;

  const caption = getShareCaption(data);
  const publicLink = PUBLIC_LINKS.duelRoom(data.mimiId);
  const liveDeepLink = PUBLIC_LINKS.appDeepLink(data.mimiId);

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch {}
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  // 1. 💬 Story WA (Web Share API + wa.me link bisa diklik langsung)
  const handleShareWhatsApp = async () => {
    fire180ShareConfetti();
    await handleCopyCaption();
    try {
      if (navigator.share) {
        const pngFile = await dataUrlToPngFile(cardDataUrl, `mimi-duel-${data.mimiId}.png`);
        if (pngFile && navigator.canShare && navigator.canShare({ files: [pngFile] })) {
          await navigator.share({
            title: 'Duel Arena MIMI V15',
            text: caption,
            files: [pngFile],
          });
          setShareFeedback('✅ Berhasil membuka menu Share Story WA!');
          return;
        }
        await navigator.share({
          title: 'Duel Arena MIMI V15',
          text: caption,
          url: publicLink,
        });
        return;
      }
    } catch {}

    const waUrl = `https://wa.me/?text=${encodeURIComponent(caption)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setShareFeedback('💬 Membuka WhatsApp dengan caption & link room yang langsung bisa diklik!');
  };

  // 2. 📸 IG Story (Download PNG 1080x1920 + salin caption + pandu buka IG Story)
  const handleShareInstagramStory = async () => {
    fire180ShareConfetti();
    await handleCopyCaption();
    downloadShareCardPng(cardDataUrl, data.mimiId);

    try {
      if (navigator.share) {
        const pngFile = await dataUrlToPngFile(cardDataUrl, `mimi-ig-story-${data.mimiId}.png`);
        if (pngFile && navigator.canShare && navigator.canShare({ files: [pngFile] })) {
          await navigator.share({
            title: 'MIMI V15 IG Story',
            text: caption,
            files: [pngFile],
          });
          return;
        }
      }
    } catch {}

    setShareFeedback(
      '📸 Kartu 1080x1920 PNG telah diunduh & caption disalin! Silakan buka Instagram Story dan pilih kartu pencapaianmu.'
    );
  };

  // 3. 🧵 Threads (Share text + file + link klik)
  const handleShareThreads = async () => {
    fire180ShareConfetti();
    await handleCopyCaption();
    try {
      if (navigator.share) {
        const pngFile = await dataUrlToPngFile(cardDataUrl, `mimi-threads-${data.mimiId}.png`);
        if (pngFile && navigator.canShare && navigator.canShare({ files: [pngFile] })) {
          await navigator.share({
            title: 'MIMI V15 Threads',
            text: caption,
            files: [pngFile],
          });
          return;
        }
      }
    } catch {}

    const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(caption)}`;
    window.open(threadsUrl, '_blank', 'noopener,noreferrer');
    setShareFeedback('🧵 Membuka Threads dengan caption & link room klik otomatis!');
  };

  // 4. 🎵 TikTok (Download PNG 1080x1920 + salin caption)
  const handleShareTikTok = async () => {
    fire180ShareConfetti();
    await handleCopyCaption();
    downloadShareCardPng(cardDataUrl, data.mimiId);
    setShareFeedback(
      '🎵 Kartu 1080x1920 PNG telah diunduh & caption #MimiV15 disalin! Siap di-upload ke TikTok Story/Post.'
    );
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#0F172A] border border-pink-500/30 shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden text-white my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#8A2BE2] to-[#FF6B9D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Bagikan Pencapaian Duel MIMI V15
              </h3>
              <p className="text-[11px] text-white/90">
                Kartu Story 1080×1920 + Link Klik Langsung ke Room Duel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/25 hover:bg-black/45 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Card Preview + Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-4 items-center">
            <div className="mx-auto w-[140px] sm:w-[150px] aspect-[9/16] rounded-2xl overflow-hidden border-2 border-pink-400/50 shadow-xl bg-[#0B1120] relative group">
              {cardDataUrl && (
                <img
                  src={cardDataUrl}
                  alt="Mimi Share Card 1080x1920"
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => downloadShareCardPng(cardDataUrl, data.mimiId)}
                className="absolute bottom-2 inset-x-2 py-1 px-2 rounded-lg bg-black/75 text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Unduh PNG</span>
              </button>
            </div>

            {/* Caption & Clickable Link Box */}
            <div className="space-y-2.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="font-bold text-pink-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Caption Otomatis (Siap Tempel):</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="text-sky-300 hover:text-sky-200 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCaption ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCaption ? 'Disalin!' : 'Salin Caption'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0B1120] border border-slate-800 text-[11px] text-slate-200 font-mono leading-relaxed select-all">
                  {caption}
                </div>
              </div>

              {/* Direct Clickable Room Invite Link */}
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-400/30 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-sky-300">
                  <span>🔗 LINK PUBLIK KLIK LANGSUNG KE ROOM:</span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
                  </button>
                </div>
                <a
                  href={liveDeepLink}
                  className="text-xs font-mono font-bold text-sky-400 hover:underline flex items-center gap-1 break-all"
                >
                  <span>{publicLink}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {shareFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs font-bold">
              {shareFeedback}
            </div>
          )}

          {/* 4 Tombol Platform Share */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Pilih Platform Share (1 Klik):
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-3 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>💬 Story WA (Link Klik)</span>
              </button>

              <button
                type="button"
                onClick={handleShareInstagramStory}
                className="py-3 px-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>📸 IG Story (PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleShareThreads}
                className="py-3 px-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>🧵 Threads (Text+Link)</span>
              </button>

              <button
                type="button"
                onClick={handleShareTikTok}
                className="py-3 px-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-rose-500 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>🎵 TikTok (Unduh PNG)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
