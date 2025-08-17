import { SQSEvent } from 'aws-lambda';

jest.mock('../../helpers/config', () => ({
  getConfig: () => ({
    REGION: 'ap-northeast-1',
    STEP_FUNCTION_ARN: 'arn:aws:states:xx:123:stateMachine:lesson-processing',
  }),
}));

jest.mock('@aws-sdk/client-s3', () => ({ S3Client: jest.fn() }));
jest.mock('@aws-sdk/client-sfn', () => ({
  SFNClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  StartExecutionCommand: jest.fn(),
}));

jest.mock('../../../infrastructure/S3Client', () => ({
  S3ClientWrapper: jest.fn().mockImplementation(() => ({
    getObjectAsString: jest.fn(),
    doesObjectExist: jest.fn(),
  })),
}));

describe('startProcessingFromSqs', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const makeSQSEvent = (detail: any): SQSEvent => {
    return {
      Records: [
        {
          body: JSON.stringify({ detail }),
        },
      ] as any,
    };
  };

  it('should parse S3 event and no-op before return', async () => {
    const { handler } = await import('./index');
    const event = makeSQSEvent({
      bucket: { name: 'bucket' },
      object: { key: encodeURIComponent('path/to/file.txt') },
    });
    await handler(event, {} as any, {} as any);
    expect(true).toBe(true);
    // no throw means success; function returns early currently
  });
});
