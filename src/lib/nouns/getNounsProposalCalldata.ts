import { Address, encodeFunctionData, Hex } from 'viem';
import { getNounsGovernorAddress } from './getNounsGovernorAddress';

const NOUNS_PROPOSE_ABI = [
  {
    name: 'propose',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'targets', type: 'address[]' },
      { name: 'values', type: 'uint256[]' },
      { name: 'calldatas', type: 'bytes[]' },
      { name: 'description', type: 'string' },
    ],
    outputs: [{ name: 'proposalId', type: 'uint256' }],
  },
] as const;

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
    abi: NOUNS_PROPOSE_ABI,
    functionName: 'propose',
    args: [[target], [BigInt(0)], [calldata], description],
  });

  return {
    to: getNounsGovernorAddress(chainId),
    data,
    value: '0',
  };
}
