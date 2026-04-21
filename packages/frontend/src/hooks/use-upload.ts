import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface PresignedUrlResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export function useUploadFile() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const { uploadUrl, fileUrl } = await apiFetch<PresignedUrlResult>(
        '/upload/presigned-url',
        {
          method: 'POST',
          body: JSON.stringify({ fileName: file.name, contentType: file.type }),
        },
      );

      const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!res.ok) throw new Error('Upload thất bại');
      return fileUrl;
    } catch (err) {
      setUploadError((err as Error).message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, uploadError };
}
