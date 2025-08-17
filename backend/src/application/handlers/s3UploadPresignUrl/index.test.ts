import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, Callback } from 'aws-lambda';
import { FileService } from '../../../domain/file/FileService';
import { v4 as uuidv4 } from 'uuid';
import { Result } from '../../../domain/file/types';

// Default mock at module scope; can be overridden with jest.doMock when needed
jest.mock('../../../domain/file/FileService');

describe('s3UploadPresignUrlHandler', () => {
  const defaultConfig = { REGION: 'ap-northeast-1', UPLOAD_BUCKET_NAME: 'test-bucket' };

  const loadHandler = async (
    configOverride?: Partial<typeof defaultConfig>,
    fileServiceImpl?: Partial<FileService>
  ) => {
    const cfg = { ...defaultConfig, ...configOverride };
    jest.doMock('../../helpers/config', () => ({ getConfig: () => cfg }));
    if (fileServiceImpl) {
      jest.doMock('../../../domain/file/FileService', () => ({
        FileService: jest.fn().mockImplementation(() => fileServiceImpl),
      }));
    }
    return (await import('./index')).handler as (
      e: APIGatewayProxyEvent,
      c: Context,
      cb: Callback<APIGatewayProxyResult>
    ) => Promise<APIGatewayProxyResult>;
  };

  const makeEvent = (overrides?: Partial<APIGatewayProxyEvent>) =>
    ({
      body: JSON.stringify({
        fileType: 'image/png',
        lessonId: `lesson#${uuidv4()}`,
        ...(overrides?.body as any),
      }),
      queryStringParameters: {
        ...(overrides?.queryStringParameters as any),
      },
      requestContext: {
        authorizer: { claims: { sub: '123456' } },
        ...(overrides?.requestContext as any),
      },
    }) as unknown as APIGatewayProxyEvent;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should return 200 with presigned URL', async () => {
    const handler = await loadHandler(undefined, {
      getUserUploadUrl: jest.fn().mockResolvedValue({ success: true, data: { url: 'https://example.com', headers: { 'content-type': 'image/png' } } }),
    } as any);
    const response = (await handler(
      makeEvent(),
      {} as Context,
      {} as Callback<APIGatewayProxyResult>
    )) as APIGatewayProxyResult;
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify({ url: 'https://example.com', headers: { 'content-type': 'image/png' } }));
  });

  it('should return 400 for invalid fileType', async () => {
    const handler = await loadHandler();
    const badEvent = makeEvent({ body: { fileType: 'invalid/type' } as any });
    const response = (await handler(
      badEvent,
      {} as Context,
      {} as Callback<APIGatewayProxyResult>
    )) as APIGatewayProxyResult;
    expect(response.statusCode).toBe(400);
  });

  it('should return 500 if userId is missing', async () => {
    const handler = await loadHandler();
    const eventMissingUser = makeEvent({ requestContext: { authorizer: {} } as any });
    const response = (await handler(
      eventMissingUser,
      {} as Context,
      {} as Callback<APIGatewayProxyResult>
    )) as APIGatewayProxyResult;
    expect(response.statusCode).toBe(500);
  });

  it('should return 500 if UPLOAD_BUCKET_NAME is not set', async () => {
    const handler = await loadHandler({ UPLOAD_BUCKET_NAME: undefined });
    const response = (await handler(
      makeEvent(),
      {} as Context,
      {} as Callback<APIGatewayProxyResult>
    )) as APIGatewayProxyResult;
    expect(response.statusCode).toBe(500);
  });

  it('should return 400 for invalid lesson ID validation error', async () => {
    const validationError: Result<string> = {
      success: false,
      error: {
        code: 'INVALID_LESSON_ID' as const,
        message: 'Invalid lesson ID format',
        details: { expected: 'lesson#uuid', received: 'invalid-id' },
      },
    };

    const handler = await loadHandler(undefined, {
      getUserUploadUrl: jest.fn().mockResolvedValue(validationError),
    } as any);

    const response = (await handler(
      makeEvent(),
      {} as Context,
      {} as Callback<APIGatewayProxyResult>
    )) as APIGatewayProxyResult;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toMatchObject({
      message: 'Invalid lesson ID format',
      details: { expected: 'lesson#uuid', received: 'invalid-id' },
    });
  });

  it('should return 400 for invalid user ID validation error', async () => {
    const validationError: Result<{ url: string; headers: Record<string, string> }> = {
      success: false,
      error: {
        code: 'INVALID_USER_ID' as const,
        message: 'Invalid user ID format',
        details: { expected: 'user#id', received: 'invalid-user' },
      },
    };

    const handler = await loadHandler(undefined, {
      getUserUploadUrl: jest.fn().mockResolvedValue(validationError),
    } as any);

    const response = (await handler(
      makeEvent(),
      {} as Context,
      {} as Callback<APIGatewayProxyResult>
    )) as APIGatewayProxyResult;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toMatchObject({
      message: 'Invalid user ID format',
      details: { expected: 'user#id', received: 'invalid-user' },
    });
  });
});
