export interface UploadUrlProvider {
  generatePresignedUrl(userId: string, fileType: string): Promise<string>;
}