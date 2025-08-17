import { NextResponse } from 'next/server';
import { getOrigin } from '@/lib/helpers';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const origin = getOrigin();
  const isHttps = origin.startsWith('https://');
  const accessName = isHttps ? '__Host-access' : 'access';
  const idName = isHttps ? '__Host-id' : 'id';
  const refreshName = isHttps ? '__Host-refresh' : 'refresh';

  const res = new NextResponse(null, { status: 302 });
  res.cookies.set(accessName, '', {
    path: '/',
    maxAge: 0,
    secure: isHttps,
    httpOnly: true,
    sameSite: 'lax',
  });
  res.cookies.set(idName, '', {
    path: '/',
    maxAge: 0,
    secure: isHttps,
    httpOnly: true,
    sameSite: 'lax',
  });
  res.cookies.set(refreshName, '', {
    path: '/api/auth',
    maxAge: 0,
    secure: isHttps,
    httpOnly: true,
    sameSite: 'lax',
  });

  const logout = new URL(process.env.COGNITO_DOMAIN! + '/logout');
  logout.searchParams.set('client_id', process.env.COGNITO_CLIENT_ID!);
  logout.searchParams.set('logout_uri', origin + '/');
  res.headers.set('Location', logout.toString());
  return res;
}
