import { cookies } from 'next/headers';

function upstream(path: string) {
  return (process.env.API_BASE || '').replace(/\/$/, '') + path;
}

export async function proxyPost(path: string, body: any) {
  const jar = cookies();
  const access = jar.get('__Host-access')?.value ?? jar.get('access')?.value;
  const id = jar.get('__Host-id')?.value ?? jar.get('id')?.value;
  //if (!access) return new Response('Unauthorized', { status: 401 })
  console.log(upstream(path));
  console.log(JSON.stringify(body));
  console.log({ 'Content-Type': 'application/json', Authorization: `Bearer ${access}` });
  const r = await fetch(upstream(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${id}` },
    body: JSON.stringify(body),
  });
  console.log(r);
  return new Response(await r.text(), {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
  });
}
