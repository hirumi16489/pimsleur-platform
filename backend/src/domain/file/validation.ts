// Centralized validation patterns and functions

export type AppErrorCode = 'INVALID_LESSON_ID' | 'INVALID_USER_ID';

export interface AppError {
  code: AppErrorCode;
  message: string;
  details?: unknown;
}

export const VALIDATION_PATTERNS = {
  LESSON_ID: /^lesson#[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  USER_ID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
} as const;

export const VALIDATION_MESSAGES = {
  LESSON_ID: {
    message: 'Invalid lesson ID format',
    expected: 'lesson#uuid (e.g., lesson#123e4567-e89b-12d3-a456-426614174000)',
  },
  USER_ID: {
    message: 'Invalid user ID format',
    expected: 'uuid (e.g., 123e4567-e89b-12d3-a456-426614174000)',
  },
} as const;

function getLessonIdValidationError(lessonId: string): AppError {
  return {
    code: 'INVALID_LESSON_ID',
    message: VALIDATION_MESSAGES.LESSON_ID.message,
    details: {
      expected: VALIDATION_MESSAGES.LESSON_ID.expected,
      received: lessonId,
    },
  };
}

function getUserIdValidationError(userId: string): AppError {
  return {
    code: 'INVALID_USER_ID',
    message: VALIDATION_MESSAGES.USER_ID.message,
    details: {
      expected: VALIDATION_MESSAGES.USER_ID.expected,
      received: userId,
    },
  };
}

export function validateLessonId(lessonId: string): AppError | null {
  if (VALIDATION_PATTERNS.LESSON_ID.test(lessonId)) {
    return null;
  }
  return getLessonIdValidationError(lessonId);
}

export function validateUserId(userId: string): AppError | null {
  if (VALIDATION_PATTERNS.USER_ID.test(userId)) {
    return null;
  }
  return getUserIdValidationError(userId);
}
