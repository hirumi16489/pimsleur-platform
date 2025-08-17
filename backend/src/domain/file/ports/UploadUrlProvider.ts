export interface UploadUrlProvider {
  generatePresignedUrl(
    bucket: string,
    key: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<{ url: string; headers: Record<string, string> }>;
  doesObjectExist(bucket: string, key: string): Promise<boolean>;
  getObjectAsString(bucket: string, key: string): Promise<string>;
}
