import { UploadUrlProvider } from './ports/UploadUrlProvider';
import { validateLessonId, validateUserId, AppError } from './validation';
import { Result, MetadataFile } from './types';

export type UploadUrl = {
  url: string;
  headers: Record<string, string>;
};

const validate = (userId: string, lessonId: string): AppError | null => {
  const lessonIdError = validateLessonId(lessonId);
  if (lessonIdError) {
    return lessonIdError;
  }

  const userIdError = validateUserId(userId);
  if (userIdError) {
    return userIdError;
  }

  return null;
};

const getUserKey = (userId: string) => {
  return `user#${userId}`;
};

export class FileService {
  private readonly uploadUrlProvider: UploadUrlProvider;

  constructor(uploadUrlProvider: UploadUrlProvider) {
    this.uploadUrlProvider = uploadUrlProvider;
  }

  async getUploadMetadataUrl(
    bucket: string,
    userId: string,
    lessonId: string
  ): Promise<Result<UploadUrl>> {
    const validationError = validate(userId, lessonId);
    const userKey = getUserKey(userId);

    if (validationError) {
      return { success: false, error: validationError };
    }

    try {
      const presignedUrlData = await this.uploadUrlProvider.generatePresignedUrl(
        bucket,
        `uploads/${userKey}/${lessonId}/metadata.json`,
        'application/json'
      );
      return { success: true, data: presignedUrlData };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INVALID_LESSON_ID',
          message: 'Failed to generate upload metadata URL',
          details: error,
        },
      };
    }
  }

  async getUserUploadUrl(
    bucket: string,
    userId: string,
    lessonId: string,
    fileType: string
  ): Promise<Result<UploadUrl>> {
    const validationError = validate(userId, lessonId);
    const userKey = getUserKey(userId);

    if (validationError) {
      return { success: false, error: validationError };
    }

    try {
      const [type, ext] = fileType.split('/');
      const time = Date.now();
      const presignedUrlData = await this.uploadUrlProvider.generatePresignedUrl(
        bucket,
        `uploads/${userKey}/${lessonId}/original/${type}/${time}.${ext}`,
        fileType,
        { userId: `${userKey}` }
      );
      return { success: true, data: presignedUrlData };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INVALID_LESSON_ID',
          message: 'Failed to generate user upload URL',
          details: error,
        },
      };
    }
  }

  async getMetadata(bucket: string, key: string): Promise<Result<MetadataFile>> {
    try {
      const content = await this.uploadUrlProvider.getObjectAsString(bucket, key);
      const metadata = JSON.parse(content);
      return { success: true, data: metadata };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INVALID_LESSON_ID',
          message: 'Failed to get metadata',
          details: error,
        },
      };
    }
  }

  async areAllFilesUploaded(bucket: string, metadata: MetadataFile): Promise<Result<boolean>> {
    try {
      const checks = await Promise.all(
        metadata.files.map((file: string) => this.uploadUrlProvider.doesObjectExist(bucket, file))
      );
      const result = checks.every(Boolean);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INVALID_LESSON_ID',
          message: 'Failed to check if all files are uploaded',
          details: error,
        },
      };
    }
  }
}
