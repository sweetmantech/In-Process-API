import { Address } from 'viem';
import { tasks } from '@trigger.dev/sdk';
import { CHAIN_ID } from '@/lib/consts';
import getMetadataHandler from '@/lib/metadata/getMetadataHandler';
import { retriesGeneric } from '@/lib/protocolSdk/retries';

const triggerMuxMigration = async ({
  uri,
  collectionAddress,
  tokenId = '0',
  artistAddress,
}: {
  uri: string;
  collectionAddress: Address;
  tokenId?: string;
  artistAddress: Address;
}) => {
  const metadata = await retriesGeneric({
    tryFn: () => getMetadataHandler({ uri }),
    maxTries: 3,
    linearBackoffMS: 500,
  });
  if (!metadata) return;
  if (!metadata.content?.uri?.includes('mux.com')) return;

  try {
    await tasks.trigger('migrate-mux-to-arweave', {
      collectionAddress,
      tokenId,
      chainId: CHAIN_ID,
      artistAddress,
    });
  } catch (e) {
    console.error('triggerMuxMigration: tasks.trigger failed', e);
  }
};

export default triggerMuxMigration;
