/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import emailjs from '@emailjs/browser';

export const OWNER_EMAIL = 'anna.adriiann@gmail.com';

export interface EmailReportPayload {
  emailPelapor?: string;
  namaPelapor?: string;
  pesan: string;
  url?: string;
  type: 'error_report' | 'auto_catch' | 'login' | 'register' | 'guest_visit' | string;
  kelas?: string;
  deviceInfo?: string;
  ip?: string;
}

/**
 * Mengirim laporan otomatis ke email Owner (anna.adriiann@gmail.com)
 * menggunakan EmailJS (jika public key sudah diisi di .env / pengaturan)
 * sekaligus meneruskan ke endpoint server /api/notify-owner.
 */
export async function kirimEmailLaporan(
  data: EmailReportPayload
): Promise<{ sentViaEmailJs: boolean; message: string }> {
  const serviceId =
    (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID ||
    localStorage.getItem('mimi_emailjs_service_id') ||
    'service_mimi';
  const templateId =
    (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID ||
    localStorage.getItem('mimi_emailjs_template_id') ||
    'template_error_report';
  const publicKey =
    (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY ||
    localStorage.getItem('mimi_emailjs_public_key') ||
    '';

  const waktu = new Date().toLocaleString('id-ID');
  const templateParams = {
    to_email: OWNER_EMAIL,
    from_name: data.namaPelapor || data.emailPelapor || 'Anonim / Tamu',
    from_email: data.emailPelapor || 'tamu@mimi15.id',
    message: data.pesan,
    error_url: data.url || (typeof window !== 'undefined' ? window.location.href : ''),
    waktu,
    tipe: data.type,
    kelas: data.kelas || '-',
    device: data.deviceInfo || (typeof navigator !== 'undefined' ? navigator.userAgent : '-'),
    ip: data.ip || '-',
  };

  // 1. Kirim ke backend local/cloud endpoint agar tercatat di server log juga
  try {
    fetch('/api/notify-owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateParams),
    }).catch(() => {});
  } catch {
    // Ignore network error
  }

  // 2. Kirim via EmailJS jika Public Key tersedia dan bukan placeholder
  if (publicKey && publicKey !== 'YOUR_PUBLIC_KEY' && publicKey !== 'xxx') {
    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      return {
        sentViaEmailJs: true,
        message: `Email laporan berhasil dikirim ke ${OWNER_EMAIL} via EmailJS`,
      };
    } catch (err) {
      console.warn('EmailJS send warning:', err);
      return {
        sentViaEmailJs: false,
        message: 'Laporan tersimpan di Firestore (EmailJS membutuhkan konfigurasi key aktif)',
      };
    }
  }

  return {
    sentViaEmailJs: false,
    message: `Laporan berhasil disimpan ke Firestore & siap dilihat oleh ${OWNER_EMAIL}`,
  };
}
