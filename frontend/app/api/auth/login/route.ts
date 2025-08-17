import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getOrigin } from '@/lib/helpers';

const b64url = (b: Buffer) =>
  b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = getOrigin();
  const redirectUri = origin + '/api/auth/callback';

  // PKCE
  const verifier = b64url(crypto.randomBytes(32));
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());

  const returnTo = url.searchParams.get('returnTo') || '/';
  const state = b64url(Buffer.from(JSON.stringify({ t: Date.now(), returnTo })));

  const auth = new URL(`${process.env.COGNITO_DOMAIN}/oauth2/authorize`);
  auth.searchParams.set('response_type', 'code');
  auth.searchParams.set('client_id', process.env.COGNITO_CLIENT_ID!);
  auth.searchParams.set('redirect_uri', redirectUri); // URLSearchParams encodes it
  auth.searchParams.set('scope', 'openid email profile');
  auth.searchParams.set('state', state);
  auth.searchParams.set('code_challenge_method', 'S256');
  auth.searchParams.set('code_challenge', challenge);

  // HttpOnly cookies so callback can read them securely
  const jar = cookies();
  const opts = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/api/auth',
    maxAge: 300,
  };
  jar.set('pkce_verifier', verifier, opts);
  jar.set('oauth_state', state, opts);
  jar.set('return_to', returnTo, opts);
  jar.set('redirect_uri', redirectUri, opts);

  return NextResponse.redirect(auth.toString(), { status: 302 });
}
