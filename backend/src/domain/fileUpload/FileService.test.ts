import { FileService } from "./FileService";

describe("uploadService", () => {
  it("should return a presigned URL", async () => {
    const mockS3Wrapper = {
      generatePresignedUrl: jest.fn().mockResolvedValue("https://signed.url")
    };

    const fileService = new FileService(mockS3Wrapper as any)
    const url = await fileService.generateUploadUrl("123", "image/png");
    expect(url).toBe("https://signed.url");
  });
});
