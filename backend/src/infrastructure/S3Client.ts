import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.REGION;
const UPLOAD_BUCKET_NAME = process.env.UPLOAD_BUCKET_NAME;
const s3 = new S3Client({ region: REGION });

export class S3ClientWrapper {
  static async generatePresignedUrl(userId: string, fileType: string): Promise<string> {
    const [type, ext] = fileType.split('/');
    const time = Date.now();

    const command = new PutObjectCommand({
      Bucket: UPLOAD_BUCKET_NAME,
      Key: `uploads/${userId}/${type}/${time}.${ext}`,
      ContentType: fileType,
      Metadata: { userId: `${userId}` }
    });

    return getSignedUrl(s3, command, { expiresIn: 3600 });
  }
}
