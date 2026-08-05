import getCollectionsRpc, {
  type RpcCollection,
} from '@/lib/supabase/in_process_collections/getCollectionsRpc';

const getProcessCollectionItem = async ({
  address,
  chainId,
}: {
  address: string;
  chainId: number;
}): Promise<RpcCollection> => {
  const { data, error } = await getCollectionsRpc({
    addresses: [address],
    chainId,
  });
  if (error) throw error;
  const collection = data?.[0];
  if (!collection) {
    throw new Error(`Process collection not found: ${address}`);
  }
  return collection;
};

export default getProcessCollectionItem;
