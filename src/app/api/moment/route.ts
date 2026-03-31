import { NextRequest, NextResponse } from 'next/server';
import normalizeMetadata from '@/lib/metadata/normalizeMetadata';
import getMetadata from '@/lib/moment/getMetadata';
import getMomentAdmins from '@/lib/moment/getMomentAdmins';
import { resolveMomentInfo } from '@/lib/moment/resolveMomentInfo';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import { momentSchema } from '@/lib/schema/momentSchema';
import { validate } from '@/lib/schema/validate';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      collectionAddress: searchParams.get('collectionAddress'),
      tokenId: searchParams.get('tokenId'),
      chainId: searchParams.get('chainId'),
    };

    const validationResult = validate(momentSchema, queryParams);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const moment = validationResult.data;

    const { data: collections } = await selectCollections({
      moments: [moment],
    });

    const collection = collections?.[0] ?? null;

    const { uri, owner, saleConfig, id } = await resolveMomentInfo(moment);

    if (!uri) {
      return NextResponse.json(
        {
          error: 'Invalid moment URI provided',
        },
        { status: 404 }
      );
    }

    const [metadata, momentAdmins] = await Promise.all([
      getMetadata(id, uri),
      getMomentAdmins({ collection, owner, moment }),
    ]);

    return NextResponse.json({
      id,
      uri,
      owner,
      saleConfig,
      protocol: collection?.protocol ?? null,
      momentAdmins,
      metadata: metadata ? await normalizeMetadata(metadata) : null,
    });
  } catch (error: any) {
    console.error('Error fetching moment info:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch moment info' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
