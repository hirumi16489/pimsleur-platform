import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { FileService, UploadUrl } from '../../../domain/file/FileService';
import { S3Client } from '@aws-sdk/client-s3';
import { getConfig } from '../../helpers/config';
import { S3ClientWrapper } from '../../../infrastructure/S3Client';
import { UploadUrlProvider } from '../../../domain/file/ports/UploadUrlProvider';
import { mapAppErrorToHttpResponse } from '../../helpers/errorMapper';
import { Result } from '../../../domain/file/types';

const allowedMimeTypes = ['text/plain', 'image/jpeg', 'image/png'];
const config = getConfig();
const s3 = new S3Client({ region: config.REGION, requestChecksumCalculation: 'WHEN_REQUIRED' });
const uploadUrlProvider: UploadUrlProvider = new S3ClientWrapper(s3);
const fileService = new FileService(uploadUrlProvider);

export enum PresignKind {
  USER_FILE = 'USER_FILE',
  METADATA = 'METADATA',
}

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = event.body ? JSON.parse(event.body) : {};
  const { kind, fileType, lessonId } = body;
  const claims = event.requestContext?.authorizer?.claims;
  const userId = claims?.sub;

  if (!userId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'userId missing' }),
    };
  }

  if (!kind || !Object.values(PresignKind).includes(kind)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'kind invalid' }),
    };
  }

  if (kind === PresignKind.USER_FILE && (!fileType || !allowedMimeTypes.includes(fileType))) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'fileType invalid' }),
    };
  }

  if (!lessonId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'lessonId missing' }),
    };
  }

  if (!config.UPLOAD_BUCKET_NAME) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'UPLOAD_BUCKET_NAME is not set' }),
    };
  }

  let result: Result<UploadUrl>;
  switch (kind) {
    case PresignKind.METADATA:
      result = await fileService.getUploadMetadataUrl(config.UPLOAD_BUCKET_NAME, userId, lessonId);
      break;
    case PresignKind.USER_FILE:
      result = await fileService.getUserUploadUrl(config.UPLOAD_BUCKET_NAME, userId, lessonId, fileType!);
      break;
    default:
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'kind invalid' }),
      };
  }

  // Check if result is successful
  if (!result.success) {
    return mapAppErrorToHttpResponse(result.error);
  }

  // Result is successful, return the presigned URL
  return {
    statusCode: 200,
    body: JSON.stringify({ url: result.data.url, headers: result.data.headers }),
  };
};
