import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { getConfig } from '../helpers/config';
import { createStepWrapper } from '../../domain/lessonProcessing/stepWrapper';
import { DynamoLessonProcessingRepository } from '../../infrastructure/dynamodb/LessonProcessingRepository';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

const config = getConfig();
const dynamo = new DynamoDBClient({ region: config.REGION });
const repo = new DynamoLessonProcessingRepository('lesson-processing-steps', dynamo);
const sqs = new SQSClient({ region: config.REGION });

const stepWrapper = createStepWrapper(repo);

export const handler = stepWrapper(
  'extract_text',
  async (event: { lessonId: string; userId: string; taskToken: string }) => {
    console.log('[ExtractText] Received event:', JSON.stringify(event));

    // pre-checks
    if (!event || !event.lessonId || !event.userId || !event.taskToken) {
      throw new Error('Missing lessonId, userId, or taskToken');
    }

    await sqs.send(
      new SendMessageCommand({
        QueueUrl: config.EXTRACT_JOB_QUEUE_URL,
        MessageBody: JSON.stringify({
          lessonId: event.lessonId,
          userId: event.userId,
          taskToken: event.taskToken,
        }),
      })
    );
  },
  { asyncTask: true }
);
