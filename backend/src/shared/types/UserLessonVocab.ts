import { z } from 'zod';

export const UserLessonVocabSchema = z.object({
  lessonId: z.string(),
  userId: z.string(),
  word: z.string(), // FK to UserVocab
});

export type UserLessonVocab = z.infer<typeof UserLessonVocabSchema>;
