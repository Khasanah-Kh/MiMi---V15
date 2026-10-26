import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  BookOpen,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Link2,
  GraduationCap,
  Cloud,
} from 'lucide-react';
import { MimiUiState, StudyProgress } from '../types/mimi';
import {
  ClassroomCourseItem,
  ClassroomWorkItem,
  deleteDriveFile,
  downloadDrivePdfBlob,
  downloadGeneratedModulePdf,
  getDriveAccessToken,
  googleDriveSignIn,
  initDriveAuth,
  listClassroomCourseItems,
  listClassroomCourses,
  listDrivePdfsInFolder,
  logoutDrive,
  uploadPdfToDriveFolder,
  verifySharedDriveFolderByLink,
} from '../services/googleDriveService';

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
  const [activeTab, setActiveTab] = useState<'BOOKS_DRIVE' | 'CLASSROOM' | 'CLOUD_24H'>(
    'BOOKS_DRIVE'
  );

  // Google Workspace OAuth State (in-memory token via googleDriveService)
  const [needsGoogleAuth, setNeedsGoogleAuth] = useState<boolean>(true);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState<boolean>(false);

  // Shared Folder Link & Catalog State
  const [sharedFolderLinkInput, setSharedFolderLinkInput] = useState<string>('');
  const [activeDriveConfig, setActiveDriveConfig] = useState<SharedDriveConfig | null>(
    null
  );
  const [catalogBooks, setCatalogBooks] = useState<CatalogBookItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState<boolean>(false);
  const [customPdfTitle, setCustomPdfTitle] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Mandatory Confirmation Dialog State for Destructive Action
  const [bookPendingDelete, setBookPendingDelete] = useState<CatalogBookItem | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Google Classroom State
  const [courses, setCourses] = useState<ClassroomCourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ClassroomCourseItem | null>(null);
  const [courseItems, setCourseItems] = useState<ClassroomWorkItem[]>([]);
  const [isLoadingClassroom, setIsLoadingClassroom] = useState<boolean>(false);

  const fetchServerBookCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/books');
      if (res.ok) {
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
    // Auto-poll every 12 seconds so web catalog stays updated when Admin adds a book
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
          text: 'Berhasil terhubung dengan Google Drive & Google Classroom!',
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
    setCourses([]);
    setCourseItems([]);
  };

  // Sync strictly from the single Admin-provided Shared Google Drive Folder Link
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
        text: 'Silakan klik tombol "Sign in with Google" terlebih dahulu untuk mengakses folder link.',
      });
      return;
    }

    setIsSyncing(true);
    setStatusBanner(null);
    try {
      const folderInfo = await verifySharedDriveFolderByLink(linkToUse);
      const pdfFiles = await listDrivePdfsInFolder(folderInfo.id);

      const sessionToken = localStorage.getItem('mimi15_session_token');
      const syncRes = await fetch('/api/books/sync-drive', {
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

      if (syncRes.ok) {
        const data = await syncRes.json();
        setCatalogBooks(data.books || []);
        setActiveDriveConfig(data.driveConfig || null);
        setStatusBanner({
          type: 'success',
          text: `Folder link "${folderInfo.name}" berhasil disinkronkan! ${pdfFiles.length} buku PDF otomatis tampil di web.`,
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

  const handleUploadPdfToSharedFolder = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const targetFolderId = activeDriveConfig?.folderId;
    if (!targetFolderId) {
      setStatusBanner({
        type: 'error',
        text: 'Hubungkan link folder Google Drive yang dibagikan terlebih dahulu sebelum mengunggah PDF.',
      });
      e.target.value = '';
      return;
    }

    setIsUploadingPdf(true);
    setStatusBanner(null);
    try {
      await uploadPdfToDriveFolder(
        file,
        targetFolderId,
        customPdfTitle.trim() || undefined
      );
      setCustomPdfTitle('');
      await handleSyncSharedFolderLink();
      setStatusBanner({
        type: 'success',
        text: `Buku PDF "${file.name}" berhasil diunggah ke folder link Google Drive & otomatis terupdate di web!`,
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Gagal mengunggah file PDF ke Google Drive.',
      });
    } finally {
      setIsUploadingPdf(false);
      e.target.value = '';
    }
  };

  const handleConfirmDeleteBook = async () => {
    if (!bookPendingDelete) return;
    setIsDeleting(true);
    setStatusBanner(null);
    try {
      if (
        bookPendingDelete.sourceType === 'GOOGLE_DRIVE' &&
        bookPendingDelete.driveFileId
      ) {
        const token = await getDriveAccessToken();
        if (token) {
          await deleteDriveFile(bookPendingDelete.driveFileId);
        }
      }
      const res = await fetch(
        `/api/books/${encodeURIComponent(bookPendingDelete.id)}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        const data = await res.json();
        setCatalogBooks(data.books || []);
        setStatusBanner({
          type: 'success',
          text: `Buku "${bookPendingDelete.title}" telah dihapus dari katalog.`,
        });
      }
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal menghapus buku.',
      });
    } finally {
      setIsDeleting(false);
      setBookPendingDelete(null);
    }
  };

  const handleLoadClassroom = async () => {
    setIsLoadingClassroom(true);
    setStatusBanner(null);
    try {
      const list = await listClassroomCourses();
      setCourses(list);
      if (list.length > 0) {
        setSelectedCourse(list[0]);
        const items = await listClassroomCourseItems(list[0].id);
        setCourseItems(items);
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
            : 'Gagal memuat data Google Classroom.',
      });
    } finally {
      setIsLoadingClassroom(false);
    }
  };

  const handleSelectClassroomCourse = async (course: ClassroomCourseItem) => {
    setSelectedCourse(course);
    setIsLoadingClassroom(true);
    try {
      const items = await listClassroomCourseItems(course.id);
      setCourseItems(items);
    } catch {
      setCourseItems([]);
    } finally {
      setIsLoadingClassroom(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl card-study p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="text-xs text-sky-400 font-bold flex items-center gap-2">
              <span>Pusat Buku PDF, Google Drive (Link Folder) & Google Classroom</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Perpustakaan Buku Resmi & Sinkronisasi Cloud Otomatis
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

        {/* Public Website Share Link Bar (Terlihat Bagi Semua Orang) */}
        <div className="p-4 rounded-2xl bg-[#0B101E] border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
              <span>● Link Aplikasi Live (Bisa Diakses Bebas Tanpa Login):</span>
            </div>
            <div className="text-xs sm:text-sm text-sky-300 font-mono font-bold flex items-center gap-1">
              <span>👉</span>
              <a
                href="https://gen-lang-client-0798249381.web.app"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition-colors"
              >
                https://gen-lang-client-0798249381.web.app
              </a>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              (Juga aktif di{' '}
              <a
                href="https://gen-lang-client-0798249381.firebaseapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white underline"
              >
                https://gen-lang-client-0798249381.firebaseapp.com
              </a>
              )
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              const liveUrl = 'https://gen-lang-client-0798249381.web.app';
              try {
                await navigator.clipboard.writeText(liveUrl);
                setStatusBanner({
                  type: 'success',
                  text: `Link aplikasi live (${liveUrl}) berhasil disalin! Siapa pun yang membuka link ini langsung bisa melihat & belajar bareng Mimi V15.`,
                });
              } catch {
                // ignore
              }
            }}
            className="px-4 py-2.5 rounded-xl btn-tactile-emerald text-xs font-extrabold whitespace-nowrap shrink-0 shadow-md cursor-pointer"
          >
            Salin Link Website Publik
          </button>
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
              <span>Buku PDF & Link Folder Drive</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('CLASSROOM');
                if (!needsGoogleAuth && courses.length === 0) {
                  handleLoadClassroom();
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 ${
                activeTab === 'CLASSROOM'
                  ? 'btn-tactile-sky'
                  : 'bg-[#0B101E] text-slate-300 border border-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Google Classroom</span>
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
                  ● Terhubung: {googleUserEmail}
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

        {/* TAB 1: BUKU PDF & LINK FOLDER GOOGLE DRIVE */}
        {activeTab === 'BOOKS_DRIVE' && (
          <div className="space-y-6">
            {/* Admin Shared Folder Link Box (Strictly Link-Shared Folder Only!) */}
            <div className="p-5 rounded-2xl bg-[#0B101E] border-2 border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold text-sky-400 flex items-center gap-1.5">
                    <Link2 className="w-4 h-4" />
                    <span>
                       Pengaturan Admin: Folder Google Drive yang Dibagikan dengan Link
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Aplikasi ini menjaga privasimu: hanya membaca file PDF dari satu folder Google Drive yang kamu bagikan menggunakan link (tidak pernah memindai seluruh isi Google Drive).
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
                      : 'Hubungkan & Sinkronkan Link Folder'}
                  </span>
                </button>
              </form>

              {/* Upload PDF directly into the linked shared folder */}
              {activeDriveConfig && !needsGoogleAuth && (
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    value={customPdfTitle}
                    onChange={(e) => setCustomPdfTitle(e.target.value)}
                    placeholder="Judul buku baru (opsional) sebelum pilih file PDF..."
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-500"
                  />
                  <label className="px-4 py-2 rounded-xl btn-tactile-emerald text-xs font-extrabold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {isUploadingPdf
                        ? 'Mengunggah ke Folder Link...'
                        : 'Tambah Buku PDF ke Folder Link'}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleUploadPdfToSharedFolder}
                      disabled={isUploadingPdf}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Catalog List (Kemendikdasmen + Synced Google Drive PDFs) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">
                  Daftar Buku & Modul PDF Tersedia ({catalogBooks.length} Buku)
                </h3>
                <a
                  href="https://buku.kemendikdasmen.go.id/daftar-katalog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <span>Buka Katalog Kemendikdasmen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
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
                            ? '● PDF Google Drive (Auto-Update)'
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
                                  window.open(
                                    book.webViewLink,
                                    '_blank',
                                    'noopener,noreferrer'
                                  );
                                }
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg btn-tactile-emerald text-xs font-extrabold flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh PDF Drive</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              downloadGeneratedModulePdf({
                                title: book.title,
                                level: book.educationLevel,
                                classRange: book.classLabel,
                                subject: book.subject,
                                bookTitle: book.title,
                                publisher: book.publisher,
                                catalogUrl: book.catalogUrl,
                                summaryPoints: [
                                  `Ringkasan materi resmi dari buku "${book.title}".`,
                                  `Diterbitkan oleh ${book.publisher}.`,
                                  `Katalog lengkap tersedia di ${book.catalogUrl}`,
                                ],
                              })
                            }
                            className="px-3 py-1.5 rounded-lg btn-tactile-sky text-xs font-extrabold flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh PDF</span>
                          </button>
                        )}

                        <a
                          href={book.catalogUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1"
                        >
                          <span>Sumber</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {book.sourceType === 'GOOGLE_DRIVE' && (
                        <button
                          type="button"
                          onClick={() => setBookPendingDelete(book)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                          title="Hapus buku dari katalog"
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

        {/* TAB 2: GOOGLE CLASSROOM */}
        {activeTab === 'CLASSROOM' && (
          <div className="space-y-5">
            {needsGoogleAuth ? (
              <div className="p-6 rounded-2xl bg-[#0B101E] border border-slate-800 text-center space-y-3">
                <GraduationCap className="w-8 h-8 text-sky-400 mx-auto" />
                <div className="text-sm font-extrabold text-white">
                  Hubungkan Akun Google Classroom Kamu
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Klik tombol &ldquo;Sign in with Google&rdquo; di bagian atas untuk melihat daftar kelas, materi PDF guru, dan tugas dari Google Classroom secara langsung.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-300">
                    Daftar Kelas Aktif di Google Classroom ({courses.length} Kelas)
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadClassroom}
                    disabled={isLoadingClassroom}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        isLoadingClassroom ? 'animate-spin' : ''
                      }`}
                    />
                    <span>Muat Ulang Kelas</span>
                  </button>
                </div>

                {courses.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-[#0B101E] border border-slate-800 text-xs text-slate-400">
                    {isLoadingClassroom
                      ? 'Memuat daftar kelas dari Google Classroom...'
                      : 'Belum ada kelas aktif ditemukan pada akun Google Classroom ini.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5 space-y-2">
                      {courses.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectClassroomCourse(c)}
                          className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                            selectedCourse?.id === c.id
                              ? 'bg-sky-500/15 border-sky-400 text-white'
                              : 'bg-[#0B101E] border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="text-xs sm:text-sm font-extrabold">
                            {c.name}
                          </div>
                          {c.section && (
                            <div className="text-[11px] text-slate-400">
                              {c.section}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="md:col-span-7 p-4 rounded-2xl bg-[#0B101E] border border-slate-800 space-y-3 max-h-72 overflow-y-auto">
                      <div className="text-xs font-extrabold text-sky-400">
                        Tugas & Materi Kelas: {selectedCourse?.name}
                      </div>
                      {courseItems.length === 0 ? (
                        <div className="text-xs text-slate-400">
                          Belum ada tugas atau materi terpublikasi di kelas ini.
                        </div>
                      ) : (
                        courseItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                          >
                            <div className="text-xs font-bold text-white">
                              {item.title}
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            {item.alternateLink && (
                              <a
                                href={item.alternateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300"
                              >
                                <span>Buka di Google Classroom</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
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
                <strong className="text-sky-400">2. Otomatis Menyala Kembali (Auto-Scaling & Always Ready):</strong>{' '}
                Meskipun laptop atau HP kamu dimatikan total, siswa dari mana saja tetap bisa login, mengobrol dengan Mimi V15, dan mengunduh buku PDF kapan pun.
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-sky-400">3. Sinkronisasi Real-Time dengan Link Folder Google Drive:</strong>{' '}
                Setiap kali Admin menambahkan PDF baru ke dalam folder Google Drive yang dibagikan lewat link lalu menekan sinkronisasi, seluruh halaman web siswa otomatis terupdate.
              </div>
            </div>
          </div>
        )}

        {/* MANDATORY CONFIRMATION DIALOG FOR DESTRUCTIVE OPERATION */}
        {bookPendingDelete && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#131C31] border-2 border-red-500/60 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2.5 text-red-400 font-extrabold text-base">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Konfirmasi Penghapusan Buku PDF</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Apakah Anda yakin ingin menghapus buku{' '}
                <strong className="text-white">
                  &ldquo;{bookPendingDelete.title}&rdquo;
                </strong>{' '}
                dari katalog web dan folder Google Drive? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setBookPendingDelete(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDeleteBook}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-extrabold text-white"
                >
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus Buku'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
