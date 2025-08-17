import { S3ClientWrapper } from '../../../infrastructure/S3Client';
import { FileService } from '../../../domain/file/FileService';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { SQSHandler, SQSEvent } from 'aws-lambda';
import { S3Client } from '@aws-sdk/client-s3';
import { getConfig } from '../../helpers/config';

const config = getConfig();
const s3 = new S3ClientWrapper(new S3Client({ region: config.REGION }));
const fileService = new FileService(s3);
const stepFunctions = new SFNClient({ region: config.REGION });

export const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const eventBridgeEvent = JSON.parse(record.body);
    const bucket = eventBridgeEvent.detail.bucket.name;
    const rawKey = eventBridgeEvent.detail.object.key;
    const key = decodeURIComponent(rawKey);

    console.log(`Processing file ${key} from bucket ${bucket}`);

    return;

    // if (!config.STEP_FUNCTION_ARN) throw new Error('STEP_FUNCTION_ARN is not set');

    // if (!key.endsWith('metadata.json')) continue;

    // const metadataResult = await fileService.getMetadata(bucket, key);
    // if (!metadataResult.success) {
    //   console.error('Failed to get metadata:', metadataResult.error);
    //   throw new Error('Failed to get metadata');
    // }

    // const metadata = metadataResult.data;
    // const allPresentResult = await fileService.areAllFilesUploaded(bucket, metadata);

    // if (!allPresentResult.success) {
    //   console.error('Failed to check if all files are uploaded:', allPresentResult.error);
    //   throw new Error('Failed to check if all files are uploaded');
    // }

    // const allPresent = allPresentResult.data;

    // if (!allPresent) throw new Error('Some files missing, retrying...');

    // await stepFunctions.send(
    //   new StartExecutionCommand({
    //     stateMachineArn: config.STEP_FUNCTION_ARN,
    //     input: JSON.stringify({ lessonId: metadata.lessonId, userId: metadata.userId }),
    //   })
    // );
  }
};
