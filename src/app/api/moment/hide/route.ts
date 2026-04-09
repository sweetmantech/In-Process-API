import { NextRequest } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import selectAdmins from '@/lib/supabase/in_process_admins/selectAdmins';
import upsertAdmins from '@/lib/supabase/in_process_admins/upsertAdmins';
import { momentSchema } from '@/lib/schema/momentSchema';
import { validate } from '@/lib/schema/validate';

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { artistAddress } = authResult;

    const body = await req.json();
    const validationResult = validate(momentSchema, body.moment);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const moment = validationResult.data;

    const { data: collections, error: collectionsError } =
      await selectCollections({
        collections: [
          { address: moment.collectionAddress, chainId: moment.chainId },
        ],
      });

    if (collectionsError) {
      return Response.json(
        { success: false, message: collectionsError.message },
        { status: 500 }
      );
    }

    const collection = collections[0];
    if (!collection) {
      return Response.json(
        { success: false, message: 'Collection not found' },
        { status: 404 }
      );
    }

    const admins = await selectAdmins({
      moments: [
        {
          collectionId: collection.id,
          token_id: Number(moment.tokenId),
        },
      ],
      artist_address: artistAddress,
    });

    const admin =
      admins.find((admin) => admin.token_id === Number(moment.tokenId)) ||
      admins[0];

    if (!admin) {
      return Response.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      );
    }

    await upsertAdmins({
      admins: [
        {
          collection: collection.id,
          token_id: Number(moment.tokenId),
          hidden: !admin.hidden,
          artist_address: admin.artist_address,
          granted_at: admin.granted_at,
        },
      ],
    });

    return Response.json({
      success: true,
    });
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to hide tokens';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
