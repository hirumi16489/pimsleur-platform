import { FileService } from './FileService';
import * as config from '../../application/helpers/config';
import { v4 as uuidv4 } from 'uuid';
import { Result } from './types';

jest.spyOn(config, 'getConfig').mockReturnValue({ UPLOAD_BUCKET_NAME: 'test-bucket' } as any);

describe('uploadService', () => {
  it('getUserUploadUrl should compose key and call provider', async () => {
    const generatePresignedUrl = jest
      .fn()
      .mockResolvedValue({ url: 'https://signed.url', headers: { 'content-type': 'image/png' } });
    const mockS3Wrapper = { generatePresignedUrl };

    const fileService = new FileService(mockS3Wrapper as any);

    // Use a fixed timestamp by mocking Date.now
    const realNow = Date.now;
    Date.now = () => 1700000000000; // deterministic timestamp

    const lessonId = `lesson#${uuidv4()}`;
    const userId = uuidv4();
    const result = await fileService.getUserUploadUrl('test-bucket', userId, lessonId, 'image/png');

    // Restore Date.now
    Date.now = realNow;

    expect(result.success).toBe(true);
    expect((result as any).data.url).toBe('https://signed.url');
    expect((result as any).data.headers).toEqual({ 'content-type': 'image/png' });
    expect(generatePresignedUrl).toHaveBeenCalledWith(
      'test-bucket',
      `uploads/user#${userId}/${lessonId}/original/image/1700000000000.png`,
      'image/png',
      { userId: `user#${userId}` }
    );
  });

  it('getUploadMetadataUrl should compose metadata key and call provider', async () => {
    const generatePresignedUrl = jest.fn().mockResolvedValue({
      url: 'https://signed.meta.url',
      headers: { 'content-type': 'application/json' },
    });
    const mockProvider = { generatePresignedUrl } as any;
    const fileService = new FileService(mockProvider);

    const lessonId = `lesson#${uuidv4()}`;
    const userId = uuidv4();
    const result: Result<{ url: string; headers: Record<string, string> }> =
      await fileService.getUploadMetadataUrl('bucket', userId, lessonId);

    expect(result.success).toBe(true);
    expect((result as any).data.url).toBe('https://signed.meta.url');
    expect(generatePresignedUrl).toHaveBeenCalledWith(
      'bucket',
      `uploads/user#${userId}/${lessonId}/metadata.json`,
      'application/json',
      { userId: `user#${userId}`, filesKey: `uploads/user#${userId}/${lessonId}/original` }
    );
  });

  it('getFileInfo returns parsed object', async () => {
    const lessonId = `lesson#${uuidv4()}`;
    const userId = uuidv4();
    const metadataObj = { lessonId, userId: `user#${userId}`, files: ['a', 'b'] };
    const getObject = jest.fn().mockResolvedValue({
      data: JSON.stringify(metadataObj),
      metadata: { userId: `user#${userId}`, filesKey: 'uploads/user#123/lesson#456' },
    });
    const fileService = new FileService({ getObject } as any);

    const result = await fileService.getFileInfo('bucket', 'key');
    expect(result.success).toBe(true);
    expect((result as any).data).toEqual({
      lessonId,
      userId: `user#${userId}`,
      files: ['a', 'b'],
      metadata: { userId: `user#${userId}`, filesKey: 'uploads/user#123/lesson#456' },
    });
    expect(getObject).toHaveBeenCalledWith('bucket', 'key');
  });

  it('areAllFilesUploaded returns true only when all exist', async () => {
    const doesObjectExist = jest.fn().mockResolvedValue(true);
    const fileService = new FileService({ doesObjectExist } as any);
    const lessonId = `lesson#${uuidv4()}`;
    const userId = uuidv4();
    const meta = {
      lessonId,
      userId: `user#${userId}`,
      files: ['a', 'b', 'c'],
      metadata: { userId: `user#${userId}`, filesKey: 'uploads/user#123/lesson#456' },
    } as any;

    const result1 = await fileService.areAllFilesUploaded('bucket', meta);
    expect(result1.success).toBe(true);
    expect((result1 as any).data).toBe(true);
    expect(doesObjectExist).toHaveBeenCalledTimes(3);

    // Now simulate one missing
    doesObjectExist
      .mockReset()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const result2 = await fileService.areAllFilesUploaded('bucket', meta);
    expect(result2.success).toBe(true);
    expect((result2 as any).data).toBe(false);
  });

  it('should return validation error for invalid lesson ID', async () => {
    const generatePresignedUrl = jest
      .fn()
      .mockResolvedValue({ url: 'https://signed.url', headers: { 'content-type': 'image/png' } });
    const mockS3Wrapper = { generatePresignedUrl };
    const fileService = new FileService(mockS3Wrapper as any);

    const result = await fileService.getUserUploadUrl(
      'test-bucket',
      uuidv4(),
      'invalid-lesson-id',
      'image/png'
    );

    expect(result.success).toBe(false);
    expect((result as any).error.code).toBe('INVALID_LESSON_ID');
    expect((result as any).error.message).toBeDefined();
    expect(generatePresignedUrl).not.toHaveBeenCalled();
  });

  it('should return validation error for invalid user ID', async () => {
    const generatePresignedUrl = jest
      .fn()
      .mockResolvedValue({ url: 'https://signed.url', headers: { 'content-type': 'image/png' } });
    const mockS3Wrapper = { generatePresignedUrl };
    const fileService = new FileService(mockS3Wrapper as any);

    const result = await fileService.getUserUploadUrl(
      'test-bucket',
      'invalid-user-id',
      `lesson#${uuidv4()}`,
      'image/png'
    );

    expect(result.success).toBe(false);
    expect((result as any).error.code).toBe('INVALID_USER_ID');
    expect((result as any).error.message).toBeDefined();
    expect(generatePresignedUrl).not.toHaveBeenCalled();
  });

  it('should validate proper UUIDs correctly', async () => {
    const generatePresignedUrl = jest
      .fn()
      .mockResolvedValue({ url: 'https://signed.url', headers: { 'content-type': 'image/png' } });
    const mockS3Wrapper = { generatePresignedUrl };
    const fileService = new FileService(mockS3Wrapper as any);

    // Valid UUIDs that should pass
    const validUUIDs = [
      '123e4567-e89b-12d3-a456-426614174000',
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    ];

    for (const uuid of validUUIDs) {
      const lessonId = `lesson#${uuid}`;
      const userId = uuidv4();

      const result = await fileService.getUserUploadUrl(
        'test-bucket',
        userId,
        lessonId,
        'image/png'
      );

      expect(result.success).toBe(true);
      expect((result as any).data.url).toBe('https://signed.url');
      expect((result as any).data.headers).toEqual({ 'content-type': 'image/png' });
    }

    expect(generatePresignedUrl).toHaveBeenCalledTimes(validUUIDs.length);
  });

  it('should reject UUID-like strings that are not real UUIDs', async () => {
    const generatePresignedUrl = jest
      .fn()
      .mockResolvedValue({ url: 'https://signed.url', headers: { 'content-type': 'image/png' } });
    const mockS3Wrapper = { generatePresignedUrl };
    const fileService = new FileService(mockS3Wrapper as any);

    // Invalid UUID-like strings that should fail
    const invalidUUIDs = [
      '123e4567-e89b-12d3-a456-42661417400', // Too short
      '123e4567-e89b-12d3-a456-42661417400g', // Invalid character 'g'
      '123e4567-e89b-12d3-a456-42661417400 ', // Trailing space
    ];

    for (const invalidUUID of invalidUUIDs) {
      const lessonId = `lesson#${invalidUUID}`;
      const userId = uuidv4();

      const result = await fileService.getUserUploadUrl(
        'test-bucket',
        userId,
        lessonId,
        'image/png'
      );

      expect(result.success).toBe(false);
      expect((result as any).error.code).toBe('INVALID_LESSON_ID');
      expect((result as any).error.message).toBeDefined();
    }

    // Should not call generatePresignedUrl for any invalid UUIDs
    expect(generatePresignedUrl).not.toHaveBeenCalled();
  });

  it('should return validation error for invalid lesson ID in metadata URL', async () => {
    const generatePresignedUrl = jest.fn().mockResolvedValue({
      url: 'https://signed.meta.url',
      headers: { 'content-type': 'application/json' },
    });
    const mockProvider = { generatePresignedUrl } as any;
    const fileService = new FileService(mockProvider);

    const result = await fileService.getUploadMetadataUrl('bucket', uuidv4(), 'invalid-lesson-id');

    expect(result.success).toBe(false);
    expect((result as any).error.code).toBe('INVALID_LESSON_ID');
    expect((result as any).error.message).toBeDefined();
    expect(generatePresignedUrl).not.toHaveBeenCalled();
  });
});
