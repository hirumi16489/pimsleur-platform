import { S3ClientWrapper } from "../../src/infrastructure/S3Client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

jest.mock("@aws-sdk/s3-request-presigner");

describe("s3Client", () => {
  beforeEach(() => {
    process.env.UPLOAD_BUCKET_NAME = "test-bucket";
  });

  it("should call getSignedUrl with correct params", async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue("https://mocked.url");

    const url = await S3ClientWrapper.generatePresignedUrl("123", "image/png");
    expect(getSignedUrl).toHaveBeenCalled();
    expect(url).toBe("https://mocked.url");
  });
});
