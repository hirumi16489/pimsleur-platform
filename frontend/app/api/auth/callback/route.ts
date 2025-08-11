import { getOrigin } from '@/lib/helpers';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const jar = cookies();
  const savedState = jar.get('oauth_state')?.value;
  const verifier = jar.get('pkce_verifier')?.value;
  const returnTo = jar.get('return_to')?.value || '/';
  const redirectUri = jar.get('redirect_uri')?.value; // same as used at /authorize

  if (!code || !state || !verifier || !redirectUri || state !== savedState) {
    return new Response('Invalid auth state', { status: 400 });
  }

  const tokenRes = await fetch(`${process.env.COGNITO_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.COGNITO_CLIENT_ID!,
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });

  if (!tokenRes.ok) return new Response('Token exchange failed', { status: 401 });
  const tokens = await tokenRes.json();

  const origin = getOrigin();
  const resp = NextResponse.redirect(new URL(returnTo, origin));
  console.log(new URL(redirectUri).protocol);
  const isHttps = new URL(redirectUri).protocol === 'https:';
  const accessName = isHttps ? '__Host-access' : 'access';
  const idName = isHttps ? '__Host-id' : 'id';
  const refreshName = isHttps ? '__Host-refresh' : 'refresh';

  const exp = Math.min(900, Number(tokens.expires_in || 900));
  resp.cookies.set(accessName, tokens.access_token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: exp,
  });
  resp.cookies.set(idName, tokens.id_token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: exp,
  });
  if (tokens.refresh_token) {
    resp.cookies.set(refreshName, tokens.refresh_token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  // Clear temp cookies
  for (const n of ['pkce_verifier', 'oauth_state', 'return_to', 'redirect_uri']) {
    resp.cookies.set(n, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }
  return resp;
}
