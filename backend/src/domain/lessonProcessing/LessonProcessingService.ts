import { LessonProcessingRepository } from './ports/LessonProcessingRepository';
import { LessonProcessingStatus } from '../../shared/types/LessonProcessing';
import { AppErrorCode } from '../file/validation';

export interface LessonProcessingResult {
  success: boolean;
  data?: {
    lessonId: string;
    userId: string;
    step: string;
    status: LessonProcessingStatus;
    timestamp: string;
  };
  error?: {
    code: AppErrorCode;
    message: string;
    details?: unknown;
  };
}

export interface CreateLessonProcessingRequest {
  userId: string;
  lessonId: string;
  step: string;
}

export class LessonProcessingService {
  constructor(private readonly repository: LessonProcessingRepository) {}

  /**
   * Creates a new lesson processing entry
   */
  async createLessonProcessing(
    request: CreateLessonProcessingRequest
  ): Promise<LessonProcessingResult> {
    try {
      const { userId, lessonId, step } = request;

      // Validate inputs
      if (!userId || !lessonId || !step) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'userId, lessonId, and step are required',
          },
        };
      }

      // Check if processing already exists
      const existingStatus = await this.repository.getStatus(userId, lessonId, step);
      if (existingStatus) {
        return {
          success: false,
          error: {
            code: 'ALREADY_EXISTS',
            message: `Processing step '${step}' already exists for lesson ${lessonId}`,
          },
        };
      }

      // Create the processing entry
      await this.repository.createLessonProcessing(userId, lessonId, step);

      const timestamp = new Date().toISOString();
      return {
        success: true,
        data: {
          lessonId,
          userId,
          step,
          status: LessonProcessingStatus.IN_PROGRESS,
          timestamp,
        },
      };
    } catch (error) {
      console.error('Error creating lesson processing:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create lesson processing entry',
          details: error,
        },
      };
    }
  }

  /**
   * Gets the current status of a lesson processing step
   */
  async getProcessingStatus(
    userId: string,
    lessonId: string,
    step: string
  ): Promise<LessonProcessingResult> {
    try {
      if (!userId || !lessonId || !step) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'userId, lessonId, and step are required',
          },
        };
      }

      const status = await this.repository.getStatus(userId, lessonId, step);

      if (status === null) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Processing step '${step}' not found for lesson ${lessonId}`,
          },
        };
      }

      return {
        success: true,
        data: {
          lessonId,
          userId,
          step,
          status,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error getting processing status:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get processing status',
          details: error,
        },
      };
    }
  }

  /**
   * Marks a lesson processing step as completed
   */
  async markStepCompleted(
    userId: string,
    lessonId: string,
    step: string
  ): Promise<LessonProcessingResult> {
    try {
      if (!userId || !lessonId || !step) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'userId, lessonId, and step are required',
          },
        };
      }

      await this.repository.markCompleted(userId, lessonId, step);

      return {
        success: true,
        data: {
          lessonId,
          userId,
          step,
          status: LessonProcessingStatus.COMPLETED,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error marking step completed:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to mark step as completed',
          details: error,
        },
      };
    }
  }

  /**
   * Marks a lesson processing step as failed
   */
  async markStepFailed(
    userId: string,
    lessonId: string,
    step: string,
    error: string
  ): Promise<LessonProcessingResult> {
    try {
      if (!userId || !lessonId || !step || !error) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'userId, lessonId, step, and error are required',
          },
        };
      }

      await this.repository.markFailed(userId, lessonId, step, error);

      return {
        success: true,
        data: {
          lessonId,
          userId,
          step,
          status: LessonProcessingStatus.FAILED,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error marking step failed:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to mark step as failed',
          details: error,
        },
      };
    }
  }
}
