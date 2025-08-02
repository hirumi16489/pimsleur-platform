export type ConfigType = {
  UPLOAD_BUCKET_NAME?: string;
  REGION?: string;
  DEBUG?: boolean;
}

const config: Record<string, ConfigType> = {
  dev: { UPLOAD_BUCKET_NAME: 'pimsleur-platform-user-uploads', REGION: 'ap-northeast-1', DEBUG: true },
  prod: { UPLOAD_BUCKET_NAME: 'prod-pimsleur-platform-user-uploads', REGION: 'ap-northeast-1', DEBUG: false }
}

export default config;