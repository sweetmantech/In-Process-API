import { Address } from 'viem';
import { tasks } from '@trigger.dev/sdk';
import { CHAIN_ID } from '@/lib/consts';
import getMomentMime from './getMomentMime';

const triggerMuxMigration = async ({
  uri,
  collectionAddress,
  tokenId,
  artistAddress,
}: {
  uri: string;
  collectionAddress: Address;
  tokenId: string;
  artistAddress: Address;
}) => {
  const mimeType = await getMomentMime(uri);
  if (!mimeType?.includes('video')) return;

  await tasks.trigger('migrate-mux-to-arweave', {
    collectionAddress,
    tokenId,
    chainId: CHAIN_ID,
    artistAddress,
  });
};

export default triggerMuxMigration;
