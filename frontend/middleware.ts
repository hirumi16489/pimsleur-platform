import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  const protect = p.startsWith('/upload') || p.startsWith('/status') || p.startsWith('/account');
  if (protect) {
    const access = req.cookies.get('__Host-access')?.value ?? req.cookies.get('access')?.value;
    if (!access) {
      const to = new URL('/api/auth/login', req.url);
      to.searchParams.set('returnTo', p + req.nextUrl.search);
      return NextResponse.redirect(to);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/upload', '/status', '/account'] };
