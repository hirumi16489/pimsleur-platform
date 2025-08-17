import { AppError } from './validation';

export type Result<T> = { success: true; data: T } | { success: false; error: AppError };

export type MetadataFile = {
  lessonId: string;
  userId: string;
  files: string[];
};
