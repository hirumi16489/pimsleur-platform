import { UploadUrlProvider } from './ports/UploadUrlProvider';
import { v4 as uuidv4, v7 as uuidv7, validate as uuidValidate } from 'uuid';

export type MetadataFile = {
  lessonId: string;
  userId: string;
  files: string[];
}

export class FileService {
  private readonly uploadUrlProvider: UploadUrlProvider;

  constructor(uploadUrlProvider: UploadUrlProvider) {
    this.uploadUrlProvider = uploadUrlProvider;
  }

  async getUploadMetadataUrl(bucket: string, userId: string, lessonId: string): Promise<string> {
    const key = `uploads/${userId}/${lessonId}/metadata.json`;
    return this.uploadUrlProvider.generatePresignedUrl(bucket, key, 'application/json');
  }

  async getUserUploadUrl(bucket: string, userId: string, fileType: string): Promise<string> {
    const [type, ext] = fileType.split('/');
    const time = Date.now();
    const key = `uploads/${userId}/lesson#${uuidv7()}/original/${type}/${time}.${ext}`;
    const metadata = { userId: `${userId}` };
    return this.uploadUrlProvider.generatePresignedUrl(bucket, key, fileType, metadata);
  }

  async getMetadata(bucket: string, key: string): Promise<MetadataFile> {
    const content = await this.uploadUrlProvider.getObjectAsString(bucket, key);
    return JSON.parse(content);
  }

  async areAllFilesUploaded(bucket: string, metadata: MetadataFile): Promise<boolean> {
    const checks = await Promise.all(
      metadata.files.map((file: string) =>
        this.uploadUrlProvider.doesObjectExist(bucket, file)
      )
    );
    return checks.every(Boolean);
  }
}

