import { PresignRequest } from '@/app/upload/page';
import { proxyPost } from '@/lib/proxy';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = (await req.json()) as PresignRequest;
  return proxyPost('/s3-upload-presign', body);
}
