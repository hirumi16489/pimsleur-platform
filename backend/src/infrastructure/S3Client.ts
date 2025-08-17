import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3ClientWrapper {
  private readonly s3Client: S3Client;

  constructor(s3Client: S3Client) {
    this.s3Client = s3Client;
  }

  async generatePresignedUrl(
    bucket: string,
    key: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<{ url: string; headers: Record<string, string> }> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ...(metadata ? { Metadata: metadata } : {}),
    });

    return {
      url: await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
        signableHeaders: new Set(['content-type']),
      }),
      headers: {
        'content-type': contentType,
      },
    };
  }

  async doesObjectExist(bucket: string, key: string): Promise<boolean> {
    try {
      await this.s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return true;
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) return false;
      throw err;
    }
  }

  async getObjectAsString(bucket: string, key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await this.s3Client.send(command);
    return (await response.Body?.transformToString()) || '';
  }
}
