/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Send,
  ImagePlus,
  CheckCircle2,
  Trash2,
  Mail,
} from 'lucide-react';
import { submitErrorReport } from '../firebase';
import { OWNER_EMAIL } from '../services/emailService';

interface ErrorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export const ErrorReportModal: React.FC<ErrorReportModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  userName,
}) => {
  const [pesanError, setPesanError] = useState('');
  const [kategori, setKategori] = useState<'bug' | 'soal' | 'saran'>('bug');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string>('');
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compress uploaded image into a compact Base64 data URL (<180KB) so it stores reliably in Firestore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 720;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.65);
          setScreenshotDataUrl(compressed);
        }
      };
      img.src = String(ev.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pesanError.trim()) {
      setErrorMsg('Tuliskan deskripsi error atau masukan terlebih dahulu ya.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const prefix =
        kategori === 'bug'
          ? '[BUG / ERROR]'
          : kategori === 'soal'
          ? '[KOREKSI SOAL]'
          : '[MASUKAN / SARAN]';

      await submitErrorReport({
        emailPelapor: userEmail || 'tamu_anonim@mimi15.id',
        namaPelapor: userName || 'Bestie Pelajar (Tamu)',
        pesan: `${prefix} ${pesanError.trim()}`,
        screenshot: screenshotDataUrl,
        type: 'manual_report',
      });

      setIsSubmitted(true);
      setPesanError('');
      setScreenshotDataUrl('');
      setScreenshotName('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mengirim laporan. Coba lagi sebentar ya.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#0F172A] border border-amber-500/40 shadow-2xl overflow-hidden animate-fadeIn">
        {/* Top Bar */}
        <div className="px-5 py-4 bg-[#0B1120] border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">
                ⚠️ Lapor Error / Masukan ke Owner
              </h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Mail className="w-3 h-3 text-sky-400" />
                <span>Terkirim ke Firestore &amp; {OWNER_EMAIL}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">
                Laporan Berhasil Dikirim!
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Terima kasih bestie! Laporanmu sudah tercatat otomatis di database Firestore dan diteruskan ke email Owner ({OWNER_EMAIL}).
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs transition-colors cursor-pointer"
            >
              Tutup Jendela
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Kategori Laporan:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bug', label: '🐛 Bug / Error' },
                  { id: 'soal', label: '📚 Koreksi Soal' },
                  { id: 'saran', label: '💡 Masukan Fitur' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setKategori(item.id as any)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      kategori === item.id
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-[#0B1120] text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TextArea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Detail Error / Masukan:
              </label>
              <textarea
                rows={4}
                required
                value={pesanError}
                onChange={(e) => setPesanError(e.target.value)}
                placeholder="Ceritakan error yang kamu alami (misal: tombol tidak merespon, soal kurang jelas, atau saran fitur baru)..."
                className="w-full p-3 rounded-xl bg-[#0B1120] border border-slate-800 focus:border-amber-400 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none resize-none"
              />
            </div>

            {/* Upload Screenshot Optional */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Upload Screenshot (Opsional):</span>
                {screenshotName && (
                  <span className="text-[11px] font-mono text-emerald-400 truncate max-w-[180px]">
                    {screenshotName}
                  </span>
                )}
              </label>

              {!screenshotDataUrl ? (
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-sky-400/60 bg-[#0B1120] text-xs text-slate-400 hover:text-sky-300 cursor-pointer transition-colors">
                  <ImagePlus className="w-4 h-4 text-sky-400" />
                  <span>Pilih Gambar Screenshot dari Perangkat</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative rounded-xl border border-slate-800 bg-[#0B1120] p-2 flex items-center justify-between gap-3">
                  <img
                    src={screenshotDataUrl}
                    alt="Preview Screenshot"
                    className="h-14 w-auto rounded-lg object-cover border border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshotDataUrl('');
                      setScreenshotName('');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
