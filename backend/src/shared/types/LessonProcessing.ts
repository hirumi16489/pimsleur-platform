import { z } from 'zod';

export enum LessonProcessingStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export const LessonProcessingSchema = z.object({
  lessonId: z.string(), // PK
  userId: z.string(),
  step: z.string(), // name of the step (e.g., "extract-text", "generate-audio")
  status: z.enum(LessonProcessingStatus),
  lastUpdated: z.iso.datetime(),
  error: z.string().optional(),
});

export type LessonProcessing = z.infer<typeof LessonProcessingSchema>;
