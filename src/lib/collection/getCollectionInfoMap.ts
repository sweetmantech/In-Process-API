import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';

export type CollectionInfo = { id: string; creator: string };

export async function getCollectionInfoMap(
  pairs: Array<[string, number]>
): Promise<Map<string, CollectionInfo>> {
  if (!pairs.length) return new Map();

  const data = await selectCollections({
    addresses: pairs.map(([address]) => address),
  });

  const requestedPairs = new Set(
    pairs.map(([address, chainId]) => `${address.toLowerCase()}:${chainId}`)
  );
  const collectionMap = new Map<string, CollectionInfo>();
  for (const collection of data ?? []) {
    const key = `${collection.address.toLowerCase()}:${collection.chain_id}`;
    if (requestedPairs.has(key)) {
      collectionMap.set(key, {
        id: collection.id,
        creator: collection.creator,
      });
    }
  }

  console.log(
    `✅ Retrieved ${collectionMap.size} collection ID(s) for ${pairs.length} pair(s)`
  );
  return collectionMap;
}
