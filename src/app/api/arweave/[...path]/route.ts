import { NextRequest } from 'next/server';

const ARWEAVE_BASE = 'https://ar-io.net';

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);

const handler = async (req: NextRequest) => {
  const path = req.nextUrl.pathname.replace('/api/arweave/', '');
  const url = `${ARWEAVE_BASE}/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  const contentType = req.headers.get('Content-Type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
      body: METHODS_WITH_BODY.has(req.method) ? await req.text() : undefined,
    });
    return new Response(res.body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'text/plain',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error?.message || 'Failed to fetch from Arweave',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET = handler;
export const POST = handler;

export const dynamic = 'force-dynamic';
