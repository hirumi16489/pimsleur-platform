import { FileService } from "./FileService";
import * as config from "../../application/helpers/config";

jest.spyOn(config, 'getConfig').mockReturnValue({ UPLOAD_BUCKET_NAME: 'test-bucket' } as any);

describe("uploadService", () => {
  it("should return a presigned URL and compose the key correctly", async () => {
    const generatePresignedUrl = jest.fn().mockResolvedValue("https://signed.url");
    const mockS3Wrapper = { generatePresignedUrl };

    const fileService = new FileService(mockS3Wrapper as any);

    // Use a fixed timestamp by mocking Date.now
    const realNow = Date.now;
    Date.now = () => 1700000000000; // deterministic timestamp

    const url = await fileService.getUserUploadUrl("test-bucket", "123", "image/png");

    // Restore Date.now
    Date.now = realNow;

    expect(url).toBe("https://signed.url");
    expect(generatePresignedUrl).toHaveBeenCalledWith(
      "test-bucket",
      "uploads/123/image/1700000000000.png",
      "image/png",
      { userId: "123" }
    );
  });
});
