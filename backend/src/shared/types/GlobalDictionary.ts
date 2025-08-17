import { z } from 'zod';

export enum JLPTLevel {
  N1 = 'N1',
  N2 = 'N2',
  N3 = 'N3',
  N4 = 'N4',
  N5 = 'N5',
}

export enum DictionaryType {
  VOCAB = 'VOCAB',
  KANJI = 'KANJI',
  EXPRESSION = 'EXPRESSION',
}

export const GlobalDictionarySchema = z.object({
  word: z.string(), // PK
  reading: z.string().optional(),
  meaning: z.string().optional(),
  jlptLevel: z.enum(JLPTLevel).optional(),
  type: z.enum(DictionaryType),
});

export type GlobalDictionary = z.infer<typeof GlobalDictionarySchema>;
