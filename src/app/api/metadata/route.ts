import fetchUri from '@/lib/arweave/fetchUri';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const uri = req.nextUrl.searchParams.get('uri');
    if (!uri) {
      return Response.json({ message: 'No URI provided' }, { status: 400 });
    }
    let response: Response;
    try {
      response = await fetchUri(uri, { cache: 'no-store' });
    } catch (e: any) {
      return Response.json(
        { message: e?.message ?? 'Invalid or unsupported URI' },
        { status: 400 }
      );
    }
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        return Response.json(data);
      }
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return Response.json(data);
      } catch {
        return Response.json(
          { message: 'URI did not return JSON' },
          { status: 400 }
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return Response.json({
          image: '',
          name: '',
          description: '',
          external_url: '',
        });
      }
      throw err;
    }
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to get metadata';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
