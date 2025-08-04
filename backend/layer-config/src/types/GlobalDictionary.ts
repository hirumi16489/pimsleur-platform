import { z } from "zod";

export enum JLPTLevel {
  N1 = "N1",
  N2 = "N2",
  N3 = "N3",
  N4 = "N4",
  N5 = "N5",
}

export enum DictionaryType {
  Vocab = "vocab",
  Kanji = "kanji",
  Expression = "expression",
}

export const GlobalDictionarySchema = z.object({
  word: z.string(), // PK
  reading: z.string().optional(),
  meaning: z.string().optional(),
  jlptLevel: z.nativeEnum(JLPTLevel).optional(),
  type: z.nativeEnum(DictionaryType),
});

export type GlobalDictionary = z.infer<typeof GlobalDictionarySchema>;