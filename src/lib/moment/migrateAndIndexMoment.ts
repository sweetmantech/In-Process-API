import type { Address } from 'viem';
import { CHAIN_ID } from '@/lib/consts';
import migrateMuxToArweave from '@/workflows/migrateMuxToArweave';
import indexMoment, { type IndexMomentParams } from './indexMoment';

export type MigrateAndIndexMomentParams = Omit<
  IndexMomentParams,
  'artistAddress'
> & { artistAddress: Address };

export default async function migrateAndIndexMoment(
  params: MigrateAndIndexMomentParams
): Promise<void> {
  const { artistAddress, contractAddress, tokenId, channel, token } = params;

  migrateMuxToArweave({
    artistAddress,
    moment: {
      collectionAddress: contractAddress,
      tokenId,
      chainId: CHAIN_ID,
    },
    uri: token.tokenMetadataURI,
  });

  await indexMoment({
    contractAddress,
    tokenId,
    artistAddress,
    channel,
    token,
  });
}
