/**
 * Storage Service API - File upload, download, and management
 */

import client from './client';

// Types
export interface StorageFile {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  bucket: string;
  path: string;
  url?: string;
  metadata?: Record<string, unknown>;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadResponse {
  id: string;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
}

export interface StorageStats {
  total_files: number;
  total_size: number;
  by_type: Record<string, number>;
  by_bucket: Record<string, number>;
}

export interface ListFilesParams {
  bucket?: string;
  prefix?: string;
  mime_type?: string;
  limit?: number;
  offset?: number;
}

// File Upload APIs
export const uploadFile = async (
  file: File,
  bucket: string = 'default',
  metadata?: Record<string, unknown>
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }

  const res = await client.post('/storage/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const uploadMultiple = async (
  files: File[],
  bucket: string = 'default'
): Promise<UploadResponse[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('bucket', bucket);

  const res = await client.post('/storage/upload/batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// File Download APIs
export const downloadFile = async (fileId: string): Promise<Blob> => {
  const res = await client.get(`/storage/download/${fileId}`, {
    responseType: 'blob',
  });
  return res.data;
};

export const getFileUrl = async (fileId: string, expiresIn?: number): Promise<string> => {
  const params = expiresIn ? { expires_in: expiresIn } : {};
  const res = await client.get(`/storage/url/${fileId}`, { params });
  return res.data.url;
};

// File Management APIs
export const listFiles = async (params?: ListFilesParams): Promise<StorageFile[]> => {
  const res = await client.get('/storage/list', { params });
  return res.data;
};

export const getFile = async (fileId: string): Promise<StorageFile> => {
  const res = await client.get(`/storage/${fileId}`);
  return res.data;
};

export const deleteFile = async (fileId: string): Promise<void> => {
  await client.delete(`/storage/${fileId}`);
};

export const deleteMultiple = async (fileIds: string[]): Promise<{ deleted: number }> => {
  const res = await client.post('/storage/delete/batch', { file_ids: fileIds });
  return res.data;
};

export const updateFileMetadata = async (
  fileId: string,
  metadata: Record<string, unknown>
): Promise<StorageFile> => {
  const res = await client.patch(`/storage/${fileId}/metadata`, { metadata });
  return res.data;
};

// Bucket APIs
export const listBuckets = async (): Promise<string[]> => {
  const res = await client.get('/storage/buckets');
  return res.data;
};

export const createBucket = async (name: string): Promise<{ name: string; created: boolean }> => {
  const res = await client.post('/storage/buckets', { name });
  return res.data;
};

// Stats APIs
export const getStorageStats = async (): Promise<StorageStats> => {
  const res = await client.get('/storage/stats');
  return res.data;
};

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  const res = await client.get('/storage/health');
  return res.data;
};

export default {
  uploadFile,
  uploadMultiple,
  downloadFile,
  getFileUrl,
  listFiles,
  getFile,
  deleteFile,
  deleteMultiple,
  updateFileMetadata,
  listBuckets,
  createBucket,
  getStorageStats,
  healthCheck,
};
