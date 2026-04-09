import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';

export async function getCollectionIdMap(
  pairs: Array<[string, number]>
): Promise<Map<string, string>> {
  if (!pairs.length) return new Map();

  const { data, error } = await selectCollections({
    collections: pairs.map(([address, chainId]) => ({ address, chainId })),
  });
  if (error) throw error;

  const requestedPairs = new Set(
    pairs.map(([address, chainId]) => `${address.toLowerCase()}:${chainId}`)
  );
  const collectionMap = new Map<string, string>();
  for (const collection of data) {
    const key = `${collection.address.toLowerCase()}:${collection.chain_id}`;
    if (requestedPairs.has(key)) {
      collectionMap.set(key, collection.id);
    }
  }

  console.log(
    `✅ Retrieved ${collectionMap.size} collection ID(s) for ${pairs.length} pair(s)`
  );
  return collectionMap;
}
