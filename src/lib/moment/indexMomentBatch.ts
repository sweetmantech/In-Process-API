import type { Address } from 'viem';
import type { CreateMomentBatchInput } from './createMomentBatch';
import { getPublicClient } from '@/lib/viem/publicClient';
import indexMoment from './indexMoment';

const indexMomentBatch = async ({
  contractAddress,
  tokenIds,
  tokens,
  account,
  channel,
  chainId,
  blockNumber,
}: {
  contractAddress: Address;
  tokenIds: string[];
  tokens: CreateMomentBatchInput['tokens'];
  account: Address;
  channel: CreateMomentBatchInput['channel'];
  chainId: number;
  blockNumber: bigint;
}): Promise<void> => {
  const block = await getPublicClient(chainId).getBlock({ blockNumber });
  const blockTimestamp = Number(block.timestamp);

  await Promise.all(
    tokenIds.map((tokenId, index) =>
      indexMoment({
        artistAddress: account,
        contractAddress,
        tokenId,
        channel,
        token: tokens[index],
        chainId,
        blockTimestamp,
      })
    )
  );
};

export default indexMomentBatch;
