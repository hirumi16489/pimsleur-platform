import { z } from 'zod';

export enum WordStatus {
  UNSEEN = 'UNSEEN',
  LEARNING = 'LEARNING',
  MASTERED = 'MASTERED',
}

export const UserVocabSchema = z.object({
  userId: z.string(),
  word: z.string(), // FK to GlobalDictionary
  status: z.enum(WordStatus),
  accuracy: z.number().min(0).max(1),
  attempts: z.number().int().nonnegative(),
  lastReviewed: z.iso.datetime(), // ISO string
});

export type UserVocab = z.infer<typeof UserVocabSchema>;
