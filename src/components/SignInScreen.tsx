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

    const labels = ['Belum Memadai', 'Dasar', 'Menengah', 'Kuat', 'Sangat Kuat'];
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
          Mimi V15
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="#kurikulum" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Room Belajar</a>
          <a href="#simulasi" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Simulasi Konsep</a>
          <a href="#tutor" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Persona Mimi V15</a>
          <a href="#keamanan" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Akun Aman</a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onGoogleQuickSignIn('Teman Belajar', 'anna.adriiann@gmail.com')}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            Masuk Room Belajar
          </button>
        </div>
      </header>

      {/* Main Split Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        {/* Left Column: Room Belajar Value & Mimi V15 Persona Highlights (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#0F172A] border border-slate-800/90 rounded-2xl p-8 lg:p-10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-sky-400">
              <span>Room Belajar Bersama Mimi V15</span>
              <span aria-hidden="true">·</span>
              <span>Asisten, Guru, Profesor & Teman</span>
              <span aria-hidden="true">·</span>
              <span>SD, SMP & SMA</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-[1.15]"
              style={{ textWrap: 'balance' }}
            >
              Ruang Belajar Nyaman Bersama Mimi V15 yang Peka, Cepat, dan Menuntun Pemahamanmu.
            </h1>

            <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
              Di Room Belajar ini, Mimi V15 hadir sebagai asisten, guru, profesor, sekaligus teman belajarmu. Saat kamu bertanya hal umum, Mimi mengobrol luwes sesuai konteks layaknya manusia. Saat kamu membahas soal, Mimi tidak sekadar memberi kunci jawaban, melainkan memberikan kisi-kisi dan menuntunmu memahami konsepnya sampai bisa.
            </p>

            {/* 3 Structured Highlights */}
            <div id="kurikulum" className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
              <div className="space-y-1.5">
                <div className="text-xs text-slate-400">01. Empat Peran Sekaligus</div>
                <div className="text-sm font-semibold text-white">Teman, Guru & Profesor</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sangat peka membaca konteks: asyik diajak diskusi umum maupun menjelaskan materi SD, SMP, dan SMA secara mendalam.
                </p>
              </div>

              <div id="simulasi" className="space-y-1.5">
                <div className="text-xs text-slate-400">02. Metode Kisi-Kisi</div>
                <div className="text-sm font-semibold text-white">Menuntun Tanpa Bocoran</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mimi tidak langsung memberi kunci jawaban soal, tetapi memberi petunjuk bertahap agar kamu benar-benar paham.
                </p>
              </div>

              <div id="tutor" className="space-y-1.5">
                <div className="text-xs text-slate-400">03. Respons Cepat</div>
                <div className="text-sm font-semibold text-white">Bertenaga Gemini Flash</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Menjawab pertanyaan dengan cepat, disertai simulasi konsep interaktif dan papan peringkat teman belajar.
                </p>
              </div>
            </div>
          </div>

          {/* Security Assurance Strip */}
          <div id="keamanan" className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Shield className="w-4 h-4 shrink-0" />
                <span>Sistem Login Room Belajar yang Aman</span>
              </div>
              <p className="text-xs text-slate-400">
                Akun dan progres belajarmu dilindungi enkripsi kata sandi <span className="font-mono text-slate-300">scrypt + salt</span> serta token sesi <span className="font-mono text-slate-300">HMAC-SHA256</span>.
              </p>
            </div>
            <div className="text-right font-mono text-xs text-slate-400 tabular-nums shrink-0">
              <div>3 Jenjang · 12 Kelas</div>
              <div className="text-sky-400">Room Belajar Interaktif</div>
            </div>
          </div>
        </div>

        {/* Right Column: Secure Authentication Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#0F172A] border border-slate-800/90 rounded-2xl p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Masuk ke Room Belajar</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Masuk atau buat akun untuk menyimpan progres belajar bersama Mimi V15
                </p>
              </div>
              <Lock className="w-5 h-5 text-sky-400 shrink-0" />
            </div>

            {/* 1. Primary One-Click Google Login with minimal scopes (profile & email only) */}
            <div className="space-y-1.5">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onGoogleQuickSignIn()}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Login dengan Google</span>
              </button>
              <div className="text-center text-[11px] text-slate-400">
                🔒 Scope minimal: nama &amp; email saja (Auto-generate Student ID permanen)
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-xs text-slate-500 font-medium">atau gunakan email &amp; sandi</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Mode Switcher */}
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
                Daftar Baru
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
                    Nama Panggilan / Lengkap
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
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0B1120] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Kata Sandi
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
                      <span className="text-slate-400">Kekuatan Kata Sandi:</span>
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
                    ? 'Memverifikasi Akun...'
                    : authMode === 'login'
                    ? 'Masuk ke Room Belajar'
                    : 'Buat Akun Room Belajar'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-xs text-slate-500">Atau Masuk Instan</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* 1-Click Verified Google Sign-In */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() =>
                onGoogleQuickSignIn(
                  displayName.trim() || 'Teman Belajar',
                  email.trim() || 'anna.adriiann@gmail.com'
                )
              }
              className="w-full py-2.5 px-4 bg-[#0B1120] hover:bg-slate-900 border border-slate-700 text-slate-100 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Masuk Cepat dengan Akun Google Terverifikasi</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Status Sesi: Aman & Terenkripsi</span>
            <span className="font-mono tabular-nums">Mimi V15</span>
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <span>© 2026 Mimi 15 (Mimi V15) — Room Belajar Interaktif SD, SMP, dan SMA.</span>
        <div className="flex items-center gap-4">
          <span>Asisten · Guru · Profesor · Teman</span>
          <span aria-hidden="true">·</span>
          <span>Bertenaga Gemini AI</span>
        </div>
      </footer>
    </div>
  );
};
