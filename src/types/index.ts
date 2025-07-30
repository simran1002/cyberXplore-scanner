export interface FileDocument {
  _id?: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  status: 'pending' | 'scanning' | 'scanned';
  result: 'clean' | 'infected' | null;
  uploadedAt: Date;
  scannedAt: Date | null;
  hash?: string;
}

export interface ScanJob {
  fileId: string;
  filename: string;
  path: string;
  createdAt: Date;
}

export interface ScanResult {
  fileId: string;
  result: 'clean' | 'infected';
  threats?: string[];
  scannedAt: Date;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file?: FileDocument;
  error?: string;
}

export interface FilesResponse {
  success: boolean;
  files: FileDocument[];
  total: number;
  page: number;
  limit: number;
}
