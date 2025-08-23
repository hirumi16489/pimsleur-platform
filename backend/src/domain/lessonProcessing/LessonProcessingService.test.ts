import { LessonProcessingService } from './LessonProcessingService';
import { LessonProcessingRepository } from './ports/LessonProcessingRepository';
import { LessonProcessingStatus } from '../../shared/types/LessonProcessing';

// Simple mock repository
const mockRepository: jest.Mocked<LessonProcessingRepository> = {
  createLessonProcessing: jest.fn(),
  markInProgress: jest.fn(),
  markCompleted: jest.fn(),
  markFailed: jest.fn(),
  getStatus: jest.fn(),
};

describe('LessonProcessingService', () => {
  let service: LessonProcessingService;

  beforeEach(() => {
    service = new LessonProcessingService(mockRepository);
    jest.clearAllMocks();
  });

  describe('createLessonProcessing', () => {
    it('should create lesson processing successfully', async () => {
      // Mock repository to return no existing status
      mockRepository.getStatus.mockResolvedValue(null);
      mockRepository.createLessonProcessing.mockResolvedValue();

      const request = {
        userId: 'user-123',
        lessonId: 'lesson-456',
        step: 'upload-complete',
      };

      const result = await service.createLessonProcessing(request);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        lessonId: 'lesson-456',
        userId: 'user-123',
        step: 'upload-complete',
        status: LessonProcessingStatus.IN_PROGRESS,
        timestamp: expect.any(String),
      });

      expect(mockRepository.getStatus).toHaveBeenCalledWith(
        'user-123',
        'lesson-456',
        'upload-complete'
      );
      expect(mockRepository.createLessonProcessing).toHaveBeenCalledWith(
        'user-123',
        'lesson-456',
        'upload-complete'
      );
    });

    it('should return error when userId is missing', async () => {
      const request = {
        userId: '',
        lessonId: 'lesson-456',
        step: 'upload-complete',
      };

      const result = await service.createLessonProcessing(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_INPUT');
      expect(result.error?.message).toBe('userId, lessonId, and step are required');
    });

    it('should return error when lessonId is missing', async () => {
      const request = {
        userId: 'user-123',
        lessonId: '',
        step: 'upload-complete',
      };

      const result = await service.createLessonProcessing(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_INPUT');
      expect(result.error?.message).toBe('userId, lessonId, and step are required');
    });

    it('should return error when step is missing', async () => {
      const request = {
        userId: 'user-123',
        lessonId: 'lesson-456',
        step: '',
      };

      const result = await service.createLessonProcessing(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_INPUT');
      expect(result.error?.message).toBe('userId, lessonId, and step are required');
    });

    it('should return error when processing already exists', async () => {
      // Mock repository to return existing status
      mockRepository.getStatus.mockResolvedValue(LessonProcessingStatus.IN_PROGRESS);

      const request = {
        userId: 'user-123',
        lessonId: 'lesson-456',
        step: 'upload-complete',
      };

      const result = await service.createLessonProcessing(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ALREADY_EXISTS');
      expect(result.error?.message).toBe(
        "Processing step 'upload-complete' already exists for lesson lesson-456"
      );

      expect(mockRepository.getStatus).toHaveBeenCalledWith(
        'user-123',
        'lesson-456',
        'upload-complete'
      );
      expect(mockRepository.createLessonProcessing).not.toHaveBeenCalled();
    });

    it('should return error when repository throws an exception', async () => {
      // Mock repository to return no existing status but throw on create
      mockRepository.getStatus.mockResolvedValue(null);
      mockRepository.createLessonProcessing.mockRejectedValue(new Error('Database error'));

      const request = {
        userId: 'user-123',
        lessonId: 'lesson-456',
        step: 'upload-complete',
      };

      const result = await service.createLessonProcessing(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INTERNAL_ERROR');
      expect(result.error?.message).toBe('Failed to create lesson processing entry');
      expect(result.error?.details).toBeInstanceOf(Error);
    });
  });

  describe('getProcessingStatus', () => {
    it('should return status successfully', async () => {
      mockRepository.getStatus.mockResolvedValue(LessonProcessingStatus.COMPLETED);

      const result = await service.getProcessingStatus('user-123', 'lesson-456', 'extract-text');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        lessonId: 'lesson-456',
        userId: 'user-123',
        step: 'extract-text',
        status: LessonProcessingStatus.COMPLETED,
        timestamp: expect.any(String),
      });

      expect(mockRepository.getStatus).toHaveBeenCalledWith(
        'user-123',
        'lesson-456',
        'extract-text'
      );
    });

    it('should return error when step not found', async () => {
      mockRepository.getStatus.mockResolvedValue(null);

      const result = await service.getProcessingStatus('user-123', 'lesson-456', 'extract-text');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe(
        "Processing step 'extract-text' not found for lesson lesson-456"
      );
    });
  });

  describe('markStepCompleted', () => {
    it('should mark step as completed successfully', async () => {
      mockRepository.markCompleted.mockResolvedValue();

      const result = await service.markStepCompleted('user-123', 'lesson-456', 'extract-text');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe(LessonProcessingStatus.COMPLETED);
      expect(mockRepository.markCompleted).toHaveBeenCalledWith(
        'user-123',
        'lesson-456',
        'extract-text'
      );
    });
  });

  describe('markStepFailed', () => {
    it('should mark step as failed successfully', async () => {
      mockRepository.markFailed.mockResolvedValue();

      const result = await service.markStepFailed(
        'user-123',
        'lesson-456',
        'extract-text',
        'Test error'
      );

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe(LessonProcessingStatus.FAILED);
      expect(mockRepository.markFailed).toHaveBeenCalledWith(
        'user-123',
        'lesson-456',
        'extract-text',
        'Test error'
      );
    });
  });
});
