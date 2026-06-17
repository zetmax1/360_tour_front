import api from './client';

export interface UploadResponse {
  upload_id: string;
  image_url: string;
  thumbnail_url: string;
  status: string;
}

export interface UploadStatusResponse {
  upload_id: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  image_url: string | null;
  thumbnail_url: string | null;
  error_message: string | null;
  created_at: string;
}

export const uploadApi = {
  uploadSceneImage: async (
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post<any, UploadResponse>('/upload/scene-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    });
  },

  /** Poll the processing status of a previously uploaded image. */
  getUploadStatus: async (uploadId: string): Promise<UploadStatusResponse> => {
    return api.get<any, UploadStatusResponse>(`/upload/${uploadId}/status`);
  },

  uploadCoverImage: async (
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post<any, UploadResponse>('/upload/cover-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    });
  },
};
