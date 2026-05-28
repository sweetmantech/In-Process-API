import { NextResponse } from 'next/server';
import type { Address } from 'viem';
import type { z } from 'zod';
import hideMomentSchema from '@/lib/schema/hideMomentSchema';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import selectAdmins from '@/lib/supabase/in_process_admins/selectAdmins';
import upsertAdmins from '@/lib/supabase/in_process_admins/upsertAdmins';

type HideMomentHandlerInput = z.infer<typeof hideMomentSchema> & {
  primaryWallet: Address;
};

const hideMomentHandler = async ({
  primaryWallet,
  moment,
}: HideMomentHandlerInput) => {
  const { data: collectionList, error: collectionsError } =
    await selectCollections({
      addresses: [moment.collectionAddress],
      chainId: moment.chainId,
    });
  const collection = collectionList?.[0] ?? null;

  if (collectionsError) {
    return NextResponse.json(
      { success: false, message: collectionsError.message },
      { status: 500 }
    );
  }

  if (!collection) {
    return NextResponse.json(
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
    artist_address: primaryWallet,
  });

  const admin =
    admins.find((row) => row.token_id === Number(moment.tokenId)) || admins[0];

  if (!admin) {
    return NextResponse.json(
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

  return NextResponse.json({ success: true });
};

export default hideMomentHandler;
