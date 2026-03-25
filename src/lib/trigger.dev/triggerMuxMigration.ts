import { Address } from 'viem';
import { tasks } from '@trigger.dev/sdk';
import { CHAIN_ID } from '@/lib/consts';
import getMomentMime from '@/lib/moment/getMomentMime';

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
  const mimeType = await getMomentMime(uri);
  if (!mimeType || !mimeType.trim().toLowerCase().startsWith('video/')) return;

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
