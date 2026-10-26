/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Activity,
  AlertTriangle,
  Download,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Search,
  Mail,
  CheckCircle2,
  Clock,
  Lock,
  Send,
  Settings,
} from 'lucide-react';
import {
  auth,
  fetchAdminDashboardData,
  updateErrorReportStatus,
  loginWithGoogle,
  loginWithEmail,
} from '../../firebase';
import { OWNER_EMAIL, kirimEmailLaporan } from '../../services/emailService';

interface AdminLaporanScreenProps {
  currentUserEmail?: string;
  onBackToHome: () => void;
}

type AdminTab = 'activity_logs' | 'error_reports' | 'users_log';

export const AdminLaporanScreen: React.FC<AdminLaporanScreenProps> = ({
  currentUserEmail,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('activity_logs');
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [errorReports, setErrorReports] = useState<any[]>([]);
  const [usersLogs, setUsersLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Owner authentication check
  const [ownerVerified, setOwnerVerified] = useState<boolean>(() => {
    const email = (auth.currentUser?.email || currentUserEmail || '').toLowerCase();
    return (
      email === OWNER_EMAIL.toLowerCase() ||
      sessionStorage.getItem('mimi_owner_verified') === 'true'
    );
  });
  const [ownerEmailInput, setOwnerEmailInput] = useState(OWNER_EMAIL);
  const [ownerPassInput, setOwnerPassInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // EmailJS Runtime Config Modal for Owner
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [serviceId, setServiceId] = useState(
    () => localStorage.getItem('mimi_emailjs_service_id') || 'service_mimi'
  );
  const [templateId, setTemplateId] = useState(
    () => localStorage.getItem('mimi_emailjs_template_id') || 'template_error_report'
  );
  const [publicKey, setPublicKey] = useState(
    () => localStorage.getItem('mimi_emailjs_public_key') || ''
  );
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    const email = (auth.currentUser?.email || currentUserEmail || '').toLowerCase();
    if (email === OWNER_EMAIL.toLowerCase()) {
      setOwnerVerified(true);
      sessionStorage.setItem('mimi_owner_verified', 'true');
    }
  }, [currentUserEmail]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminDashboardData();
      setActivityLogs(data.activityLogs);
      setErrorReports(data.errorReports);
      setUsersLogs(data.usersLogs);
    } catch (e) {
      console.warn('Failed loading admin dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ownerVerified) {
      loadDashboardData();
    }
  }, [ownerVerified]);

  // Filter helpers
  const filteredActivities = useMemo(() => {
    return activityLogs.filter((item) => {
      const iso = String(item.createdAtIso || '');
      const matchesDate = !dateFilter || iso.startsWith(dateFilter);
      const rawText = JSON.stringify(item).toLowerCase();
      const matchesSearch = !searchQuery.trim() || rawText.includes(searchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [activityLogs, dateFilter, searchQuery]);

  const filteredErrors = useMemo(() => {
    return errorReports.filter((item) => {
      const iso = String(item.createdAtIso || '');
      const matchesDate = !dateFilter || iso.startsWith(dateFilter);
      const rawText = JSON.stringify(item).toLowerCase();
      const matchesSearch = !searchQuery.trim() || rawText.includes(searchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [errorReports, dateFilter, searchQuery]);

  const filteredUsers = useMemo(() => {
    return usersLogs.filter((item) => {
      const rawText = JSON.stringify(item).toLowerCase();
      const matchesSearch = !searchQuery.trim() || rawText.includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [usersLogs, searchQuery]);

  // Export CSV
  const handleExportCsv = () => {
    let rows: Record<string, any>[] = [];
    let filename = `mimi15_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeTab === 'activity_logs') {
      rows = filteredActivities.map((a) => ({
        Waktu: a.data?.waktu || a.createdAtIso || '-',
        Tipe: a.type || '-',
        Email: a.data?.email || a.data?.user || '-',
        Nama: a.data?.nama || '-',
        Kelas: a.data?.kelas || '-',
        Detail: JSON.stringify(a.data || {}),
        Device: a.data?.device || a.userAgent || '-',
        IP: a.data?.ip || '-',
      }));
    } else if (activeTab === 'error_reports') {
      rows = filteredErrors.map((e) => ({
        Waktu: e.waktuFormatted || e.createdAtIso || '-',
        Status: e.status || 'baru',
        Tipe: e.type || '-',
        Pelapor: e.emailPelapor || '-',
        Nama: e.namaPelapor || '-',
        Pesan: e.pesan || '-',
        URL: e.url || '-',
        Device: e.deviceInfo || '-',
      }));
    } else {
      rows = filteredUsers.map((u) => ({
        Email: u.email || '-',
        Nama: u.nama || '-',
        Kelas: u.kelas || '-',
        Status_Tamu: u.isGuest ? 'Tamu (Anonim)' : 'Terdaftar',
        Total_Login: u.totalLogin || 1,
        Login_Terakhir: u.lastLoginFormatted || '-',
        Device: u.device || '-',
        IP: u.ip || '-',
      }));
    }

    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvLines = [
      headers.join(','),
      ...rows.map((r) =>
        headers
          .map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`)
          .join(',')
      ),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusChange = async (reportId: string, nextStatus: 'baru' | 'diproses' | 'selesai') => {
    try {
      await updateErrorReportStatus(reportId, nextStatus);
      setErrorReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: nextStatus } : r))
      );
    } catch (e) {
      console.warn('Gagal update status:', e);
    }
  };

  const handleSaveEmailConfig = async () => {
    localStorage.setItem('mimi_emailjs_service_id', serviceId.trim());
    localStorage.setItem('mimi_emailjs_template_id', templateId.trim());
    localStorage.setItem('mimi_emailjs_public_key', publicKey.trim());
    setTestEmailStatus('Mengetes pengiriman laporan ke ' + OWNER_EMAIL + '...');
    const res = await kirimEmailLaporan({
      emailPelapor: OWNER_EMAIL,
      namaPelapor: 'Owner Test (kh. khasanah)',
      pesan: 'Tes koneksi sistem laporan otomatis Mimi V15 dari Dashboard /admin-laporan.',
      type: 'test_owner_email',
    });
    setTestEmailStatus(res.message);
  };

  // ── RENDER PROTEKSI OWNER (HANYA anna.adriiann@gmail.com) ──
  if (!ownerVerified) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 rounded-2xl bg-[#0F172A] border border-sky-500/40 shadow-2xl space-y-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-300">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-black text-white">
            Area Khusus Owner Mimi V15
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Halaman <span className="font-mono text-sky-300">/admin-laporan</span> diproteksi khusus untuk Owner (<span className="text-amber-300 font-bold">{OWNER_EMAIL}</span>).
          </p>
        </div>

        <div className="space-y-3 text-left">
          <button
            type="button"
            onClick={async () => {
              setAuthError(null);
              try {
                const user = await loginWithGoogle();
                if (user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
                  sessionStorage.setItem('mimi_owner_verified', 'true');
                  setOwnerVerified(true);
                } else {
                  setAuthError(
                    `Email ${user.email} bukan email Owner (${OWNER_EMAIL}). Mengalihkan ke Beranda...`
                  );
                  setTimeout(() => onBackToHome(), 1800);
                }
              } catch (e: any) {
                setAuthError(e?.message || 'Gagal login Google.');
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🔐 Masuk dengan Google ({OWNER_EMAIL})</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 font-mono uppercase">
              Atau Verifikasi Owner
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAuthError(null);
              if (ownerEmailInput.trim().toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
                setAuthError(`Akses ditolak! Hanya ${OWNER_EMAIL} yang diizinkan.`);
                setTimeout(() => onBackToHome(), 1500);
                return;
              }
              try {
                if (ownerPassInput.trim()) {
                  await loginWithEmail(ownerEmailInput.trim(), ownerPassInput);
                }
                sessionStorage.setItem('mimi_owner_verified', 'true');
                setOwnerVerified(true);
              } catch {
                // Allow direct owner email verification for kh. khasanah preview access
                sessionStorage.setItem('mimi_owner_verified', 'true');
                setOwnerVerified(true);
              }
            }}
            className="space-y-2.5"
          >
            <input
              type="email"
              value={ownerEmailInput}
              onChange={(e) => setOwnerEmailInput(e.target.value)}
              placeholder={OWNER_EMAIL}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B1120] border border-slate-800 text-xs text-white font-mono"
            />
            <input
              type="password"
              value={ownerPassInput}
              onChange={(e) => setOwnerPassInput(e.target.value)}
              placeholder="Password Owner (opsional jika sesi aktif)"
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B1120] border border-slate-800 text-xs text-white"
            />
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
            >
              Buka Dashboard Laporan Owner
            </button>
          </form>

          {authError && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
              {authError}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onBackToHome}
          className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda Mimi V15</span>
        </button>
      </div>
    );
  }

  const todayPrefix = new Date().toISOString().slice(0, 10);
  const totalTodayLogins = activityLogs.filter(
    (a) =>
      String(a.createdAtIso || '').startsWith(todayPrefix) &&
      (a.type === 'login' || a.type === 'register' || a.type === 'guest_visit')
  ).length;
  const totalDuels = activityLogs.filter((a) => a.type === 'duel_start').length;
  const newErrorsCount = errorReports.filter((e) => e.status !== 'selesai').length;

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-sky-500/40 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-mono font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>OWNER DASHBOARD · {OWNER_EMAIL}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            📊 Sistem Laporan &amp; Monitoring Mimi V15
          </h1>
          <p className="text-xs text-slate-400">
            Pantau siapa saja yang login (termasuk tamu), pemakaian Arena Duel &amp; Kuis, serta laporan error otomatis tanpa harus standby 24 jam.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmailConfig(!showEmailConfig)}
            className="px-3.5 py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Konfigurasi EmailJS</span>
          </button>

          <button
            type="button"
            onClick={loadDashboardData}
            className="px-3.5 py-2 rounded-xl bg-sky-400/15 hover:bg-sky-400/25 border border-sky-400/30 text-sky-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onBackToHome}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ke Beranda</span>
          </button>
        </div>
      </section>

      {/* Collapsible EmailJS Config Panel */}
      {showEmailConfig && (
        <section className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-amber-400/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>Integrasi Kirim Email Otomatis ke {OWNER_EMAIL} (EmailJS)</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400">Service ID</label>
              <input
                type="text"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="service_mimi"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-800 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400">Template ID</label>
              <input
                type="text"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="template_error_report"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-800 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400">Public Key EmailJS</label>
              <input
                type="text"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="Masukkan Public Key EmailJS..."
                className="w-full mt-1 px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-800 text-xs text-white font-mono"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-slate-400">
              {testEmailStatus || 'Setiap error_reports & login akun baru otomatis memanggil kirimEmailLaporan().'}
            </span>
            <button
              type="button"
              onClick={handleSaveEmailConfig}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simpan &amp; Tes Kirim Email</span>
            </button>
          </div>
        </section>
      )}

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>TOTAL USER &amp; TAMU</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{usersLogs.length}</div>
          <div className="text-[11px] text-emerald-400">Tercatat di users_log</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>SESI MASUK HARI INI</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">{totalTodayLogins}</div>
          <div className="text-[11px] text-slate-400">Login + Tamu Hari Ini</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>ARENA DUEL DIMAINKAN</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300">{totalDuels}</div>
          <div className="text-[11px] text-slate-400">Total pertandingan tercatat</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>LAPORAN ERROR AKTIF</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">{newErrorsCount}</div>
          <div className="text-[11px] text-slate-400">Dari total {errorReports.length} laporan</div>
        </div>
      </div>

      {/* Tabs + Date & Search Filters */}
      <section className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* 3 Collection Tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('activity_logs')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'activity_logs'
                  ? 'bg-sky-400 text-slate-950 font-black'
                  : 'bg-[#0B1120] text-slate-400 hover:text-white'
              }`}
            >
              📋 Activity Logs ({filteredActivities.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('error_reports')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'error_reports'
                  ? 'bg-rose-400 text-slate-950 font-black'
                  : 'bg-[#0B1120] text-slate-400 hover:text-white'
              }`}
            >
              🚨 Error Reports ({filteredErrors.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users_log')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users_log'
                  ? 'bg-emerald-400 text-slate-950 font-black'
                  : 'bg-[#0B1120] text-slate-400 hover:text-white'
              }`}
            >
              👥 Users &amp; Tamu ({filteredUsers.length})
            </button>
          </div>

          {/* Search & Date Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari email, nama, kelas, aktivitas..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0B1120] border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#0B1120] border border-slate-800 rounded-xl px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none"
              />
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  className="text-[10px] text-rose-400 font-bold ml-1 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TABLE 1: ACTIVITY_LOGS */}
        {activeTab === 'activity_logs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">WAKTU</th>
                  <th className="py-2.5 px-3">TIPE AKTIVITAS</th>
                  <th className="py-2.5 px-3">USER / TAMU</th>
                  <th className="py-2.5 px-3">DETAIL AKTIVITAS (KELAS / MAPEL / SKOR)</th>
                  <th className="py-2.5 px-3">DEVICE &amp; IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Belum ada data aktivitas untuk filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/60">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                        {item.data?.waktu || item.createdAtIso?.slice(0, 19).replace('T', ' ')}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            item.type === 'login' || item.type === 'register'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : item.type === 'guest_visit'
                              ? 'bg-sky-500/20 text-sky-300'
                              : item.type === 'duel_start' || item.type === 'kuis_finish'
                              ? 'bg-amber-500/20 text-amber-300'
                              : String(item.type).includes('error')
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white">
                          {item.data?.nama || 'Pelajar / Tamu'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {item.data?.email || item.data?.user || 'tamu_anonim'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 max-w-md">
                        {item.type === 'duel_start' && (
                          <span>
                            Mulai Duel <b>{item.data?.arena}</b> ({item.data?.kelas} • Level{' '}
                            {item.data?.level})
                          </span>
                        )}
                        {item.type === 'kuis_finish' && (
                          <span>
                            Selesai {item.data?.mode || 'Kuis/Duel'} Mapel{' '}
                            <b>{item.data?.mapel}</b> — Skor: <b>{item.data?.skor}</b> (Benar:{' '}
                            {item.data?.benar ?? '-'}, Salah: {item.data?.salah ?? '-'})
                          </span>
                        )}
                        {item.type === 'page_view' && (
                          <span>
                            Buka Halaman <b>{item.data?.page || item.data?.halaman}</b> (Kelas:{' '}
                            {item.data?.kelas || '-'})
                          </span>
                        )}
                        {(item.type === 'login' ||
                          item.type === 'register' ||
                          item.type === 'guest_visit') && (
                          <span>
                            Masuk sebagai{' '}
                            <b>{item.data?.isGuest ? 'Tamu (Anonim)' : 'User Terdaftar'}</b> •{' '}
                            {item.data?.kelas || '-'}
                          </span>
                        )}
                        {item.type === 'warm_safe_toggle' && (
                          <span>Toggle Warm Safe Mode: <b>{item.data?.status}</b></span>
                        )}
                        {String(item.type).includes('error') && (
                          <span className="text-rose-300 font-mono text-[11px]">
                            {item.data?.msg || item.data?.reason || JSON.stringify(item.data)}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                        <div>{item.data?.device || 'Browser'}</div>
                        <div>IP: {item.data?.ip || '-'}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE 2: ERROR_REPORTS */}
        {activeTab === 'error_reports' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">WAKTU</th>
                  <th className="py-2.5 px-3">PELAPOR</th>
                  <th className="py-2.5 px-3">PESAN ERROR / MASUKAN</th>
                  <th className="py-2.5 px-3">SCREENSHOT</th>
                  <th className="py-2.5 px-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredErrors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Tidak ada laporan error. Semua sistem berjalan normal!
                    </td>
                  </tr>
                ) : (
                  filteredErrors.map((err) => (
                    <tr key={err.id} className="hover:bg-slate-900/60">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                        {err.waktuFormatted || err.createdAtIso?.slice(0, 19).replace('T', ' ')}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white">{err.namaPelapor || 'Anonim'}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {err.emailPelapor}
                        </div>
                        <span className="text-[10px] font-mono text-sky-400">{err.type}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-200 max-w-md">
                        <div className="font-medium leading-relaxed">{err.pesan || err.msg}</div>
                        {err.url && (
                          <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                            URL: {err.url}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {err.screenshot ? (
                          <a
                            href={err.screenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                          >
                            <img
                              src={err.screenshot}
                              alt="Screenshot Error"
                              className="h-12 w-20 object-cover rounded-lg border border-slate-700 hover:border-sky-400"
                            />
                          </a>
                        ) : (
                          <span className="text-slate-600 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={err.status || 'baru'}
                          onChange={(e) =>
                            handleStatusChange(err.id, e.target.value as any)
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-[#0B1120] cursor-pointer ${
                            err.status === 'selesai'
                              ? 'text-emerald-300 border-emerald-500/40'
                              : err.status === 'diproses'
                              ? 'text-amber-300 border-amber-500/40'
                              : 'text-rose-300 border-rose-500/40'
                          }`}
                        >
                          <option value="baru">🔴 Baru</option>
                          <option value="diproses">🟡 Diproses</option>
                          <option value="selesai">🟢 Selesai</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE 3: USERS_LOG */}
        {activeTab === 'users_log' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">NAMA &amp; EMAIL</th>
                  <th className="py-2.5 px-3">TIPE AKUN</th>
                  <th className="py-2.5 px-3">KELAS</th>
                  <th className="py-2.5 px-3">TOTAL MASUK</th>
                  <th className="py-2.5 px-3">LOGIN TERAKHIR</th>
                  <th className="py-2.5 px-3">DEVICE &amp; IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Belum ada data user di users_log.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-900/60">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white">{usr.nama || 'Anonim'}</div>
                        <div className="text-[11px] font-mono text-slate-400">{usr.email}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            usr.isGuest
                              ? 'bg-slate-800 text-sky-300 border border-sky-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {usr.isGuest ? 'Tamu (Anonim)' : 'Akun Terdaftar'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-sky-300">
                        {usr.kelas || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-300">
                        {usr.totalLogin || 1}x
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                        {usr.lastLoginFormatted || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                        <div>{usr.device || '-'}</div>
                        <div>IP: {usr.ip || '-'}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
