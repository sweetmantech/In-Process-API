import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authMiddleware } from '@/authMiddleware';
import getEmailsHandler from '@/lib/emails/getEmailsHandler';

const EmailQuerySchema = z.object({
  artist_address: z.string().optional(),
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().min(1).max(1000).optional()),
});

export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { artistAddress: callerAddress } = authResult;

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = EmailQuerySchema.safeParse(params);
    if (!parsed.success) {
      return Response.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid query params' },
        { status: 400 }
      );
    }
    const { artist_address: artistAddress, cursor, limit } = parsed.data;

    return getEmailsHandler(callerAddress, artistAddress, cursor, limit);
  } catch (e: any) {
    const message = e?.message ?? 'Failed to fetch emails';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
