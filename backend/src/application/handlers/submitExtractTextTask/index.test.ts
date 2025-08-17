import { APIGatewayProxyEvent } from 'aws-lambda';

// Mock the dependencies before importing the handler
jest.mock('@aws-sdk/client-sfn', () => {
  const mockSendCommand = jest.fn().mockResolvedValue({});

  return {
    SFNClient: jest.fn(() => ({
      send: mockSendCommand,
    })),
    StartExecutionCommand: jest.fn().mockImplementation((params) => {
      return { input: params };
    }),
  };
});

jest.mock('../../helpers/config', () => ({
  getConfig: jest.fn(() => ({
    REGION: 'ap-northeast-1',
    STEP_FUNCTION_ARN:
      'arn:aws:states:ap-northeast-1:123456789012:stateMachine:extract-text-state-machine',
  })),
}));

describe('submitExtractTextTask', () => {
  let mockSend: jest.Mock;
  let mockStartExecutionCommand: jest.Mock;

  beforeEach(() => {
    // Clear module cache to ensure fresh imports
    jest.resetModules();

    // Get references to the mocked functions from the jest mock
    const { SFNClient, StartExecutionCommand } = jest.requireMock('@aws-sdk/client-sfn');
    mockSend = SFNClient().send;
    mockStartExecutionCommand = StartExecutionCommand;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should start step function execution with correct parameters', async () => {
    const event = {
      body: JSON.stringify({
        lessonId: 'lesson-123',
        userId: 'user-456',
      }),
    };

    // Import and call the handler
    const { handler } = await import('./index');
    const result = await handler(event as APIGatewayProxyEvent);

    // Check that the handler returns success
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ message: 'Task submitted successfully' });

    // Verify that StartExecutionCommand was called with correct parameters
    expect(mockStartExecutionCommand).toHaveBeenCalledWith({
      stateMachineArn:
        'arn:aws:states:ap-northeast-1:123456789012:stateMachine:extract-text-state-machine',
      input: JSON.stringify({ lessonId: 'lesson-123', userId: 'user-456' }),
    });

    // Verify that send was called
    expect(mockSend).toHaveBeenCalled();
  });

  it('should return 400 error when lessonId is missing', async () => {
    const invalidEvent = {
      body: JSON.stringify({
        userId: 'user-456',
        // missing lessonId
      }),
    };

    const { handler } = await import('./index');
    const result = await handler(invalidEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ message: 'lessonId and userId are required' });

    // Verify that StartExecutionCommand was not called
    expect(mockStartExecutionCommand).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 400 error when userId is missing', async () => {
    const invalidEvent = {
      body: JSON.stringify({
        lessonId: 'lesson-123',
        // missing userId
      }),
    };

    const { handler } = await import('./index');
    const result = await handler(invalidEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ message: 'lessonId and userId are required' });

    // Verify that StartExecutionCommand was not called
    expect(mockStartExecutionCommand).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 400 error when body is empty', async () => {
    const invalidEvent = {
      body: JSON.stringify({}),
    };

    const { handler } = await import('./index');
    const result = await handler(invalidEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ message: 'lessonId and userId are required' });

    // Verify that StartExecutionCommand was not called
    expect(mockStartExecutionCommand).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 500 error when STEP_FUNCTION_ARN is not set', async () => {
    // Mock config to return undefined STEP_FUNCTION_ARN
    const mockGetConfig = jest.requireMock('../../helpers/config').getConfig;
    mockGetConfig.mockReturnValueOnce({
      REGION: 'ap-northeast-1',
      STEP_FUNCTION_ARN: undefined,
    });

    const event = {
      body: JSON.stringify({
        lessonId: 'lesson-123',
        userId: 'user-456',
      }),
    };

    const { handler } = await import('./index');
    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ message: 'STEP_FUNCTION_ARN is not set' });

    // Verify that StartExecutionCommand was not called
    expect(mockStartExecutionCommand).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 500 error when step function execution fails', async () => {
    // Mock send to throw an error
    mockSend.mockRejectedValueOnce(new Error('Step function error'));

    const event = {
      body: JSON.stringify({
        lessonId: 'lesson-123',
        userId: 'user-456',
      }),
    };

    const { handler } = await import('./index');
    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ message: 'Failed to submit task' });

    // Verify that StartExecutionCommand was called
    expect(mockStartExecutionCommand).toHaveBeenCalledWith({
      stateMachineArn:
        'arn:aws:states:ap-northeast-1:123456789012:stateMachine:extract-text-state-machine',
      input: JSON.stringify({ lessonId: 'lesson-123', userId: 'user-456' }),
    });
  });
});
