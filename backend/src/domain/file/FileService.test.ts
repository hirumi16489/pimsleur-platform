import { FileService } from './FileService';
import * as config from '../../application/helpers/config';
import { v4 as uuidv4 } from 'uuid';

jest.spyOn(config, 'getConfig').mockReturnValue({ UPLOAD_BUCKET_NAME: 'test-bucket' } as any);

describe('uploadService', () => {
  it('should return a presigned URL and compose the key correctly', async () => {
    const generatePresignedUrl = jest.fn().mockResolvedValue('https://signed.url');
    const mockS3Wrapper = { generatePresignedUrl };

    const fileService = new FileService(mockS3Wrapper as any);

    // Use a fixed timestamp by mocking Date.now
    const realNow = Date.now;
    Date.now = () => 1700000000000; // deterministic timestamp

    const lessonId = `lesson#${uuidv4()}`;
    console.log(lessonId);
    const url = await fileService.getUserUploadUrl(
      'test-bucket',
      'user#123',
      lessonId,
      'image/png'
    );

    // Restore Date.now
    Date.now = realNow;

    expect(url).toBe('https://signed.url');
    expect(generatePresignedUrl).toHaveBeenCalledWith(
      'test-bucket',
      `uploads/user#123/${lessonId}/original/image/1700000000000.png`,
      'image/png',
      { userId: 'user#123' }
    );
  });

  it('getUploadMetadataUrl should compose metadata key and call provider', async () => {
    const generatePresignedUrl = jest.fn().mockResolvedValue('https://signed.meta.url');
    const mockProvider = { generatePresignedUrl } as any;
    const fileService = new FileService(mockProvider);

    const lessonId = `lesson#${uuidv4()}`;
    const url = await fileService.getUploadMetadataUrl('bucket', 'user#123', lessonId);

    expect(url).toBe('https://signed.meta.url');
    expect(generatePresignedUrl).toHaveBeenCalledWith(
      'bucket',
      `uploads/user#123/${lessonId}/metadata.json`,
      'application/json'
    );
  });

  it('getMetadata returns parsed object', async () => {
    const lessonId = `lesson#${uuidv4()}`;
    const metadataObj = { lessonId, userId: 'user#123', files: ['a', 'b'] };
    const getObjectAsString = jest.fn().mockResolvedValue(JSON.stringify(metadataObj));
    const fileService = new FileService({ getObjectAsString } as any);

    const result = await fileService.getMetadata('bucket', 'key');
    expect(result).toEqual(metadataObj);
    expect(getObjectAsString).toHaveBeenCalledWith('bucket', 'key');
  });

  it('areAllFilesUploaded returns true only when all exist', async () => {
    const doesObjectExist = jest.fn().mockResolvedValue(true);
    const fileService = new FileService({ doesObjectExist } as any);
    const lessonId = `lesson#${uuidv4()}`;
    const meta = { lessonId, userId: 'user#123', files: ['a', 'b', 'c'] } as any;

    await expect(fileService.areAllFilesUploaded('bucket', meta)).resolves.toBe(true);
    expect(doesObjectExist).toHaveBeenCalledTimes(3);

    // Now simulate one missing
    doesObjectExist
      .mockReset()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await expect(fileService.areAllFilesUploaded('bucket', meta)).resolves.toBe(false);
  });
});
