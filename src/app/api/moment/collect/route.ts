import { NextRequest } from 'next/server';
import { collectSchema } from '@/lib/schema/collectSchema';
import { collectMoment } from '@/lib/moment/collectMoment';
import { authMiddleware } from '@/authMiddleware';
import { Address } from 'viem';
import { validate } from '@/lib/schema/validate';

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { artistAddress } = authResult;
    const body = await req.json();
    const validationResult = validate(collectSchema, body);
    if (!validationResult.success) {
      return validationResult.response;
    }
    const data = validationResult.data;
    const result = await collectMoment({
      ...data,
      artistAddress: artistAddress as Address,
    });
    return Response.json(result);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to create moment';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
