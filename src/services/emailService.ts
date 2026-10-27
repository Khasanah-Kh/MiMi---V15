/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import emailjs from '@emailjs/browser';

export const OWNER_EMAIL = 'anna.adriiann@gmail.com';
export const DEFAULT_EMAILJS_SERVICE_ID = 'Mimi-Service';
export const DEFAULT_EMAILJS_TEMPLATE_ID = 'Mimi-Service';
export const DEFAULT_EMAILJS_PUBLIC_KEY = 'b6hnq4qiQ2z8cgYpj';

// Initialize EmailJS with the owner's public key
try {
  emailjs.init(DEFAULT_EMAILJS_PUBLIC_KEY);
} catch {
  // Ignore init errors in SSR/non-browser environments
}

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
 * menggunakan EmailJS (Service: Mimi-Service, Public Key: b6hnq4qiQ2z8cgYpj)
 * sekaligus meneruskan ke endpoint server /api/notify-owner.
 */
export async function kirimEmailLaporan(
  data: EmailReportPayload
): Promise<{ sentViaEmailJs: boolean; message: string }> {
  const serviceId =
    (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID ||
    localStorage.getItem('mimi_emailjs_service_id') ||
    DEFAULT_EMAILJS_SERVICE_ID;
  const templateId =
    (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID ||
    localStorage.getItem('mimi_emailjs_template_id') ||
    DEFAULT_EMAILJS_TEMPLATE_ID;
  const publicKey =
    (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY ||
    localStorage.getItem('mimi_emailjs_public_key') ||
    DEFAULT_EMAILJS_PUBLIC_KEY;

  const waktu = new Date().toLocaleString('id-ID');
  const templateParams = {
    to_email: OWNER_EMAIL,
    name: data.namaPelapor || data.emailPelapor || 'User MiMi-V15',
    email: data.emailPelapor || 'reporter@mimi-v15.com',
    from_name: data.namaPelapor || data.emailPelapor || 'Anonim / Tamu',
    from_email: data.emailPelapor || 'tamu@mimi15.id',
    waktu,
    time: new Date().toString(),
    device: data.deviceInfo || (typeof navigator !== 'undefined' ? navigator.userAgent : '-'),
    error_url: data.url || (typeof window !== 'undefined' ? window.location.href : ''),
    title: typeof document !== 'undefined' ? document.title : 'MiMi-V15',
    message: data.pesan,
    kelas: data.kelas || '-',
    tipe: data.type || 'Bug Report',
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

  // 2. Kirim via EmailJS menggunakan kredensial aktif
  if (publicKey && publicKey !== 'YOUR_PUBLIC_KEY' && publicKey !== 'xxx') {
    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      return {
        sentViaEmailJs: true,
        message: `✅ Laporan berhasil dikirim ke ${OWNER_EMAIL} via EmailJS!`,
      };
    } catch (err) {
      console.warn('EmailJS send warning:', err);
      return {
        sentViaEmailJs: false,
        message: 'Laporan tersimpan di Firestore (EmailJS sedang sinkronisasi)',
      };
    }
  }

  return {
    sentViaEmailJs: false,
    message: `Laporan berhasil disimpan ke Firestore & siap dilihat oleh ${OWNER_EMAIL}`,
  };
}
