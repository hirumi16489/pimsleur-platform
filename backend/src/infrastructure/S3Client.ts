import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ConfigType } from '../helpers/config';

export class S3ClientWrapper {
  private readonly s3Client: S3Client;
  private readonly config: ConfigType;

  constructor(config: ConfigType, s3Client: S3Client) {
    if (!config.UPLOAD_BUCKET_NAME) throw new Error("UPLOAD_BUCKET_NAME is not set");

    this.config = config;
    this.s3Client = s3Client;
  }

  async generatePresignedUrl(userId: string, fileType: string): Promise<string> {
    const [type, ext] = fileType.split('/');
    const time = Date.now();

    const command = new PutObjectCommand({
      Bucket: this.config.UPLOAD_BUCKET_NAME,
      Key: `uploads/${userId}/${type}/${time}.${ext}`,
      ContentType: fileType,
      Metadata: { userId: `${userId}` }
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
