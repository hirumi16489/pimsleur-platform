import { UploadUrlProvider } from './ports/UploadUrlProvider';
import { validateLessonId, validateUserId, AppError } from './validation';
import { Result, UploadedFile, FileInfo } from './types';
import { getFileInfoFromMimeType } from '../../infrastructure/mimeTypes';

export type UploadUrl = {
  url: string;
  headers: Record<string, string>;
};

const getFilesKey = (userId: string, lessonId: string) =>
  `uploads/${getUserKey(userId)}/${lessonId}/original`;

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
    storageName: string,
    userId: string,
    lessonId: string
  ): Promise<Result<UploadUrl>> {
    const validationError = validate(userId, lessonId);
    const userKey = getUserKey(userId);
    const filesKey = getFilesKey(userId, lessonId);

    if (validationError) {
      return { success: false, error: validationError };
    }

    try {
      const presignedUrlData = await this.uploadUrlProvider.generatePresignedUrl(
        storageName,
        `uploads/${getUserKey(userId)}/${lessonId}/metadata.json`,
        'application/json',
        { userId: `${userKey}`, filesKey }
      );
      return { success: true, data: presignedUrlData };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_UPLOAD_METADATA_URL_FAILED',
          message: 'Failed to generate upload metadata URL',
          details: error,
        },
      };
    }
  }

  async getUserUploadUrl(
    storageName: string,
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
      const fileInfo = getFileInfoFromMimeType(fileType);
      if (!fileInfo) {
        return {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Invalid file type',
            details: { received: fileType },
          },
        };
      }

      const filesKey = getFilesKey(userId, lessonId);
      const time = Date.now();
      const presignedUrlData = await this.uploadUrlProvider.generatePresignedUrl(
        storageName,
        `${filesKey}/${fileInfo.fileType}/${time}.${fileInfo.extension}`,
        fileType,
        { userId: `${userKey}` }
      );
      return { success: true, data: presignedUrlData };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_USER_UPLOAD_URL_FAILED',
          message: 'Failed to generate user upload URL',
          details: error,
        },
      };
    }
  }

  async getFileInfo(bucket: string, key: string): Promise<Result<FileInfo>> {
    try {
      const object = await this.uploadUrlProvider.getObject(bucket, key);
      const objectData = JSON.parse(object.data);
      // TODO: validate objectData and object.metadata
      return {
        success: true,
        data: {
          lessonId: objectData.lessonId,
          userId: objectData.userId,
          files: objectData.files,
          metadata: object.metadata as { userId: string; filesKey: string },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_METADATA_FAILED',
          message: 'Failed to get metadata',
          details: error,
        },
      };
    }
  }

  async areAllFilesUploaded(bucket: string, fileInfo: FileInfo): Promise<Result<boolean>> {
    try {
      const checks = await Promise.all(
        fileInfo.files.map((file: UploadedFile) =>
          this.uploadUrlProvider.doesObjectExist(
            bucket,
            `${fileInfo.metadata.filesKey}/${file.name}`
          )
        )
      );
      const result = checks.every(Boolean);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CHECK_FILES_FAILED',
          message: 'Failed to check if all files are uploaded',
          details: error,
        },
      };
    }
  }
}
