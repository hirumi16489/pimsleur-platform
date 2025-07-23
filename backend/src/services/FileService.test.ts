import { FileService } from "../../src/services/FileService";
import * as s3Client from "../../src/infrastructure/S3Client";

jest.mock("../../src/infrastructure/S3Client");

describe("uploadService", () => {
  it("should return a presigned URL", async () => {
    (s3Client.S3ClientWrapper.generatePresignedUrl as jest.Mock).mockResolvedValue("https://signed.url");
    const url = await FileService.generateUploadUrl("123", "image/png");
    expect(url).toBe("https://signed.url");
  });
});
