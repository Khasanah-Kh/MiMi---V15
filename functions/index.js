/**
 * Firebase Cloud Functions untuk Mimi V15 (gen-lang-client-0798249381)
 * Mengirim email otomatis ke Owner (anna.adriiann@gmail.com) setiap ada
 * laporan error baru di Firestore `error_reports` dan ringkasan harian pukul 07:00 WITA.
 *
 * Cara deploy Cloud Functions:
 * 1. cd functions && npm install firebase-functions firebase-admin nodemailer
 * 2. firebase deploy --only functions --project gen-lang-client-0798249381
 */

const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const OWNER_EMAIL = 'anna.adriiann@gmail.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'noreply.mimiapp@gmail.com',
    pass: process.env.SMTP_APP_PASSWORD || 'APP_PASSWORD_GMAIL',
  },
});

// 1. Trigger setiap ada dokumen baru di collection `error_reports`
exports.sendErrorEmail = functions.firestore
  .document('error_reports/{docId}')
  .onCreate(async (snap) => {
    const data = snap.data() || {};
    const mailOptions = {
      from: 'Mimi V15 System <noreply.mimiapp@gmail.com>',
      to: OWNER_EMAIL,
      subject: `🚨 [MIMI ERROR] ${data.type || 'laporan'} - ${data.emailPelapor || 'Anonim'}`,
      html: `
        <h2>Laporan Error / Masukan Baru — Mimi V15</h2>
        <p><b>Waktu:</b> ${new Date().toLocaleString('id-ID')}</p>
        <p><b>User / Pelapor:</b> ${data.namaPelapor || '-'} (${data.emailPelapor || 'anonim'})</p>
        <p><b>URL:</b> ${data.url || '-'}</p>
        <p><b>Pesan:</b> ${data.pesan || data.msg || '-'}</p>
        <p><b>Device:</b> ${data.deviceInfo || data.userAgent || '-'}</p>
        <hr />
        <p>Cek lengkap di Dashboard Admin: <a href="https://gen-lang-client-0798249381.web.app/admin-laporan">Buka /admin-laporan</a></p>
      `,
    };
    try {
      return await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error('Gagal mengirim email laporan error:', err);
      return null;
    }
  });

// 2. Trigger Ringkasan Harian (Daily Summary) setiap jam 07:00 pagi WITA (Asia/Makassar)
exports.dailySummary = functions.pubsub
  .schedule('every day 07:00')
  .timeZone('Asia/Makassar')
  .onRun(async () => {
    const db = admin.firestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await db
      .collection('activity_logs')
      .where('createdAtIso', '>=', today.toISOString())
      .get();

    const totalLogin = logs.docs.filter((d) => {
      const t = d.data().type;
      return t === 'login' || t === 'register' || t === 'guest_visit';
    }).length;
    const totalError = logs.docs.filter((d) => String(d.data().type || '').includes('error')).length;
    const totalDuel = logs.docs.filter((d) => d.data().type === 'duel_start').length;
    const totalKuis = logs.docs.filter((d) => d.data().type === 'kuis_finish').length;

    await transporter.sendMail({
      from: 'Mimi V15 System <noreply.mimiapp@gmail.com>',
      to: OWNER_EMAIL,
      subject: `📊 Laporan Harian Mimi V15 - ${new Date().toLocaleDateString('id-ID')}`,
      html: `
        <h2>Ringkasan Aktivitas Harian Mimi V15</h2>
        <ul>
          <li><b>Total Login & Tamu Masuk:</b> ${totalLogin} sesi</li>
          <li><b>Duel Arena Dimainkan:</b> ${totalDuel} kali</li>
          <li><b>Kuis Diselesaikan:</b> ${totalKuis} kali</li>
          <li><b>Laporan / Tangkap Error:</b> ${totalError}</li>
        </ul>
        <p>
          <a href="https://gen-lang-client-0798249381.web.app/admin-laporan">Buka Dashboard Admin Web (/admin-laporan)</a>
          &nbsp;|&nbsp;
          <a href="https://console.firebase.google.com/project/gen-lang-client-0798249381/firestore">Lihat Detail di Firebase Console</a>
        </p>
      `,
    });
  });
