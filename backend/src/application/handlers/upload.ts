import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda';
import { FileService } from '../../domain/fileUpload/FileService';
import { S3Client } from '@aws-sdk/client-s3';
import { getConfig } from '../helpers/config';
import { S3ClientWrapper } from '../../infrastructure/S3Client';
import { UploadUrlProvider } from '../../domain/fileUpload/ports/UploadUrlProvider';

const allowedMimeTypes = ['text/plain', 'image/jpeg', 'image/png'];
const config = getConfig();
const s3 = new S3Client({ region: config.REGION });
const uploadUrlProvider: UploadUrlProvider = new S3ClientWrapper(config, s3);
const fileService = new FileService(uploadUrlProvider);

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const fileType = event.queryStringParameters?.fileType;
    const claims = event.requestContext?.authorizer?.claims;
    const userId = claims?.sub;

    if (!userId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'userId missing' })
      };
    }

    if (!fileType || !allowedMimeTypes.includes(fileType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'fileType invalid' })
      };
    }

    const presignUrl = await fileService.generateUploadUrl(userId, fileType);
    return {
      statusCode: 200,
      body: presignUrl
    };
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};