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

    const s3ClientWrapper = new S3ClientWrapper(s3);

    const url = await s3ClientWrapper.generatePresignedUrl("test-bucket", "uploads/123/image/111.png", "image/png", { userId: "123" });

    expect(getSignedUrl).toHaveBeenCalled();
    expect(url).toBe("https://mocked.url");
  });

});