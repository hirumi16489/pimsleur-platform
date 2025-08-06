import { handler } from "./upload";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, Callback } from "aws-lambda";
import { FileService } from "../../domain/fileUpload/FileService";

jest.mock("../../domain/fileUpload/FileService");

describe("uploadPresignHandler", () => {
  const mockEvent = {
    queryStringParameters: { fileType: "image/png" },
    requestContext: {
      authorizer: { claims: { sub: "123456" } }
    }
  } as unknown as APIGatewayProxyEvent;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return 200 with presigned URL", async () => {
    (FileService.prototype.generateUploadUrl as jest.Mock).mockResolvedValue("https://example.com");

    const response = await handler(mockEvent, {} as Context, {} as Callback<APIGatewayProxyResult>) as APIGatewayProxyResult;

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("https://example.com");
  });

  it("should return 400 for invalid fileType", async () => {
    const badEvent = { ...mockEvent, queryStringParameters: { fileType: "invalid/type" } };
    const response = await handler(badEvent, {} as Context, {} as Callback<APIGatewayProxyResult>) as APIGatewayProxyResult;
    expect(response.statusCode).toBe(400);
  });

  it("should return 500 if userId is missing", async () => {
    const eventMissingUser = {
      ...mockEvent,
      requestContext: { authorizer: {} }
    };
    const response = await handler(eventMissingUser as APIGatewayProxyEvent, {} as Context, {} as Callback<APIGatewayProxyResult>) as APIGatewayProxyResult;
    expect(response.statusCode).toBe(500);
  });
});