import { DynamoLessonProcessingRepository } from "./LessonProcessingRepository";
import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { LessonProcessingStatus } from "layer-config";
// @ts-ignore
import sinon from "sinon";

// Mock the AWS SDK modules
jest.mock("@aws-sdk/util-dynamodb", () => ({
  marshall: jest.fn(),
  unmarshall: jest.fn(),
}));

jest.mock("layer-config", () => ({
  LessonProcessingStatus: {
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
  },
  LessonProcessingSchema: {
    parse: jest.fn((data) => data),
  },
}));

describe("DynamoLessonProcessingRepository", () => {
  let repository: DynamoLessonProcessingRepository;
  let mockDynamoClient: sinon.SinonStubbedInstance<DynamoDBClient>;
  let mockMarshall: jest.MockedFunction<any>;
  let mockUnmarshall: jest.MockedFunction<any>;

  beforeEach(() => {
    // Create a stubbed DynamoDB client
    mockDynamoClient = sinon.createStubInstance(DynamoDBClient);

    // Get the mocked functions
    const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
    mockMarshall = marshall;
    mockUnmarshall = unmarshall;

    repository = new DynamoLessonProcessingRepository("test-table", mockDynamoClient);
  });

  afterEach(() => {
    sinon.restore();
    jest.clearAllMocks();
  });

  it("should mark step as in progress", async () => {
    mockMarshall.mockReturnValue({ marshalledItem: true });
    mockDynamoClient.send.resolves({});

    await repository.markInProgress("user-123", "lesson-456", "test-step");

    sinon.assert.calledWith(mockDynamoClient.send, sinon.match({
      input: {
        TableName: "test-table",
        Item: { marshalledItem: true }
      }
    }));
  });

  it("should mark step as completed", async () => {
    mockMarshall.mockReturnValue({ marshalledItem: true });
    mockDynamoClient.send.resolves({});

    await repository.markCompleted("user-123", "lesson-456", "test-step");

    sinon.assert.calledWith(mockDynamoClient.send, sinon.match({
      input: {
        TableName: "test-table",
        UpdateExpression: "SET #s = :s, lastUpdated = :lu",
        ExpressionAttributeNames: { "#s": "status" }
      }
    }));
  });

  it("should mark step as failed with error", async () => {
    mockMarshall.mockReturnValue({ marshalledItem: true });
    mockDynamoClient.send.resolves({});

    await repository.markFailed("user-123", "lesson-456", "test-step", "Test error");

    sinon.assert.calledWith(mockDynamoClient.send, sinon.match({
      input: {
        TableName: "test-table",
        UpdateExpression: "SET #s = :s, error = :e, lastUpdated = :lu",
        ExpressionAttributeNames: { "#s": "status" }
      }
    }));
  });

  it("should get status and return null when item not found", async () => {
    mockMarshall.mockReturnValue({ marshalledKey: true });
    mockDynamoClient.send.resolves({ Item: undefined });

    const result = await repository.getStatus("user-123", "lesson-456", "test-step");

    expect(result).toBeNull();
    sinon.assert.calledWith(mockDynamoClient.send, sinon.match({
      input: {
        TableName: "test-table",
        Key: { marshalledKey: true }
      }
    }));
  });

  it("should get status and return status when item found", async () => {
    mockMarshall.mockReturnValue({ marshalledKey: true });
    mockUnmarshall.mockReturnValue({ status: LessonProcessingStatus.COMPLETED });
    mockDynamoClient.send.resolves({ Item: { someItem: true } });

    const result = await repository.getStatus("user-123", "lesson-456", "test-step");

    expect(result).toBe(LessonProcessingStatus.COMPLETED);
    expect(mockUnmarshall).toHaveBeenCalledWith({ someItem: true });
  });
}); 