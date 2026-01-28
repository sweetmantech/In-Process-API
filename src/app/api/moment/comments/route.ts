import { NextRequest } from 'next/server';
import getCorsHeader from '@/lib/getCorsHeader';
import { commentsSchema } from '@/lib/schema/commentsSchema';
import { momentComments } from '@/lib/moment/momentComments';
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      moment: {
        collectionAddress: searchParams.get('collectionAddress') as Address,
        tokenId: searchParams.get('tokenId') || '1',
        chainId: Number(searchParams.get('chainId')),
      },
      offset: Number(searchParams.get('offset')) || 0,
    };

    const validationResult = validate(commentsSchema, queryParams);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const result = await momentComments(validationResult.data);

    return Response.json(result, { headers: corsHeaders });
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to get comments';
    return Response.json({ message }, { status: 500, headers: corsHeaders });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
