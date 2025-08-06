export type ConfigType = {
  UPLOAD_BUCKET_NAME?: string;
  REGION?: string;
  DEBUG?: boolean;
  EXTRACT_JOB_QUEUE?: string;
}

export const config: Record<string, ConfigType> = {
  dev: { UPLOAD_BUCKET_NAME: 'pimsleur-platform-user-uploads', REGION: 'ap-northeast-1', DEBUG: true, EXTRACT_JOB_QUEUE: 'https://sqs.ap-northeast-1.amazonaws.com/123456789012/extract-job-queue' },
  prod: { UPLOAD_BUCKET_NAME: 'prod-pimsleur-platform-user-uploads', REGION: 'ap-northeast-1', DEBUG: false, EXTRACT_JOB_QUEUE: 'https://sqs.ap-northeast-1.amazonaws.com/123456789012/extract-job-queue' }
}