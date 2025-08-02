import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
jest.mock("@aws-sdk/s3-request-presigner");
jest.mock("@aws-sdk/client-s3");
import { S3ClientWrapper } from "../infrastructure/S3Client";

const REGION = "test-region";
const s3 = new S3Client({ region: REGION });

describe("S3ClientWrapper", () => {
  it("should call getSignedUrl with correct params", async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue("https://mocked.url");

    const s3ClientWrapper = new S3ClientWrapper({
      UPLOAD_BUCKET_NAME: "test-bucket",
      REGION,
      DEBUG: false,
    }, s3);

    const url = await s3ClientWrapper.generatePresignedUrl("123", "image/png");

    expect(getSignedUrl).toHaveBeenCalled();
    expect(url).toBe("https://mocked.url");
  });

  it("should throw an error if UPLOAD_BUCKET_NAME is not set", () => {
    expect(() => {
      new S3ClientWrapper({
        UPLOAD_BUCKET_NAME: undefined,
        REGION,
        DEBUG: false,
      }, s3);
    }).toThrow("UPLOAD_BUCKET_NAME is not set");
  });
});