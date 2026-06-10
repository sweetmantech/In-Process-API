import { Address, encodeFunctionData, Hex } from 'viem';
import { NOUNS_GOVERNOR_ABI } from '@/lib/abi/nounsAbi';
import { getNounsGovernorAddress } from './getNounsGovernorAddress';

export function getNounsProposalCalldata({
  chainId,
  target,
  calldata,
  description,
}: {
  chainId: number;
  target: Address;
  calldata: Hex;
  description: string;
}): { to: Address; data: Hex; value: string } {
  const data = encodeFunctionData({
    abi: NOUNS_GOVERNOR_ABI,
    functionName: 'propose',
    args: [[target], [BigInt(0)], [calldata], description],
  });

  return {
    to: getNounsGovernorAddress(chainId),
    data,
    value: '0',
  };
}
