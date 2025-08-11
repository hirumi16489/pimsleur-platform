import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, Callback } from 'aws-lambda';
import { FileService } from '../../domain/file/FileService';
import { v4 as uuidv4 } from 'uuid';

// Default mock at module scope; can be overridden with jest.doMock when needed
jest.mock('../../domain/file/FileService');

describe('uploadMetadataPresignHandler', () => {
  const defaultConfig = { REGION: 'ap-northeast-1', UPLOAD_BUCKET_NAME: 'test-bucket' };

  const loadHandler = async (
    configOverride?: Partial<typeof defaultConfig>,
    fileServiceImpl?: Partial<FileService>
  ) => {
    const cfg = { ...defaultConfig, ...configOverride };
    jest.doMock('../helpers/config', () => ({ getConfig: () => cfg }));
    if (fileServiceImpl) {
      jest.doMock('../../domain/file/FileService', () => ({
        FileService: jest.fn().mockImplementation(() => fileServiceImpl),
      }));
    }
    return (await import('./uploadMetadataPresignUrl')).handler as (
      e: APIGatewayProxyEvent,
      c: Context,
      cb: Callback<APIGatewayProxyResult>
    ) => Promise<APIGatewayProxyResult>;
  };

  const makeEvent = (overrides?: Partial<APIGatewayProxyEvent>) =>
    ({
      body: JSON.stringify({ lessonId: `lesson#${uuidv4()}`, ...(overrides?.body as any) }),
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
      getUploadMetadataUrl: jest.fn().mockResolvedValue('https://example.com/meta'),
    } as any);
    const response = (await handler(
      makeEvent(),
      {} as Context,
      {} as Callback<APIGatewayProxyResult>
    )) as APIGatewayProxyResult;
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('https://example.com/meta');
  });

  it('should return 400 when lessonId is missing', async () => {
    const handler = await loadHandler();
    const badEvent = makeEvent({ body: { lessonId: undefined } as any });
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
});
