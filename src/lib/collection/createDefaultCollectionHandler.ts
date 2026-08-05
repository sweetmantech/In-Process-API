import { NextResponse } from 'next/server';
import { getAddress, type Address } from 'viem';
import { z } from 'zod';
import { PROCESS_COLLECTION_NAME, PROCESS_COLLECTION_URI } from '@/lib/consts';
import { createCollectionSchema } from '@/lib/schema/createCollectionSchema';
import { createCollection } from '@/lib/collection/createCollection';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import { upsertCollections } from '@/lib/supabase/in_process_collections/upsertCollections';
import { ensureWallets } from '@/lib/wallets/ensureWallets';
import { withProcessCollectionCreateLock } from '@/lib/collection/withProcessCollectionCreateLock';
import getProcessCollectionItem from '@/lib/collection/getProcessCollectionItem';

type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

const createDefaultCollectionHandler = async (
  input: CreateCollectionInput
): Promise<NextResponse> => {
  return withProcessCollectionCreateLock(
    input.account as Address,
    input.chainId,
    async () => {
      const existingCollections = await selectCollections({
        artist: input.account,
        uri: PROCESS_COLLECTION_URI,
        chainId: input.chainId,
        limit: 1,
      });
      if (existingCollections.length > 0) {
        const collection = await getProcessCollectionItem({
          address: existingCollections[0].address,
          chainId: input.chainId,
        });
        return NextResponse.json(collection);
      }

      const result = await createCollection(input);
      const artist = getAddress(input.account).toLowerCase();
      const address = getAddress(result.contractAddress).toLowerCase();
      const timestamp = new Date().toISOString();

      await ensureWallets([artist]);
      await upsertCollections([
        {
          address,
          chain_id: result.chainId,
          creator: artist,
          protocol: 'in_process',
          uri: PROCESS_COLLECTION_URI,
          name: PROCESS_COLLECTION_NAME,
          created_at: timestamp,
          updated_at: timestamp,
        },
      ]);

      const collection = await getProcessCollectionItem({
        address,
        chainId: result.chainId,
      });
      return NextResponse.json(collection);
    }
  );
};

export default createDefaultCollectionHandler;
