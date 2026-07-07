import { getAddress, isAddress, type Address } from 'viem';
import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import getSelectedCollectionAddress from './getSelectedCollectionAddress';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import { CHAIN_ID } from '@/lib/consts';

type ResolvedMomentCollection = {
  collectionAddress: Address | null;
  explicitSelection: boolean;
};

async function getCollectionAddress(
  thread: Thread<TelegramThreadState>,
  artistAddress: Address
): Promise<ResolvedMomentCollection> {
  const selected = await getSelectedCollectionAddress(thread);
  if (selected) {
    return { collectionAddress: selected, explicitSelection: true };
  }

  const data = await selectCollections({
    artist: artistAddress,
    chainId: CHAIN_ID,
    limit: 1,
  });

  const first = data?.[0]?.address;
  if (first && isAddress(first)) {
    return { collectionAddress: getAddress(first), explicitSelection: false };
  }

  return { collectionAddress: null, explicitSelection: false };
}

export default getCollectionAddress;
