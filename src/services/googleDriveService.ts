import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = [
  // Google Drive scopes
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
  // Google Classroom scopes
  'https://www.googleapis.com/auth/classroom.addons.student',
  'https://www.googleapis.com/auth/classroom.addons.teacher',
  'https://www.googleapis.com/auth/classroom.announcements',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
  'https://www.googleapis.com/auth/classroom.guardianlinks.me.readonly',
  'https://www.googleapis.com/auth/classroom.guardianlinks.students',
  'https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/classroom.profile.photos',
  'https://www.googleapis.com/auth/classroom.push-notifications',
  'https://www.googleapis.com/auth/classroom.rosters',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
  'https://www.googleapis.com/auth/classroom.topics',
  'https://www.googleapis.com/auth/classroom.topics.readonly',
];

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
 * Uploads a PDF file strictly into the Admin's link-shared Google Drive folder.
 */
export async function uploadPdfToDriveFolder(
  file: File,
  folderId: string,
  customTitle?: string
): Promise<DrivePdfFile> {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error('UNAUTHENTICATED_DRIVE');
  }

  if (!folderId || !folderId.trim()) {
    throw new Error(
      'Silakan hubungkan link folder Google Drive yang dibagikan terlebih dahulu.'
    );
  }

  const metadata: Record<string, any> = {
    name: customTitle
      ? customTitle.endsWith('.pdf')
        ? customTitle
        : `${customTitle}.pdf`
      : file.name,
    mimeType: 'application/pdf',
    parents: [folderId.trim()],
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', file);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,mimeType,size,modifiedTime,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (res.status === 401 || res.status === 403) {
    cachedAccessToken = null;
    throw new Error('UNAUTHENTICATED_DRIVE');
  }

  if (!res.ok) {
    throw new Error('Gagal mengunggah buku PDF ke folder link Google Drive.');
  }

  return (await res.json()) as DrivePdfFile;
}

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

export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error('UNAUTHENTICATED_DRIVE');
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?supportsAllDrives=true`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Gagal menghapus file dari Google Drive.');
  }
}

/**
 * Google Classroom API: Lists active courses for the authenticated student/teacher.
 */
export async function listClassroomCourses(): Promise<ClassroomCourseItem[]> {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error('UNAUTHENTICATED_DRIVE');
  }

  const res = await fetch(
    'https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&pageSize=20',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.status === 401 || res.status === 403) {
    cachedAccessToken = null;
    throw new Error('UNAUTHENTICATED_DRIVE');
  }

  if (!res.ok) {
    throw new Error('Gagal memuat daftar kelas dari Google Classroom.');
  }

  const data = await res.json();
  return Array.isArray(data.courses) ? data.courses : [];
}

/**
 * Google Classroom API: Lists coursework & materials for a selected course.
 */
export async function listClassroomCourseItems(
  courseId: string
): Promise<ClassroomWorkItem[]> {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error('UNAUTHENTICATED_DRIVE');
  }

  const [workRes, matRes] = await Promise.all([
    fetch(
      `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(
        courseId
      )}/courseWork?pageSize=15`,
      { headers: { Authorization: `Bearer ${token}` } }
    ),
    fetch(
      `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(
        courseId
      )}/courseWorkMaterials?pageSize=15`,
      { headers: { Authorization: `Bearer ${token}` } }
    ),
  ]);

  const items: ClassroomWorkItem[] = [];
  if (workRes.ok) {
    const workData = await workRes.json();
    if (Array.isArray(workData.courseWork)) {
      items.push(...workData.courseWork);
    }
  }
  if (matRes.ok) {
    const matData = await matRes.json();
    if (Array.isArray(matData.courseWorkMaterial)) {
      items.push(...matData.courseWorkMaterial);
    }
  }

  return items;
}

/**
 * Generates a valid, standards-compliant downloadable PDF file on the fly
 * for any module or textbook summary so students can always download PDF material offline.
 */
export function downloadGeneratedModulePdf(options: {
  title: string;
  level: string;
  classRange: string;
  subject: string;
  bookTitle: string;
  publisher: string;
  catalogUrl: string;
  summaryPoints: string[];
  formula?: string;
}): void {
  const sanitizePdfText = (str: string) =>
    str
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/[()\\]/g, '')
      .slice(0, 95);

  const lines: string[] = [
    'MODUL & RINGKASAN BUKU RESMI - ROOM BELAJAR MIMI V15',
    `Jenjang: ${options.level} (${options.classRange}) | Mata Pelajaran: ${options.subject}`,
    `Judul Modul: ${options.title}`,
    '------------------------------------------------------------------------',
    'SUMBER BUKU TEKS TERVERIFIKASI:',
    `Judul Buku: ${options.bookTitle}`,
    `Penerbit: ${options.publisher}`,
    `Katalog Resmi: ${options.catalogUrl}`,
    '------------------------------------------------------------------------',
    'INTISARI KONSEP & MATERI:',
    ...options.summaryPoints.map((pt, i) => `${i + 1}. ${pt}`),
  ];

  if (options.formula) {
    lines.push(
      '------------------------------------------------------------------------'
    );
    lines.push(`Rumus / Model Kunci: ${options.formula}`);
  }

  lines.push(
    '------------------------------------------------------------------------'
  );
  lines.push('Dicetak otomatis dari Room Belajar Mimi V15 (Cloud 24/7)');

  let contentStream = 'BT\n/F1 11 Tf\n50 760 Td\n16 TL\n';
  for (const line of lines) {
    const clean = line.replace(/[^\x20-\x7E]/g, ' ').replace(/[()\\]/g, '');
    const chunks = clean.match(/.{1,82}(\s|$)/g) || [clean];
    for (const chunk of chunks) {
      contentStream += `(${sanitizePdfText(chunk.trim())}) Tj T*\n`;
    }
  }
  contentStream += 'ET';

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeFilename = options.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  a.href = url;
  a.download = `Materi-${options.level}-${safeFilename || 'mimi-v15'}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
