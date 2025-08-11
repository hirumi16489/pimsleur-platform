import { LessonProcessingStatus } from '../../../shared/types/LessonProcessing';

export interface LessonProcessingRepository {
  markInProgress(userId: string, lessonId: string, step: string): Promise<void>;
  markCompleted(userId: string, lessonId: string, step: string): Promise<void>;
  markFailed(userId: string, lessonId: string, step: string, error: string): Promise<void>;
  getStatus(userId: string, lessonId: string, step: string): Promise<LessonProcessingStatus | null>;
}
