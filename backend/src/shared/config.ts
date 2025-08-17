export type ConfigType = {
  UPLOAD_BUCKET_NAME?: string;
  STEP_FUNCTION_ARN?: string;
  REGION?: string;
  DEBUG?: boolean;
  EXTRACT_JOB_QUEUE_URL?: string;
};

export const config: Record<string, ConfigType> = {
  dev: {
    UPLOAD_BUCKET_NAME: process.env.UPLOAD_BUCKET,
    REGION: process.env.REGION,
    STEP_FUNCTION_ARN: process.env.STEP_FUNCTION_ARN,
    DEBUG: true,
    EXTRACT_JOB_QUEUE_URL: process.env.EXTRACT_JOB_QUEUE_URL,
  },
  prod: {
    UPLOAD_BUCKET_NAME: process.env.UPLOAD_BUCKET,
    REGION: process.env.REGION,
    STEP_FUNCTION_ARN: process.env.STEP_FUNCTION_ARN,
    DEBUG: false,
    EXTRACT_JOB_QUEUE_URL: process.env.EXTRACT_JOB_QUEUE_URL,
  },
};
