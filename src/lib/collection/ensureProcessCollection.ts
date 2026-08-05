import { getAddress, type Address } from 'viem';
import { PROCESS_COLLECTION_NAME, PROCESS_COLLECTION_URI } from '@/lib/consts';
import { createCollection } from '@/lib/collection/createCollection';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import { upsertCollections } from '@/lib/supabase/in_process_collections/upsertCollections';
import { ensureWallets } from '@/lib/wallets/ensureWallets';
import { withProcessCollectionCreateLock } from '@/lib/collection/withProcessCollectionCreateLock';
import getProcessCollectionItem from '@/lib/collection/getProcessCollectionItem';
import type { RpcCollection } from '@/lib/supabase/in_process_collections/getCollectionsRpc';

const ensureProcessCollection = async (
  account: Address,
  chainId: number
): Promise<RpcCollection> => {
  return withProcessCollectionCreateLock(account, chainId, async () => {
    const existingCollections = await selectCollections({
      artist: account,
      uri: PROCESS_COLLECTION_URI,
      chainId,
      limit: 1,
    });
    if (existingCollections.length > 0) {
      return getProcessCollectionItem({
        address: existingCollections[0].address,
        chainId,
      });
    }

    const result = await createCollection({
      account,
      collection: {
        uri: PROCESS_COLLECTION_URI,
        name: PROCESS_COLLECTION_NAME,
      },
      chainId,
    });
    const artist = getAddress(account).toLowerCase();
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

    return getProcessCollectionItem({
      address,
      chainId: result.chainId,
    });
  });
};

export default ensureProcessCollection;
