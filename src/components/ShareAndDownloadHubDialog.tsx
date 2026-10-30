import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  BookOpen,
  Download,
  RefreshCw,
  ExternalLink,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Link2,
  ShieldCheck,
  Cloud,
} from 'lucide-react';
import { MimiUiState, StudyProgress } from '../types/mimi';
import {
  downloadDrivePdfBlob,
  downloadGeneratedModulePdf,
  getDriveAccessToken,
  googleDriveSignIn,
  initDriveAuth,
  listDrivePdfsInFolder,
  logoutDrive,
  verifySharedDriveFolderByLink,
  SCOPES,
  OFFICIAL_DRIVE_PDF_FOLDER_URL,
} from '../services/googleDriveService';
import { apiFetch } from '../services/ai';

interface ShareAndDownloadHubDialogProps {
  uiState: MimiUiState;
  studyProgress: StudyProgress;
  onDismiss: () => void;
}

interface CatalogBookItem {
  id: string;
  title: string;
  educationLevel: string;
  classLabel: string;
  subject: string;
  publisher: string;
  sourceType: 'KEMENDIKDASMEN' | 'GOOGLE_DRIVE' | 'OPEN_BOOK';
  catalogUrl: string;
  driveFileId?: string;
  webViewLink?: string;
  webContentLink?: string;
  addedBy: string;
  updatedAt: string;
}

interface SharedDriveConfig {
  sharedFolderLink: string;
  folderId: string;
  folderName: string;
  updatedBy: string;
  updatedAt: string;
}

export const ShareAndDownloadHubDialog: React.FC<ShareAndDownloadHubDialogProps> = ({
  uiState,
  onDismiss,
}) => {
  const [activeTab, setActiveTab] = useState<'BOOKS_DRIVE' | 'OAUTH_PRIVACY' | 'CLOUD_24H'>(
    'BOOKS_DRIVE'
  );

  // Google Workspace OAuth State (strictly minimal read-only token via googleDriveService)
  const [needsGoogleAuth, setNeedsGoogleAuth] = useState<boolean>(true);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState<boolean>(false);

  // Shared Folder Link & Catalog State (pre-filled with official Google Drive PDF folder)
  const [sharedFolderLinkInput, setSharedFolderLinkInput] = useState<string>(
    OFFICIAL_DRIVE_PDF_FOLDER_URL
  );
  const [activeDriveConfig, setActiveDriveConfig] = useState<SharedDriveConfig | null>(
    null
  );
  const [catalogBooks, setCatalogBooks] = useState<CatalogBookItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Local catalog removal confirmation (never deletes files on user's Google Drive)
  const [bookPendingRemove, setBookPendingRemove] = useState<CatalogBookItem | null>(
    null
  );
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  const fetchServerBookCatalog = useCallback(async () => {
    try {
      const res = await apiFetch('/api/books');
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data.books)) {
          setCatalogBooks(data.books);
        }
        if (data.driveConfig) {
          setActiveDriveConfig(data.driveConfig);
          setSharedFolderLinkInput((prev) => prev || data.driveConfig.sharedFolderLink || '');
        }
      }
    } catch {
      // Ignore offline transient error
    }
  }, []);

  useEffect(() => {
    fetchServerBookCatalog();
    const interval = setInterval(fetchServerBookCatalog, 12000);
    return () => clearInterval(interval);
  }, [fetchServerBookCatalog]);

  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user) => {
        setNeedsGoogleAuth(false);
        setGoogleUserEmail(user.email || user.displayName || 'Terhubung');
      },
      () => {
        setNeedsGoogleAuth(true);
        setGoogleUserEmail(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoggingIn(true);
    setStatusBanner(null);
    try {
      const result = await googleDriveSignIn();
      if (result) {
        setNeedsGoogleAuth(false);
        setGoogleUserEmail(result.user.email || result.user.displayName || 'Terhubung');
        setStatusBanner({
          type: 'success',
          text: 'Berhasil masuk! Izin hanya untuk melihat profil dasar & mengunduh file PDF (Read-Only).',
        });
      }
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Gagal masuk dengan Google. Silakan coba lagi.',
      });
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutDrive();
    setNeedsGoogleAuth(true);
    setGoogleUserEmail(null);
  };

  // Sync strictly from the single Admin-provided Shared Google Drive Folder Link (Read-Only)
  const handleSyncSharedFolderLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const linkToUse = sharedFolderLinkInput.trim() || activeDriveConfig?.sharedFolderLink;
    if (!linkToUse) {
      setStatusBanner({
        type: 'error',
        text: 'Masukkan link folder Google Drive yang dibagikan (contoh: https://drive.google.com/drive/folders/...?usp=sharing).',
      });
      return;
    }

    const token = await getDriveAccessToken();
    if (!token) {
      setNeedsGoogleAuth(true);
      setStatusBanner({
        type: 'error',
        text: 'Silakan klik tombol "Sign in with Google" terlebih dahulu untuk melihat & mengunduh PDF dari folder link.',
      });
      return;
    }

    setIsSyncing(true);
    setStatusBanner(null);
    try {
      const folderInfo = await verifySharedDriveFolderByLink(linkToUse);
      const pdfFiles = await listDrivePdfsInFolder(folderInfo.id);

      const sessionToken = localStorage.getItem('mimi15_session_token');
      const syncRes = await apiFetch('/api/books/sync-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          sharedFolderLink: linkToUse,
          folderId: folderInfo.id,
          folderName: folderInfo.name,
          driveFiles: pdfFiles,
          educationLevel: uiState.selectedEducationLevel,
          classLabel: uiState.selectedClass,
        }),
      });

      if (syncRes.ok && (syncRes.headers.get('content-type') || '').includes('application/json')) {
        const data = await syncRes.json();
        setCatalogBooks(data.books || []);
        setActiveDriveConfig(data.driveConfig || null);
        setStatusBanner({
          type: 'success',
          text: `Folder link "${folderInfo.name}" berhasil disinkronkan (Read-Only)! ${pdfFiles.length} buku PDF siap dilihat & diunduh.`,
        });
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'UNAUTHENTICATED_DRIVE') {
        setNeedsGoogleAuth(true);
      }
      setStatusBanner({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Gagal menyinkronkan link folder Google Drive.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmRemoveFromCatalog = async () => {
    if (!bookPendingRemove) return;
    setIsRemoving(true);
    setStatusBanner(null);
    try {
      const res = await apiFetch(
        `/api/books/${encodeURIComponent(bookPendingRemove.id)}`,
        { method: 'DELETE' }
      );
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const data = await res.json();
        setCatalogBooks(data.books || []);
        setStatusBanner({
          type: 'success',
          text: `Buku "${bookPendingRemove.title}" disembunyikan dari daftar katalog lokal (file asli di Google Drive tetap utuh & aman).`,
        });
      }
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal menghapus item dari katalog.',
      });
    } finally {
      setIsRemoving(false);
      setBookPendingRemove(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl card-study p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="text-xs text-sky-400 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Pusat Buku PDF &amp; Google Drive (Mode Aman Read-Only)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Perpustakaan Buku Resmi &amp; Unduhan PDF Read-Only
            </h2>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Public Website Share Link Bar (Cukup Tombol Tanpa Teks URL Panjang) */}
        <div className="p-4 rounded-2xl bg-[#0B101E] border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
              <span>● Akses &amp; Bagikan Aplikasi Publik Mimi V15</span>
            </div>
            <p className="text-xs text-slate-300">
              Bagikan link aplikasi publik atau buka langsung di tab baru tanpa perlu login.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="https://ais-pre-uujm7563cz27mgl63kqjrj-141953450050.asia-southeast1.run.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-extrabold text-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Buka Link Baru</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={async () => {
                const liveUrl = 'https://ais-pre-uujm7563cz27mgl63kqjrj-141953450050.asia-southeast1.run.app';
                try {
                  await navigator.clipboard.writeText(liveUrl);
                  setStatusBanner({
                    type: 'success',
                    text: 'Link publik baru berhasil disalin! Siapa pun yang membuka link ini langsung bisa belajar bareng Mimi V15.',
                  });
                } catch {
                  // ignore
                }
              }}
              className="px-4 py-2.5 rounded-xl btn-tactile-emerald text-xs font-extrabold whitespace-nowrap shrink-0 shadow-md cursor-pointer"
            >
              Salin Link Publik
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside Modal */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('BOOKS_DRIVE')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 ${
                activeTab === 'BOOKS_DRIVE'
                  ? 'btn-tactile-sky'
                  : 'bg-[#0B101E] text-slate-300 border border-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku PDF &amp; Link Folder Drive</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('OAUTH_PRIVACY')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 ${
                activeTab === 'OAUTH_PRIVACY'
                  ? 'btn-tactile-sky'
                  : 'bg-[#0B101E] text-slate-300 border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Jaminan Privasi Login (3 Scope Aman)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CLOUD_24H')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 ${
                activeTab === 'CLOUD_24H'
                  ? 'btn-tactile-emerald'
                  : 'bg-[#0B101E] text-slate-300 border border-slate-800'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Status Aktif 24 Jam (Cloud)</span>
            </button>
          </div>

          {/* Official Sign in with Google button (or connected status) */}
          <div>
            {needsGoogleAuth ? (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoggingIn}
                className="gsi-material-button flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow transition-colors disabled:opacity-50"
              >
                <div className="gsi-material-button-icon w-4 h-4 shrink-0">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-4 h-4 block"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {isGoogleLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-400 font-bold">
                  ● Read-Only: {googleUserEmail}
                </span>
                <button
                  type="button"
                  onClick={handleGoogleLogout}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Putuskan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusBanner && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              statusBanner.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-200'
                : 'bg-red-950/60 border-red-700/70 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-slate-400 hover:text-white"
            >
              Tutup
            </button>
          </div>
        )}

        {/* TAB 1: BUKU PDF & LINK FOLDER GOOGLE DRIVE (READ-ONLY) */}
        {activeTab === 'BOOKS_DRIVE' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#0B101E] border-2 border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold text-sky-400 flex items-center gap-1.5">
                    <Link2 className="w-4 h-4" />
                    <span>
                      Sinkronisasi Folder Google Drive (Hanya Lihat &amp; Unduh PDF / Read-Only)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Aplikasi ini hanya meminta akses melihat profil dasar (nama, email, foto) serta melihat &amp; mengunduh file PDF (Read-Only). Tidak pernah mengedit, menghapus, atau membuat file di Google Drive Anda.
                  </p>
                </div>
                {activeDriveConfig && (
                  <span className="text-[11px] font-mono text-emerald-400 shrink-0">
                    Folder Aktif: {activeDriveConfig.folderName}
                  </span>
                )}
              </div>

              <form
                onSubmit={handleSyncSharedFolderLink}
                className="flex flex-col sm:flex-row gap-2.5"
              >
                <input
                  type="url"
                  value={sharedFolderLinkInput}
                  onChange={(e) => setSharedFolderLinkInput(e.target.value)}
                  placeholder="Tempel link folder Google Drive yang dibagikan (https://drive.google.com/drive/folders/...?usp=sharing)"
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                />
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-4 py-2.5 rounded-xl btn-tactile-sky text-xs font-extrabold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>
                    {isSyncing
                      ? 'Menyinkronkan Folder...'
                      : 'Baca & Sinkronkan Link Folder'}
                  </span>
                </button>
              </form>

              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-300">
                  Pilih &amp; download langsung materi PDF sesuai mata pelajaran di Google Drive:
                </span>
                <a
                  href={OFFICIAL_DRIVE_PDF_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl btn-tactile-emerald text-slate-950 font-extrabold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>Buka Folder Google Drive Materi PDF</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            </div>

            {/* Catalog List (Kemendikdasmen + Synced Google Drive PDFs) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">
                  Daftar Buku &amp; Modul PDF Tersedia ({catalogBooks.length} Buku)
                </h3>
                <span className="text-xs font-bold text-emerald-400">
                  ● Mode Unduh Aman (Read-Only)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-80 overflow-y-auto pr-1">
                {catalogBooks.map((book) => (
                  <div
                    key={book.id}
                    className="p-4 rounded-2xl bg-[#0B101E] border border-slate-800 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={`font-bold ${
                            book.sourceType === 'GOOGLE_DRIVE'
                              ? 'text-emerald-400'
                              : 'text-sky-400'
                          }`}
                        >
                          {book.sourceType === 'GOOGLE_DRIVE'
                            ? '● PDF Google Drive (Read-Only)'
                            : `Buku Resmi ${book.educationLevel} (${book.classLabel})`}
                        </span>
                        <span className="text-slate-500 font-mono">
                          {book.updatedAt}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                        {book.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {book.publisher}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {book.sourceType === 'GOOGLE_DRIVE' && book.driveFileId ? (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await downloadDrivePdfBlob(
                                  book.driveFileId!,
                                  book.title
                                );
                              } catch {
                                if (book.webViewLink) {
                                  const a = document.createElement('a');
                                  a.href = book.webViewLink || OFFICIAL_DRIVE_PDF_FOLDER_URL;
                                  a.target = '_blank';
                                  a.rel = 'noopener noreferrer';
                                  document.body.appendChild(a);
                                  a.click();
                                  a.remove();
                                }
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg btn-tactile-emerald text-xs font-extrabold flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh PDF Drive</span>
                          </button>
                        ) : (
                          <a
                            href={book.webViewLink || OFFICIAL_DRIVE_PDF_FOLDER_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg btn-tactile-sky text-xs font-extrabold flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh PDF ({book.subject})</span>
                          </a>
                        )}

                        <span className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 text-[11px] text-emerald-300 font-semibold">
                          Terverifikasi
                        </span>
                      </div>

                      {book.sourceType === 'GOOGLE_DRIVE' && (
                        <button
                          type="button"
                          onClick={() => setBookPendingRemove(book)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                          title="Sembunyikan dari katalog web"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JAMINAN PRIVASI LOGIN GOOGLE (3 SCOPE MINIMAL) */}
        {activeTab === 'OAUTH_PRIVACY' && (
          <div className="p-6 rounded-2xl bg-[#0B101E] border-2 border-sky-500/40 space-y-4">
            <div className="flex items-center gap-2.5 text-sky-400 font-extrabold text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>
                Jaminan Keamanan OAuth Consent Screen — Hanya 3 Scope Minimal (Read-Only)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Aplikasi Room Belajar Mimi V15 telah dikonfigurasi agar hanya meminta izin paling minimal saat login menggunakan akun Google:
            </p>
            <div className="space-y-2.5 text-xs text-slate-200">
              {SCOPES.map((scope) => (
                <div
                  key={scope}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <code className="text-emerald-400 font-mono text-[11px] sm:text-xs break-all">
                    {scope}
                  </code>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-bold text-[11px] shrink-0">
                    Read-Only Aman
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-700/40 text-xs text-emerald-200 space-y-1">
              <div className="font-extrabold">Apa yang muncul di layar login Google?</div>
              <p className="text-slate-300">
                1. Lihat alamat email, nama, dan foto profil dasar Anda (untuk login siswa).
                <br />
                2. Melihat dan mendownload file Google Drive Anda secara Read-Only (tidak bisa mengedit, menghapus, atau membuat file, serta tanpa akses Classroom atau Google Photos).
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: PANDUAN SERVER CLOUD AKTIF 24 JAM (MESKIPUN LAPTOP MATI) */}
        {activeTab === 'CLOUD_24H' && (
          <div className="p-6 rounded-2xl bg-[#0B101E] border-2 border-emerald-500/40 space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-400 font-extrabold text-sm">
              <Cloud className="w-5 h-5 shrink-0" />
              <span>
                Arsitektur Cloud 24 Jam Nonstop — Tetap Aktif Saat Laptop Kamu Mati
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Aplikasi Room Belajar Mimi V15 dirancang menggunakan server Full-Stack Express + Cloud Run yang berjalan langsung di pusat data awan (Cloud), bukan bergantung pada laptop pribadimu.
            </p>
            <div className="space-y-2.5 text-xs text-slate-200 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-sky-400">1. Klik Tombol &ldquo;Deploy&rdquo; di Pojok Kanan Atas AI Studio:</strong>{' '}
                Saat kamu melakukan Deploy ke Cloud Run, Google Cloud akan menjalankan server Mimi V15 secara mandiri 24 jam sehari, 7 hari seminggu dengan URL publik permanen.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-sky-400">2. Otomatis Menyala Kembali (Auto-Scaling &amp; Always Ready):</strong>{' '}
                Meskipun laptop atau HP kamu dimatikan total, siswa dari mana saja tetap bisa login, mengobrol dengan Mimi V15, dan mengunduh buku PDF kapan pun.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-sky-400">3. Sinkronisasi Real-Time dengan Link Folder Google Drive:</strong>{' '}
                Setiap kali Admin menambahkan PDF baru ke dalam folder Google Drive yang dibagikan lewat link lalu menekan sinkronisasi, seluruh halaman web siswa otomatis terupdate.
              </div>
            </div>
          </div>
        )}

        {/* CONFIRMATION DIALOG FOR REMOVING ITEM FROM WEB CATALOG ONLY */}
        {bookPendingRemove && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#131C31] border-2 border-red-500/60 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2.5 text-red-400 font-extrabold text-base">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Sembunyikan Buku dari Katalog Web</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Apakah Anda yakin ingin menghapus{' '}
                <strong className="text-white">
                  &ldquo;{bookPendingRemove.title}&rdquo;
                </strong>{' '}
                dari daftar tampilan katalog web? (File asli di Google Drive Anda tetap aman dan tidak tersentuh karena aplikasi ini menggunakan mode Read-Only).
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isRemoving}
                  onClick={() => setBookPendingRemove(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isRemoving}
                  onClick={handleConfirmRemoveFromCatalog}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-extrabold text-white"
                >
                  {isRemoving ? 'Menghapus...' : 'Ya, Sembunyikan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
