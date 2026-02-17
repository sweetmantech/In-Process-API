import { NextRequest } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import getEmailsHandler from '@/lib/emails/getEmailsHandler';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { artistAddress: callerAddress } = authResult;

    const artistAddress =
      req.nextUrl.searchParams.get('artist_address') || undefined;
    const cursor = req.nextUrl.searchParams.get('cursor') || undefined;
    const limitParam = req.nextUrl.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    return getEmailsHandler(callerAddress, artistAddress, cursor, limit);
  } catch (e: any) {
    const message = e?.message ?? 'Failed to fetch emails';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
