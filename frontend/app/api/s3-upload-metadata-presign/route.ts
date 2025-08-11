import { proxyPost } from '@/lib/proxy';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = (await req.json()) as { lessonId: string; metadata: unknown };
  return proxyPost('/s3-upload-metadata-presign', body);
}
