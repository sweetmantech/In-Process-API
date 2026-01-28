import { NextRequest } from 'next/server';
import { getAirdropsSchema } from '@/lib/schema/getAirdropsSchema';
import { getAirdrops } from '@/lib/airdrop/getAirdrops';
import { validate } from '@/lib/schema/validate';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      artist_address: searchParams.get('artist_address'),
      chainId: searchParams.get('chainId'),
      offset: searchParams.get('offset'),
    };

    const validationResult = validate(getAirdropsSchema, queryParams);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const result = await getAirdrops(validationResult.data);
    return Response.json(result);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to get airdrops';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
