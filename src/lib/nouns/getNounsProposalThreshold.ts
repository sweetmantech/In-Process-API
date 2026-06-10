import { createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { getNounsGovernorAddress } from './getNounsGovernorAddress';

const PROPOSAL_THRESHOLD_ABI = [
  {
    name: 'proposalThreshold',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const;

export async function getNounsProposalThreshold(chainId: number): Promise<number> {
  const chain = chainId === sepolia.id ? sepolia : mainnet;
  const rpcUrl =
    chainId === sepolia.id
      ? process.env.ETHEREUM_SEPOLIA_RPC_URL
      : process.env.ETHEREUM_RPC_URL;

  const client = createPublicClient({ chain, transport: http(rpcUrl) });

  const threshold = await client.readContract({
    address: getNounsGovernorAddress(chainId),
    abi: PROPOSAL_THRESHOLD_ABI,
    functionName: 'proposalThreshold',
  });

  return Number(threshold);
}
