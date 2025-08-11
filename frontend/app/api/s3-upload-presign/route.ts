import { proxyPost } from '@/lib/proxy';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = (await req.json()) as { name: string; fileType: string; lessonId: string };
  return proxyPost('/s3-upload-presign', body);
}
