import { LessonProcessingStatus } from '../../shared';
import type { DynamoLessonProcessingRepository } from '../../infrastructure/dynamodb/LessonProcessingRepository';
import { z } from 'zod';

type StepHandler<TEvent = any, TResult = any> = (event: TEvent) => Promise<TResult>;

const TextExtractionEventSchema = z.object({
  lessonId: z.string(),
  userId: z.string(),
  taskToken: z.string(),
});

export function createStepWrapper(repo: DynamoLessonProcessingRepository) {
  return function stepWrapper<TEvent, TResult>(
    stepName: string,
    handler: StepHandler<TEvent, TResult>,
    options?: { asyncTask?: boolean }
  ) {
    return async (event: TEvent) => {
      const parsedEvent = TextExtractionEventSchema.parse(event);
      const { userId, lessonId, taskToken } = parsedEvent;

      if (typeof stepName !== 'string') {
        throw new Error('stepName must be a string');
      }

      // 1. Check current step status
      const status = await repo.getStatus(userId, lessonId, stepName);

      if (status === LessonProcessingStatus.IN_PROGRESS) {
        throw new Error(`Step "${stepName}" already in progress`);
      }
      if (status === LessonProcessingStatus.COMPLETED) {
        return { status: 'SKIPPED' };
      }

      // 2. Mark in progress
      await repo.markInProgress(userId, lessonId, stepName);

      try {
        const result = await handler({ ...event, taskToken });

        if (!options?.asyncTask) {
          // For synchronous tasks, mark completed here
          await repo.markCompleted(userId, lessonId, stepName);
        }

        return result;
      } catch (err) {
        await repo.markFailed(userId, lessonId, stepName, (err as Error).message);
        throw err;
      }
    };
  };
}
