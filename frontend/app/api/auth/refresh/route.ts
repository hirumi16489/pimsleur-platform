import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const m = /(?:^|;\s*)(?:__Host-refresh|refresh)=([^;]+)/.exec(cookie);
  if (!m) return new Response('No refresh', { status: 401 });
  const refresh = decodeURIComponent(m[1]);

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.COGNITO_CLIENT_ID!,
    refresh_token: refresh,
  });
  const tr = await fetch(process.env.COGNITO_DOMAIN! + '/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!tr.ok) return new Response('Refresh failed', { status: 401 });
  const d = (await tr.json()) as any;

  const referer = req.headers.get('referer') || '';
  const isHttps = referer.startsWith('https://');
  const accessName = isHttps ? '__Host-access' : 'access';

  const res = new NextResponse(null, { status: 204 });
  const exp = Math.min(900, Number(d.expires_in || 900));
  res.cookies.set(accessName, d.access_token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/api',
    maxAge: exp,
  });
  return res;
}
