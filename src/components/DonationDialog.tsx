import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  X,
  Copy,
  Check,
  QrCode,
  Smartphone,
  ExternalLink,
  Building2,
  ZoomIn,
} from 'lucide-react';

interface DonationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationDialog: React.FC<DonationDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedDana, setCopiedDana] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [showQrisZoom, setShowQrisZoom] = useState(false);

  const danaNumber = '082148184782';
  const seabankNumber = '901075234508';
  const waNumber = '082148184782';
  const waLink = 'https://wa.me/message/2CFS37UB7TKUA1';

  const copyToClipboard = async (
    text: string,
    setCopied: (v: boolean) => void
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          className="relative w-full max-w-2xl rounded-[20px] bg-[#0F172A] border border-white/10 shadow-[0_12px_48px_rgba(0,0,0,0.65)] overflow-hidden text-slate-200 my-auto"
        >
          {/* Header Banner: Dark Navy + Soft Purple Glow */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-violet-700/80 via-purple-700/70 to-indigo-800/80 border-b border-white/10 shadow-[0_0_35px_rgba(124,58,237,0.28)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner shrink-0">
                <Heart className="w-5 h-5 text-rose-300 fill-rose-300/40" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-50 tracking-tight flex items-center gap-2">
                  <span>✨ Bantu Mimi Tetap Aktif</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ● Aktif 24 Jam
                  </span>
                </h3>
                <p className="text-xs text-violet-200/90 mt-0.5">
                  Room ini dibuat dari hati Mimi untuk seluruh pelajar Indonesia ✨
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-violet-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Tutup dialog donasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
            {/* Pesan Sahabat: Dari Hati Mimi */}
            <div className="p-5 sm:p-6 rounded-[20px] bg-[#16213b]/85 border border-white/10 shadow-md space-y-3">
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
                      {danaNumber}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => copyToClipboard(danaNumber, setCopiedDana)}
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
                  </motion.button>
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
                      {seabankNumber}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => copyToClipboard(seabankNumber, setCopiedBank)}
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
                  </motion.button>
                </div>
              </div>

              {/* KARTU 3 - GOPAY: Tampilkan QRIS kecil /public/qris-gopay.png (ADREE DIGI) di pojok kanan 80x80px */}
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
                  <div className="pt-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowQrisZoom(true)}
                      className="px-5 py-2.5 rounded-[20px] font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/30 shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Lihat QRIS</span>
                    </motion.button>
                  </div>
                </div>

                {/* Tampilkan QRIS kecil 80x80px di pojok kanan */}
                <div
                  onClick={() => setShowQrisZoom(true)}
                  title="Klik untuk perbesar QRIS"
                  className="w-20 h-20 sm:w-[80px] sm:h-[80px] bg-white rounded-2xl p-1.5 shrink-0 flex items-center justify-center border-2 border-emerald-400/50 shadow-lg cursor-pointer hover:scale-105 transition-transform group relative self-center sm:self-auto"
                >
                  <img
                    src="/qris-gopay.png"
                    alt="QRIS ADREE DIGI GoPay Merchant"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
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
                    No: {waNumber}
                  </div>
                </div>

                {/* Tombol besar hijau: 💬 Tanya / Request Pelajaran - Chat WA Mimi */}
                <a
                  href={waLink}
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
          </div>
        </motion.div>
      </div>

      {/* LIGHTBOX POPUP FULLSCREEN ZOOM QRIS */}
      {showQrisZoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          onClick={() => setShowQrisZoom(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-sm w-full bg-white rounded-3xl p-4 shadow-2xl border-4 border-emerald-400 text-slate-900 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQrisZoom(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full h-auto max-h-[70vh] flex items-center justify-center pt-2">
              <img
                src="/qris-gopay.png"
                alt="QRIS ADREE DIGI GoPay Merchant"
                className="w-full h-auto max-h-[65vh] object-contain rounded-2xl"
              />
            </div>

            <div className="w-full mt-3 pt-3 border-t border-slate-200 text-center space-y-1">
              <p className="font-extrabold text-sm text-slate-900">
                QRIS ADREE DIGI BALIKPAPAN
              </p>
              <p className="text-xs text-slate-600">
                Bisa dari GoPay, BCA, Mandiri, BNI, BRI dan seluruh bank / e-wallet.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
