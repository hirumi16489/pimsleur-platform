import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('@aws-sdk/client-s3');
import { S3ClientWrapper } from '../infrastructure/S3Client';

const REGION = 'test-region';
const s3 = new S3Client({ region: REGION });

describe('S3ClientWrapper', () => {
  it('should call getSignedUrl with correct params', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('https://mocked.url');

    const s3ClientWrapper = new S3ClientWrapper(s3);

    const url = await s3ClientWrapper.generatePresignedUrl(
      'test-bucket',
      'uploads/123/image/111.png',
      'image/png',
      { userId: '123' }
    );

    expect(getSignedUrl).toHaveBeenCalled();
    expect(url.url).toBe('https://mocked.url');
    expect(url.headers).toEqual({ 'content-type': 'image/png' });
  });

  it('doesObjectExist returns true on 200, false on 404', async () => {
    (s3 as any).send = jest.fn();
    (s3.send as jest.Mock).mockResolvedValueOnce({});
    const wrapper = new S3ClientWrapper(s3 as any);
    await expect(wrapper.doesObjectExist('b', 'k')).resolves.toBe(true);
    (s3.send as jest.Mock).mockRejectedValueOnce({
      name: 'NotFound',
      $metadata: { httpStatusCode: 404 },
    });
    await expect(wrapper.doesObjectExist('b', 'k')).resolves.toBe(false);
  });

  it('getObject returns object with data and metadata', async () => {
    (s3 as any).send = jest.fn();
    (s3.send as jest.Mock).mockResolvedValueOnce({
      Body: { transformToString: () => Promise.resolve('content') },
      Metadata: { userId: '123' },
    });
    const wrapper = new S3ClientWrapper(s3 as any);
    const result = await wrapper.getObject('b', 'k');
    expect(result.data).toBe('content');
    expect(result.metadata).toEqual({ userId: '123' });
  });
});
