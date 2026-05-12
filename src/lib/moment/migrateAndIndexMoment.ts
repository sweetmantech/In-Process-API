import type { Address } from 'viem';
import { CHAIN_ID } from '@/lib/consts';
import migrateMuxToArweave from '@/workflows/migrateMuxToArweave';
import indexMoment, { type IndexMomentParams } from './indexMoment';

export type MigrateAndIndexMomentParams = Omit<
  IndexMomentParams,
  'artistAddress'
> & { artistAddress: Address; chainId?: number };

export default async function migrateAndIndexMoment(
  params: MigrateAndIndexMomentParams
): Promise<void> {
  const { artistAddress, contractAddress, tokenId, channel, token, chainId } =
    params;
  const resolvedChainId = chainId ?? CHAIN_ID;

  migrateMuxToArweave({
    artistAddress,
    moment: {
      collectionAddress: contractAddress,
      tokenId,
      chainId: resolvedChainId,
    },
    uri: token.tokenMetadataURI,
  });

  await indexMoment({
    contractAddress,
    tokenId,
    artistAddress,
    channel,
    token,
    chainId: resolvedChainId,
  });
}
