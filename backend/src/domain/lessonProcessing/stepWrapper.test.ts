import { createStepWrapper } from './stepWrapper';
import { LessonProcessingStatus } from '../../shared';
import type { DynamoLessonProcessingRepository } from '../../infrastructure/dynamodb/LessonProcessingRepository';

describe('stepWrapper', () => {
  let mockRepo: jest.Mocked<DynamoLessonProcessingRepository>;
  let stepWrapper: ReturnType<typeof createStepWrapper>;

  beforeEach(() => {
    mockRepo = {
      getStatus: jest.fn(),
      markInProgress: jest.fn(),
      markCompleted: jest.fn(),
      markFailed: jest.fn(),
    } as unknown as jest.Mocked<DynamoLessonProcessingRepository>;

    stepWrapper = createStepWrapper(mockRepo);
  });

  const validEvent = {
    lessonId: 'lesson-123',
    userId: 'user-456',
    taskToken: 'task-token-789',
  };

  it('should successfully execute a step and mark it as completed', async () => {
    mockRepo.getStatus.mockResolvedValue(null);

    const handler = jest.fn().mockResolvedValue({ success: true });
    const wrappedHandler = stepWrapper('test-step', handler);

    const result = await wrappedHandler(validEvent);

    expect(result).toEqual({ success: true });
    expect(mockRepo.getStatus).toHaveBeenCalledWith('user-456', 'lesson-123', 'test-step');
    expect(mockRepo.markInProgress).toHaveBeenCalledWith('user-456', 'lesson-123', 'test-step');
    expect(mockRepo.markCompleted).toHaveBeenCalledWith('user-456', 'lesson-123', 'test-step');
    expect(handler).toHaveBeenCalledWith({ ...validEvent, taskToken: 'task-token-789' });
  });

  it('should skip execution if step is already completed', async () => {
    mockRepo.getStatus.mockResolvedValue(LessonProcessingStatus.COMPLETED);

    const handler = jest.fn();
    const wrappedHandler = stepWrapper('test-step', handler);

    const result = await wrappedHandler(validEvent);

    expect(result).toEqual({ status: 'SKIPPED' });
    expect(handler).not.toHaveBeenCalled();
    expect(mockRepo.markInProgress).not.toHaveBeenCalled();
  });

  it('should mark step as failed when handler throws an error', async () => {
    mockRepo.getStatus.mockResolvedValue(null);

    const error = new Error('Handler failed');
    const handler = jest.fn().mockRejectedValue(error);
    const wrappedHandler = stepWrapper('test-step', handler);

    await expect(wrappedHandler(validEvent)).rejects.toThrow('Handler failed');

    expect(mockRepo.markInProgress).toHaveBeenCalledWith('user-456', 'lesson-123', 'test-step');
    expect(mockRepo.markFailed).toHaveBeenCalledWith(
      'user-456',
      'lesson-123',
      'test-step',
      'Handler failed'
    );
    expect(mockRepo.markCompleted).not.toHaveBeenCalled();
  });

  it('should not mark step as completed for async tasks', async () => {
    mockRepo.getStatus.mockResolvedValue(null);

    const handler = jest.fn().mockResolvedValue({ data: 'test result' });
    const wrappedHandler = stepWrapper('test-step', handler, { asyncTask: true });

    const result = await wrappedHandler(validEvent);

    expect(result).toEqual({ data: 'test result' });
    expect(mockRepo.markInProgress).toHaveBeenCalledWith('user-456', 'lesson-123', 'test-step');
    expect(mockRepo.markCompleted).not.toHaveBeenCalled();
  });
});
