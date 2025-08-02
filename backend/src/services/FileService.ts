import { S3ClientWrapper } from '../infrastructure/S3Client';

export class FileService {
  private readonly S3ClientWrapper: S3ClientWrapper;

  constructor(s3ClientWrapper: S3ClientWrapper) {
    this.S3ClientWrapper = s3ClientWrapper;
  }

  async generateUploadUrl(userId: string, fileType: string): Promise<string> {
    return this.S3ClientWrapper.generatePresignedUrl(userId, fileType);
  }
}

