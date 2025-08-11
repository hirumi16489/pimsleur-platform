import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { FileService } from '../../domain/file/FileService';
import { S3Client } from '@aws-sdk/client-s3';
import { getConfig } from '../helpers/config';
import { S3ClientWrapper } from '../../infrastructure/S3Client';
import { UploadUrlProvider } from '../../domain/file/ports/UploadUrlProvider';
import { validateLessonId, getLessonIdValidationError } from '../../domain/file/validation';

const config = getConfig();
const s3 = new S3Client({ region: config.REGION });
const uploadUrlProvider: UploadUrlProvider = new S3ClientWrapper(s3);
const fileService = new FileService(uploadUrlProvider);

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { lessonId } = body;
    const claims = event.requestContext?.authorizer?.claims as { sub?: string } | undefined;
    const userId = claims?.sub;

    if (!userId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'userId missing' }),
      };
    }

    if (!lessonId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'lessonId missing' }),
      };
    }

    // Validate lesson ID format using centralized validation
    if (!validateLessonId(lessonId)) {
      return getLessonIdValidationError(lessonId);
    }

    if (!config.UPLOAD_BUCKET_NAME) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'UPLOAD_BUCKET_NAME is not set' }),
      };
    }

    const presignUrl = await fileService.getUploadMetadataUrl(
      config.UPLOAD_BUCKET_NAME,
      userId,
      lessonId
    );
    return {
      statusCode: 200,
      body: presignUrl,
    };
  } catch (err) {
    console.error('Error generating metadata presigned URL:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
