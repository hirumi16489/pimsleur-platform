import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const access = cookie.match(/(?:^|;\s*)(?:__Host-access|access)=([^;]+)/)?.[1];

  if (!access) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Optionally verify the token with Cognito
  try {
    const response = await fetch(`${process.env.COGNITO_DOMAIN}/oauth2/userInfo`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });

    if (!response.ok) {
      return new Response('Unauthorized', { status: 401 });
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }
}
