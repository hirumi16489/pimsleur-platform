import { UploadUrlProvider } from './ports/UploadUrlProvider';

export class FileService {
  private readonly uploadUrlProvider: UploadUrlProvider;

  constructor(uploadUrlProvider: UploadUrlProvider) {
    this.uploadUrlProvider = uploadUrlProvider;
  }

  async generateUploadUrl(userId: string, fileType: string): Promise<string> {
    return this.uploadUrlProvider.generatePresignedUrl(userId, fileType);
  }
}

