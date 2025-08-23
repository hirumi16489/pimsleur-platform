import { S3ClientWrapper } from '../../../infrastructure/S3Client';
import { FileService } from '../../../domain/file/FileService';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { SQSHandler, SQSEvent } from 'aws-lambda';
import { S3Client } from '@aws-sdk/client-s3';
import { getConfig } from '../../helpers/config';
import { LessonProcessingService } from '../../../domain/lessonProcessing/LessonProcessingService';
import { DynamoLessonProcessingRepository } from '../../../infrastructure/dynamodb/LessonProcessingRepository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const config = getConfig();
const s3 = new S3ClientWrapper(new S3Client({ region: config.REGION }));
const fileService = new FileService(s3);
const stepFunctions = new SFNClient({ region: config.REGION });

// Create DynamoDB client and repository directly
const dynamoClient = new DynamoDBClient({ region: config.REGION });
const lessonProcessingRepository = new DynamoLessonProcessingRepository(
  process.env.LESSON_PROCESSING_TABLE || 'LessonProcessingSteps',
  dynamoClient
);
const lessonProcessingService = new LessonProcessingService(lessonProcessingRepository);

export const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const eventBridgeEvent = JSON.parse(record.body);
      console.log('eventBridgeEvent', eventBridgeEvent);
      const bucket = eventBridgeEvent.detail.bucket.name;
      const rawKey = eventBridgeEvent.detail.object.key;
      const key = decodeURIComponent(rawKey);

      console.log(`Processing file ${key} from bucket ${bucket}`);

      // Only process metadata.json files
      if (!key.endsWith('metadata.json')) {
        console.log(`Skipping non-metadata file: ${key}`);
        continue;
      }

      if (!config.STEP_FUNCTION_ARN) {
        throw new Error('STEP_FUNCTION_ARN is not set');
      }

      // Get metadata from the uploaded file
      const fileInfoResult = await fileService.getFileInfo(bucket, key);
      if (!fileInfoResult.success) {
        console.error('Failed to get file info:', fileInfoResult.error);
        throw new Error('Failed to get file info');
      }

      const fileInfo = fileInfoResult.data;
      console.log(`Processing lesson ${fileInfo.lessonId} for user ${fileInfo.userId}`);

      // Check if all required files are uploaded
      const allPresentResult = await fileService.areAllFilesUploaded(bucket, fileInfo);
      if (!allPresentResult.success) {
        console.error('Failed to check if all files are uploaded:', allPresentResult.error);
        throw new Error('Failed to check if all files are uploaded');
      }

      const allPresent = allPresentResult.data;
      if (!allPresent) {
        console.log('Some files missing, retrying...');
        throw new Error('Some files missing, retrying...');
      }

      // Create lesson processing entry in DynamoDB
      const processingResult = await lessonProcessingService.createLessonProcessing({
        userId: fileInfo.userId,
        lessonId: fileInfo.lessonId,
        step: 'upload-complete',
      });

      if (!processingResult.success) {
        console.error('Failed to create lesson processing entry:', processingResult.error);
        throw new Error('Failed to create lesson processing entry');
      }

      console.log(`Created lesson processing entry: ${JSON.stringify(processingResult.data)}`);

      // Start the step function execution
      await stepFunctions.send(
        new StartExecutionCommand({
          stateMachineArn: config.STEP_FUNCTION_ARN,
          input: JSON.stringify({
            lessonId: fileInfo.lessonId,
            userId: fileInfo.userId,
            processingId: `${fileInfo.lessonId}-${fileInfo.userId}-upload-complete`,
          }),
        })
      );

      console.log(`Started step function execution for lesson ${fileInfo.lessonId}`);
    } catch (error) {
      console.error('Error processing SQS message:', error);
      // In a production environment, you might want to send to a DLQ or retry
      throw error;
    }
  }
};
