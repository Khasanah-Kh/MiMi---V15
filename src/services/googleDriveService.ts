import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Minimal, least-privilege OAuth scopes:
// 1. Basic profile (email & name/photo for login)
// 2. Read-only Drive access (view & download PDFs only — NO edit/delete/create)
export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/drive.readonly',
];

export const OFFICIAL_DRIVE_PDF_FOLDER_URL =
  'https://drive.google.com/drive/folders/11kyLbfZzoErchLOthATLV8RqHiplI5Lk?usp=drive_link';
export const OFFICIAL_DRIVE_PDF_FOLDER_ID =
  '11kyLbfZzoErchLOthATLV8RqHiplI5Lk';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  provider.addScope(scope);
}

let isSigningIn = false;
// Cache the access token in memory ONLY (never in localStorage or sessionStorage).
let cachedAccessToken: string | null = null;

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleDriveSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutDrive = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface DriveFolderItem {
  id: string;
  name: string;
  shared?: boolean;
  webViewLink?: string;
}

export interface DrivePdfFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
}

export interface ClassroomCourseItem {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  alternateLink?: string;
  courseState?: string;
}

export interface ClassroomWorkItem {
  id: string;
  title: string;
  description?: string;
  alternateLink?: string;
  updateTime?: string;
  materials?: Array<{
    driveFile?: {
      driveFile?: {
        id: string;
        title: string;
        alternateLink?: string;
      };
    };
    link?: {
      url: string;
      title?: string;
    };
  }>;
}

/**
 * Extracts the Google Drive Folder ID strictly from a shared Google Drive folder link.
 */
export function extractDriveFolderIdFromLink(rawLink: string): string | null {
  const trimmed = rawLink.trim();
  if (!trimmed) return null;

  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{10,})/);
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1];
  }

  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  return null;
}

/**
 * Verifies a single folder from its shared link without scanning other folders in Google Drive.
 */
export async function verifySharedDriveFolderByLink(
  sharedFolderLink: string
): Promise<DriveFolderItem> {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error('UNAUTHENTICATED_DRIVE');
  }

  const folderId = extractDriveFolderIdFromLink(sharedFolderLink);
  if (!folderId) {
    throw new Error(
      'Format link folder Google Drive tidak valid. Pastikan link berbentuk https://drive.google.com/drive/folders/...?usp=sharing'
    );
  }

  const fields = encodeURIComponent('id,name,mimeType,shared,webViewLink');
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
    folderId
  )}?fields=${fields}&supportsAllDrives=true`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    cachedAccessToken = null;
    throw new Error('UNAUTHENTICATED_DRIVE');
  }

  if (!res.ok) {
    throw new Error(
      'Folder tidak ditemukan atau belum dibagikan dengan link. Pastikan izin folder disetel ke "Siapa saja yang memiliki link".'
    );
  }

  const data = await res.json();
  if (data.mimeType !== 'application/vnd.google-apps.folder') {
    throw new Error('Tautan yang dimasukkan bukan folder Google Drive.');
  }

  return {
    id: data.id,
    name: data.name || 'Folder Buku Materi (Dibagikan dengan Link)',
    shared: true,
    webViewLink:
      data.webViewLink ||
      `https://drive.google.com/drive/folders/${data.id}?usp=sharing`,
  };
}

/**
 * Lists PDF files strictly inside the single Admin-linked shared folder ID.
 * Never accesses or lists any other folder in Google Drive.
 */
export async function listDrivePdfsInFolder(
  folderId: string
): Promise<DrivePdfFile[]> {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error('UNAUTHENTICATED_DRIVE');
  }
  const cleanFolderId = folderId.trim().replace(/['"\\]/g, '');
  if (!cleanFolderId) {
    return [];
  }

  const rawQuery = `'${cleanFolderId}' in parents and mimeType='application/pdf' and trashed=false`;
  const query = encodeURIComponent(rawQuery);
  const fields = encodeURIComponent(
    'files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)'
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&includeItemsFromAllDrives=true&supportsAllDrives=true&orderBy=modifiedTime desc&pageSize=50`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    cachedAccessToken = null;
    throw new Error('UNAUTHENTICATED_DRIVE');
  }

  if (!res.ok) {
    throw new Error('Gagal memuat file PDF dari link folder yang dibagikan.');
  }

  const data = await res.json();
  return Array.isArray(data.files) ? data.files : [];
}

/**
 * Downloads a PDF file strictly in read-only mode (drive.readonly).
 * Never edits, creates, or deletes any user files on Google Drive.
 */
export async function downloadDrivePdfBlob(
  fileId: string,
  fileName: string
): Promise<void> {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error('UNAUTHENTICATED_DRIVE');
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?alt=media&supportsAllDrives=true`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Gagal mengunduh file PDF dari Google Drive.');
  }

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
}

/**
 * Opens the official Google Drive PDF folder so students can select and download
 * the exact subject PDF material they clicked.
 */
export function downloadGeneratedModulePdf(_options?: {
  title?: string;
  level?: string;
  classRange?: string;
  subject?: string;
  bookTitle?: string;
  publisher?: string;
  catalogUrl?: string;
  summaryPoints?: string[];
  formula?: string;
}): void {
  const a = document.createElement('a');
  a.href = OFFICIAL_DRIVE_PDF_FOLDER_URL;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

