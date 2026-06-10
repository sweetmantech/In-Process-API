import { NOUNS_GOVERNOR_ABI } from '@/lib/abi/nounsAbi';
import { getPublicClient } from '@/lib/viem/publicClient';
import { getNounsGovernorAddress } from './getNounsGovernorAddress';

export async function getNounsProposalThreshold(
  chainId: number
): Promise<number> {
  const client = getPublicClient(chainId);

  const threshold = await client.readContract({
    address: getNounsGovernorAddress(chainId),
    abi: NOUNS_GOVERNOR_ABI,
    functionName: 'proposalThreshold',
  });

  return Number(threshold);
}
