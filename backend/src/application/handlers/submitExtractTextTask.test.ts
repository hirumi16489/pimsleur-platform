// Create mock instances that will be used
const mockSqsClient = {
  send: jest.fn().mockResolvedValue({}),
};

const mockDynamoClient = {};
const mockRepo = {};

// Mock the dependencies before importing the handler
jest.mock('@aws-sdk/client-sqs', () => {
  const mockSendMessageCommand = jest.fn().mockImplementation((params) => {
    return { input: params };
  });

  return {
    SQSClient: jest.fn(() => mockSqsClient),
    SendMessageCommand: mockSendMessageCommand,
  };
});
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(() => mockDynamoClient),
}));
jest.mock('../../infrastructure/dynamodb/LessonProcessingRepository', () => ({
  DynamoLessonProcessingRepository: jest.fn(() => mockRepo),
}));
jest.mock('../../domain/lessonProcessing/stepWrapper', () => ({
  createStepWrapper: jest.fn(() => {
    return (_: string, handler: any) => {
      // Return a wrapped function that calls the original handler directly
      return async (event: any) => {
        // For testing, we'll just call the handler directly without the wrapper logic
        return await handler(event);
      };
    };
  }),
}));
jest.mock('../helpers/config', () => ({
  getConfig: jest.fn(() => ({
    REGION: 'ap-northeast-1',
    EXTRACT_JOB_QUEUE_URL:
      'https://sqs.ap-northeast-1.amazonaws.com/123456789012/extract-job-queue',
  })),
}));

describe('submitExtractTextTask', () => {
  beforeEach(() => {
    // Clear module cache to ensure fresh imports
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send message to SQS with correct parameters', async () => {
    const event = {
      lessonId: 'lesson-123',
      userId: 'user-456',
      taskToken: 'task-token-789',
    };

    // Import and call the handler
    const { handler } = await import('./submitExtractTextTask');
    await handler(event);

    // Check that send was called
    expect(mockSqsClient.send).toHaveBeenCalledTimes(1);

    // Get the actual call arguments to verify the parameters
    const sendCallArgs = mockSqsClient.send.mock.calls[0][0];
    expect(sendCallArgs.input).toEqual({
      QueueUrl: 'https://sqs.ap-northeast-1.amazonaws.com/123456789012/extract-job-queue',
      MessageBody: JSON.stringify({
        lessonId: 'lesson-123',
        userId: 'user-456',
        taskToken: 'task-token-789',
      }),
    });
  });

  it('should throw error when event is missing required fields', async () => {
    const invalidEvent = {
      lessonId: 'lesson-123',
      // missing userId and taskToken
    };

    const { handler } = await import('./submitExtractTextTask');
    await expect(handler(invalidEvent as any)).rejects.toThrow(
      'Missing lessonId, userId, or taskToken'
    );
  });

  it('should throw error when event is null', async () => {
    const { handler } = await import('./submitExtractTextTask');
    await expect(handler(null as any)).rejects.toThrow('Missing lessonId, userId, or taskToken');
  });
});
