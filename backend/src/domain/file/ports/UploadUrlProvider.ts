export type Object = {
  data: string;
  metadata: Record<string, string>;
};

export interface UploadUrlProvider {
  generatePresignedUrl(
    storageName: string,
    key: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<{ url: string; headers: Record<string, string> }>;
  doesObjectExist(storageName: string, key: string): Promise<boolean>;
  getObject(storageName: string, key: string): Promise<Object>;
}
