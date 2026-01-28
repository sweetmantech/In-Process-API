import { NextRequest } from 'next/server';
import getCorsHeader from '@/lib/getCorsHeader';
import { collectSchema } from '@/lib/schema/collectSchema';
import { collectMoment } from '@/lib/moment/collectMoment';
import { authMiddleware } from '@/authMiddleware';
import { Address } from 'viem';
import { validate } from '@/lib/schema/validate';

// CORS headers for allowing cross-origin requests
const corsHeaders = getCorsHeader();

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req, { corsHeaders });
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
    return Response.json(result, { headers: corsHeaders });
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to create moment';
    return Response.json({ message }, { status: 500, headers: corsHeaders });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
