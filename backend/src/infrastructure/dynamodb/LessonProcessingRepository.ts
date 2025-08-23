import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { LessonProcessingRepository } from '../../domain/lessonProcessing/ports/LessonProcessingRepository';
import { LessonProcessingSchema, LessonProcessingStatus } from '../../shared';

export class DynamoLessonProcessingRepository implements LessonProcessingRepository {
  constructor(
    private tableName: string,
    private dynamo: DynamoDBClient
  ) {}

  async createLessonProcessing(userId: string, lessonId: string, step: string): Promise<void> {
    const item = {
      userId,
      lessonId,
      step,
      status: LessonProcessingStatus.IN_PROGRESS,
      lastUpdated: new Date().toISOString(),
    };
    const parsedItem = LessonProcessingSchema.parse(item);

    await this.dynamo.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(parsedItem),
      })
    );
  }

  async markInProgress(userId: string, lessonId: string, step: string): Promise<void> {
    const item = {
      userId,
      lessonId,
      step,
      status: LessonProcessingStatus.IN_PROGRESS,
      lastUpdated: new Date().toISOString(),
    };
    const parsedItem = LessonProcessingSchema.parse(item);

    await this.dynamo.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(parsedItem),
      })
    );
  }

  async markCompleted(userId: string, lessonId: string, step: string): Promise<void> {
    await this.updateStatus(userId, lessonId, step, LessonProcessingStatus.COMPLETED);
  }

  async markFailed(userId: string, lessonId: string, step: string, error: string): Promise<void> {
    await this.updateStatus(userId, lessonId, step, LessonProcessingStatus.FAILED, error);
  }

  async getStatus(
    userId: string,
    lessonId: string,
    step: string
  ): Promise<LessonProcessingStatus | null> {
    const parsedKeys = LessonProcessingSchema.parse({ userId, lessonId, step });
    const result = await this.dynamo.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: marshall(parsedKeys),
      })
    );
    if (!result.Item) return null;
    const item = unmarshall(result.Item);
    return item.status as LessonProcessingStatus;
  }

  private async updateStatus(
    userId: string,
    lessonId: string,
    step: string,
    status: LessonProcessingStatus,
    error?: string
  ) {
    const updateExp = error
      ? 'SET #s = :s, error = :e, lastUpdated = :lu'
      : 'SET #s = :s, lastUpdated = :lu';

    const expValues = error
      ? { ':s': status, ':e': error, ':lu': new Date().toISOString() }
      : { ':s': status, ':lu': new Date().toISOString() };

    const parsedItem = LessonProcessingSchema.parse({ userId, lessonId, step, status, error });

    await this.dynamo.send(
      new UpdateItemCommand({
        TableName: this.tableName,
        Key: marshall(parsedItem),
        UpdateExpression: updateExp,
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: marshall(expValues),
      })
    );
  }
}
