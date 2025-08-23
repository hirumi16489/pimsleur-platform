import { AppError } from './validation';

export type Result<T> = { success: true; data: T } | { success: false; error: AppError };

export type UploadedFile = {
  name: string;
  size: number;
  contentType: string;
  etag?: string;
};

export type FileInfo = {
  lessonId: string;
  userId: string;
  files: UploadedFile[];
  metadata: {
    userId: string;
    filesKey: string;
  };
};
