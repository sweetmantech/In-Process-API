import { type Address } from 'viem';
import { coinbaseSmartWalletAbi } from '@/lib/abi/coinbaseSmartWalletAbi';
import { getPublicClient } from '../viem/publicClient';

const getSmartWalletOwnerAddresses = async (
  smartWalletAddress: Address
): Promise<Address[]> => {
  const publicClient = getPublicClient();
  const ownerCount = await publicClient.readContract({
    address: smartWalletAddress,
    abi: coinbaseSmartWalletAbi,
    functionName: 'ownerCount',
  });

  const calls = Array.from({ length: Number(ownerCount) }, (_, i) => ({
    address: smartWalletAddress,
    abi: coinbaseSmartWalletAbi,
    functionName: 'ownerAtIndex' as const,
    args: [BigInt(i)] as const,
  }));

  const results = await publicClient.multicall({ contracts: calls });

  return results.flatMap((result) => {
    if (result.status !== 'success') return [];
    const ownerBytes = result.result as `0x${string}`;
    // 32-byte encoded address: '0x' + 64 hex chars
    if (ownerBytes.length !== 66) return [];
    return [`0x${ownerBytes.slice(-40)}` as Address];
  });
};

export default getSmartWalletOwnerAddresses;
