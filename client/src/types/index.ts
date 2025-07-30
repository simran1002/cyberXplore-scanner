export interface FileDocument {
  _id: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  status: 'pending' | 'scanning' | 'scanned';
  result: 'clean' | 'infected' | null;
  uploadedAt: string;
  scannedAt: string | null;
  hash?: string;
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
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FileStats {
  total: number;
  pending: number;
  scanning: number;
  scanned: number;
  clean: number;
  infected: number;
  threatDetectionRate: string;
}

export interface StatsResponse {
  success: boolean;
  stats: FileStats;
}

export type FilterStatus = 'all' | 'pending' | 'scanning' | 'scanned';
export type FilterResult = 'all' | 'clean' | 'infected';
