import { NextRequest } from 'next/server';

const ARWEAVE_BASE = 'https://arweave.net';

const handler = async (req: NextRequest) => {
  const path = req.nextUrl.pathname.replace('/api/arweave/', '');
  const res = await fetch(`${ARWEAVE_BASE}/${path}`, {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
    body: req.method === 'POST' ? await req.text() : undefined,
  });
  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'text/plain',
    },
  });
};

export const GET = handler;
export const POST = handler;
