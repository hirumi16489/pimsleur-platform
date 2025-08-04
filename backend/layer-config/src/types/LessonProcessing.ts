import { z } from "zod";

export enum LessonProcessingStatus {
	Pending = "pending",
	InProgress = "in_progress",
	Completed = "completed",
	Failed = "failed",
}

export const LessonProcessingSchema = z.object({
	lessonId: z.string(), // PK
	userId: z.string(),
	step: z.string(), // name of the step (e.g., "extract-text", "generate-audio")
	status: z.nativeEnum(LessonProcessingStatus),
	lastUpdated: z.string().datetime(),
	error: z.string().optional(),
});

export type LessonProcessing = z.infer<typeof LessonProcessingSchema>;