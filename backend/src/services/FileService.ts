import { S3ClientWrapper } from '../infrastructure/S3Client';

export class FileService {
  static async generateUploadUrl(userId: string, fileType: string): Promise<string> {
    return S3ClientWrapper.generatePresignedUrl(userId, fileType);
  }
}

