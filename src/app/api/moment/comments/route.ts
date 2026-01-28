import { NextRequest } from 'next/server';
import { commentsSchema } from '@/lib/schema/commentsSchema';
import { momentComments } from '@/lib/moment/momentComments';
import { Address } from 'viem';
import { validate } from '@/lib/schema/validate';

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

    return Response.json(result);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to get comments';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
