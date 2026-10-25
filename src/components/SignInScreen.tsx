import React, { useState, useMemo } from 'react';
import { Shield, Lock, Mail, User, KeyRound, ArrowRight, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface SignInScreenProps {
  isLoading: boolean;
  errorMessage: string | null;
  onLoginEmail: (email: string, password: string) => Promise<void>;
  onRegisterEmail: (displayName: string, email: string, password: string, securityPin?: string) => Promise<void>;
  onGoogleQuickSignIn: (displayName?: string, email?: string) => Promise<void>;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  isLoading,
  errorMessage,
  onLoginEmail,
  onRegisterEmail,
  onGoogleQuickSignIn,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordMetrics = useMemo(() => {
    const len = password.length;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    let score = 0;
    if (len >= 6) score += 1;
    if (len >= 10) score += 1;
    if (hasUpper && hasNumber) score += 1;
    if (hasSymbol) score += 1;

    const labels = ['Belum Memadai', 'Dasar', 'Menengah', 'Kuat', 'Sangat Kuat (Standar Siber)'];
    return {
      score,
      label: labels[score] || 'Dasar',
    };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      await onLoginEmail(email, password);
    } else {
      await onRegisterEmail(displayName, email, password, securityPin || undefined);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B1120] text-slate-100 flex flex-col justify-between">
      {/* Top Bar Contract: 3 zones */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-5 border-b border-slate-800/80">
        <a href="#top" className="text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0">
          Mimi 15
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="#kurikulum" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Kurikulum SD–SMA</a>
          <a href="#simulasi" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Simulasi Interaktif</a>
          <a href="#tutor" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Tutor AI Mimi</a>
          <a href="#keamanan" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Keamanan Akun</a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onGoogleQuickSignIn('Siswa Cyber', 'anna.adriiann@gmail.com')}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            Masuk Cepat Siswa
          </button>
        </div>
      </header>

      {/* Main Split Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        {/* Left Column: Platform Value & Curriculum Highlights (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#0F172A] border border-slate-800/90 rounded-2xl p-8 lg:p-10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-sky-400">
              <span>Ekosistem Pendidikan Siber</span>
              <span aria-hidden="true">·</span>
              <span>Kurikulum SD, SMP & SMA</span>
              <span aria-hidden="true">·</span>
              <span>Proteksi Kriptografi scrypt</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-[1.15]"
              style={{ textWrap: 'balance' }}
            >
              Belajar Sains, Matematika, dan Logika Siber Bersama Tutor Pintar Mimi 15.
            </h1>

            <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
              Eksplorasi modul pembelajaran adaptif untuk jenjang SD (Kelas 1–6), SMP (Kelas 7–9), hingga SMA (Kelas 10–12). Dilengkapi laboratorium simulasi interaktif, arena tantangan rival, kuis adaptif berbasis Gemini AI, dan penyimpanan progres aman.
            </p>

            {/* 3 Structured Highlights */}
            <div id="kurikulum" className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400">01. Kurikulum Berjenjang</div>
                <div className="text-sm font-semibold text-white">12 Kelas Terstruktur</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Materi disesuaikan otomatis mulai dari operasi hitung SD hingga kalkulus dan fisika kuantum SMA.
                </p>
              </div>

              <div id="simulasi" className="space-y-1.5">
                <div className="text-xs text-slate-400">02. Laboratorium Visual</div>
                <div className="text-sm font-semibold text-white">Simulasi Konsep Nyata</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Uji variabel Hukum Newton, rangkaian Hukum Ohm, Efek Bohr, dan neraca aljabar secara langsung.
                </p>
              </div>

              <div id="tutor" className="space-y-1.5">
                <div className="text-xs text-slate-400">03. Pendamping Belajar</div>
                <div className="text-sm font-semibold text-white">Diskusi AI Tutor Mimi</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tanyakan rumus atau langkah penyelesaian soal kapan saja dan raih tambahan XP setiap berdiskusi.
                </p>
              </div>
            </div>
          </div>

          {/* Security Assurance Strip */}
          <div id="keamanan" className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Shield className="w-4 h-4 shrink-0" />
                <span>Arsitektur Login Pengguna Terenkripsi</span>
              </div>
              <p className="text-xs text-slate-400">
                Kata sandi dienkripsi dengan algoritma derivasi kunci <span className="font-mono text-slate-300">scrypt + 16-byte random salt</span> dan token sesi <span className="font-mono text-slate-300">HMAC-SHA256</span>.
              </p>
            </div>
            <div className="text-right font-mono text-xs text-slate-400 tabular-nums shrink-0">
              <div>3 Jenjang · 12 Kelas</div>
              <div className="text-sky-400">Sinkronisasi Cloud & Lokal</div>
            </div>
          </div>
        </div>

        {/* Right Column: Secure Authentication Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#0F172A] border border-slate-800/90 rounded-2xl p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Gerbang Akses Mimi 15</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Masuk atau daftarkan akun siswa untuk menyimpan progres belajar
                </p>
              </div>
              <Lock className="w-5 h-5 text-sky-400 shrink-0" />
            </div>

            {/* Mode Switcher (Interactive Segmented Control) */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#0B1120] border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`py-2 px-4 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  authMode === 'login'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Masuk Akun
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`py-2 px-4 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  authMode === 'register'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Daftar Siswa Baru
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/80 flex items-start gap-2.5 text-xs text-red-200">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nama Lengkap Siswa
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Contoh: Nadia Pratama"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0B1120] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Alamat Email Siswa
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="siswa@sekolah.sch.id"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0B1120] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Kata Sandi Keamanan
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#0B1120] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    aria-label="Tampilkan kata sandi"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {authMode === 'register' && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Kekuatan Perisai Sandi:</span>
                      <span className="font-semibold text-sky-400">{passwordMetrics.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-400 transition-all duration-200"
                        style={{ width: `${Math.max(20, passwordMetrics.score * 25)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    PIN Keamanan 4–6 Digit (Opsional)
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 152026"
                    className="w-full px-4 py-2 text-sm font-mono bg-[#0B1120] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 tabular-nums"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                <span>
                  {isLoading
                    ? 'Memverifikasi Kredensial...'
                    : authMode === 'login'
                    ? 'Masuk ke Mimi 15'
                    : 'Daftarkan & Enkripsi Akun'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-xs text-slate-500">Atau Akses Instan Terverifikasi</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* 1-Click Verified Google / Siswa Cyber Sign-In matching MainActivity.kt */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() =>
                onGoogleQuickSignIn(
                  displayName.trim() || 'Siswa Cyber',
                  email.trim() || 'anna.adriiann@gmail.com'
                )
              }
              className="w-full py-2.5 px-4 bg-[#0B1120] hover:bg-slate-900 border border-slate-700 text-slate-100 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Masuk dengan Identitas Google Terverifikasi</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Status Sesi: Terlindungi</span>
            <span className="font-mono tabular-nums">Token HMAC-SHA256</span>
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <span>© 2026 Mimi 15 — Platform Edukasi Interaktif SD, SMP, dan SMA.</span>
        <div className="flex items-center gap-4">
          <span>Enkripsi Kredensial Aktif</span>
          <span aria-hidden="true">·</span>
          <span>Dukungan Tutor AI Gemini</span>
        </div>
      </footer>
    </div>
  );
};
