// Centralized validation patterns and functions

export const VALIDATION_PATTERNS = {
  // Lesson ID: must start with 'lesson#' followed by a valid UUID v4
  LESSON_ID: /^lesson#[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

  // User ID: must start with 'user#' followed by alphanumeric characters, hyphens, or underscores
  USER_ID: /^user#[a-zA-Z0-9_-]+$/,
} as const;

export const VALIDATION_MESSAGES = {
  LESSON_ID: {
    message: 'Invalid lesson ID format',
    expected: 'lesson#uuid (e.g., lesson#123e4567-e89b-12d3-a456-426614174000)',
  },
  USER_ID: {
    message: 'Invalid user ID format',
    expected: 'user#id (e.g., user#123)',
  },
} as const;

export function validateLessonId(lessonId: string): boolean {
  return VALIDATION_PATTERNS.LESSON_ID.test(lessonId);
}

export function validateUserId(userId: string): boolean {
  return VALIDATION_PATTERNS.USER_ID.test(userId);
}

export function getLessonIdValidationError(lessonId: string) {
  return {
    statusCode: 400,
    body: JSON.stringify({
      ...VALIDATION_MESSAGES.LESSON_ID,
      received: lessonId,
    }),
  };
}

export function getUserIdValidationError(userId: string) {
  return {
    statusCode: 400,
    body: JSON.stringify({
      ...VALIDATION_MESSAGES.USER_ID,
      received: userId,
    }),
  };
}
