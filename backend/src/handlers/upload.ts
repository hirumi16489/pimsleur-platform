import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda';
import { FileService } from '../services/FileService';

const allowedMimeTypes = ['text/plain', 'image/jpeg', 'image/png'];

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

    const presignUrl = await FileService.generateUploadUrl(userId, fileType);
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