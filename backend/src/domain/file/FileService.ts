import { UploadUrlProvider } from './ports/UploadUrlProvider';
import { validateLessonId, validateUserId } from './validation';

export type MetadataFile = {
  lessonId: string;
  userId: string;
  files: string[];
};

export class FileService {
  private readonly uploadUrlProvider: UploadUrlProvider;

  constructor(uploadUrlProvider: UploadUrlProvider) {
    this.uploadUrlProvider = uploadUrlProvider;
  }

  async getUploadMetadataUrl(bucket: string, userId: string, lessonId: string): Promise<string> {
    if (!validateLessonId(lessonId)) {
      throw new Error(`Invalid lesson ID format: ${lessonId}. Expected format: lesson#uuid`);
    }
    if (!validateUserId(userId)) {
      throw new Error(`Invalid user ID format: ${userId}. Expected format: user#id`);
    }

    const key = `uploads/${userId}/${lessonId}/metadata.json`;
    return this.uploadUrlProvider.generatePresignedUrl(bucket, key, 'application/json');
  }

  async getUserUploadUrl(
    bucket: string,
    userId: string,
    lessonId: string,
    fileType: string
  ): Promise<string> {
    if (!validateLessonId(lessonId)) {
      throw new Error(`Invalid lesson ID format: ${lessonId}. Expected format: lesson#uuid`);
    }
    if (!validateUserId(userId)) {
      throw new Error(`Invalid user ID format: ${userId}. Expected format: user#id`);
    }

    const [type, ext] = fileType.split('/');
    const time = Date.now();
    const key = `uploads/${userId}/${lessonId}/original/${type}/${time}.${ext}`;
    const metadata = { userId: `${userId}` };
    return this.uploadUrlProvider.generatePresignedUrl(bucket, key, fileType, metadata);
  }

  async getMetadata(bucket: string, key: string): Promise<MetadataFile> {
    const content = await this.uploadUrlProvider.getObjectAsString(bucket, key);
    return JSON.parse(content);
  }

  async areAllFilesUploaded(bucket: string, metadata: MetadataFile): Promise<boolean> {
    const checks = await Promise.all(
      metadata.files.map((file: string) => this.uploadUrlProvider.doesObjectExist(bucket, file))
    );
    return checks.every(Boolean);
  }
}
