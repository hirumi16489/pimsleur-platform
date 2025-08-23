import { APIGatewayProxyResult } from 'aws-lambda';
import { AppError } from '../../domain/file/validation';

// Map AppError codes to HTTP responses
export function mapAppErrorToHttpResponse(error: AppError): APIGatewayProxyResult {
  switch (error.code) {
    case 'INVALID_LESSON_ID':
    case 'INVALID_USER_ID':
    case 'GET_UPLOAD_METADATA_URL_FAILED':
    case 'GET_USER_UPLOAD_URL_FAILED':
    case 'GET_METADATA_FAILED':
    case 'CHECK_FILES_FAILED':
    case 'INVALID_INPUT':
    case 'ALREADY_EXISTS':
    case 'NOT_FOUND':
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: error.message,
          details: error.details,
        }),
      };
    case 'INTERNAL_ERROR':
    default:
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Internal Server Error',
          details: error.message,
        }),
      };
  }
}

// Type guard to check if result is an AppError
export function isAppError(result: unknown): result is AppError {
  return typeof result === 'object' && result !== null && 'code' in result;
}
