import { cookies } from 'next/headers';

function upstream(path: string) {
  return (process.env.API_BASE || '').replace(/\/$/, '') + path;
}

export async function proxyPost(path: string, body: any) {
  const jar = cookies();
  const id = jar.get('__Host-id')?.value ?? jar.get('id')?.value;
  if (!id) return new Response('Unauthorized', { status: 401 })
  const response = await fetch(upstream(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${id}` },
    body: JSON.stringify(body),
  });
  return new Response(await response.text(), {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') || 'application/json' },
  });
}
