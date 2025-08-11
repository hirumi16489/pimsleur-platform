import { DynamoLessonProcessingRepository } from './LessonProcessingRepository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { LessonProcessingStatus } from '../../shared';

// Mock the AWS SDK modules
jest.mock('@aws-sdk/util-dynamodb', () => ({
  marshall: jest.fn(),
  unmarshall: jest.fn(),
}));

jest.mock('../../shared', () => ({
  LessonProcessingStatus: {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
  },
  LessonProcessingSchema: {
    parse: jest.fn((data) => data),
  },
}));

describe('DynamoLessonProcessingRepository', () => {
  let repository: DynamoLessonProcessingRepository;
  let mockDynamoClient: { send: jest.Mock };
  let mockMarshall: jest.MockedFunction<any>;
  let mockUnmarshall: jest.MockedFunction<any>;

  beforeEach(async () => {
    // Create a minimal mocked DynamoDB client
    mockDynamoClient = { send: jest.fn() };

    // Get the mocked functions
    const { marshall, unmarshall } = await import('@aws-sdk/util-dynamodb');
    mockMarshall = marshall;
    mockUnmarshall = unmarshall;

    repository = new DynamoLessonProcessingRepository(
      'test-table',
      mockDynamoClient as unknown as DynamoDBClient
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should mark step as in progress', async () => {
    mockMarshall.mockReturnValue({ marshalledItem: true });
    mockDynamoClient.send.mockResolvedValue({});

    await repository.markInProgress('user-123', 'lesson-456', 'test-step');

    expect(mockDynamoClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: 'test-table',
          Item: { marshalledItem: true },
        }),
      })
    );
  });

  it('should mark step as completed', async () => {
    mockMarshall.mockReturnValue({ marshalledItem: true });
    mockDynamoClient.send.mockResolvedValue({});

    await repository.markCompleted('user-123', 'lesson-456', 'test-step');

    expect(mockDynamoClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: 'test-table',
          UpdateExpression: 'SET #s = :s, lastUpdated = :lu',
          ExpressionAttributeNames: { '#s': 'status' },
        }),
      })
    );
  });

  it('should mark step as failed with error', async () => {
    mockMarshall.mockReturnValue({ marshalledItem: true });
    mockDynamoClient.send.mockResolvedValue({});

    await repository.markFailed('user-123', 'lesson-456', 'test-step', 'Test error');

    expect(mockDynamoClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: 'test-table',
          UpdateExpression: 'SET #s = :s, error = :e, lastUpdated = :lu',
          ExpressionAttributeNames: { '#s': 'status' },
        }),
      })
    );
  });

  it('should get status and return null when item not found', async () => {
    mockMarshall.mockReturnValue({ marshalledKey: true });
    mockDynamoClient.send.mockResolvedValue({ Item: undefined });

    const result = await repository.getStatus('user-123', 'lesson-456', 'test-step');

    expect(result).toBeNull();
    expect(mockDynamoClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: 'test-table',
          Key: { marshalledKey: true },
        }),
      })
    );
  });

  it('should get status and return status when item found', async () => {
    mockMarshall.mockReturnValue({ marshalledKey: true });
    mockUnmarshall.mockReturnValue({ status: LessonProcessingStatus.COMPLETED });
    mockDynamoClient.send.mockResolvedValue({ Item: { someItem: true } });

    const result = await repository.getStatus('user-123', 'lesson-456', 'test-step');

    expect(result).toBe(LessonProcessingStatus.COMPLETED);
    expect(mockUnmarshall).toHaveBeenCalledWith({ someItem: true });
  });
});
