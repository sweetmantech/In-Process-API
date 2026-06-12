import { type Address } from 'viem';
import { getPublicClient } from '@/lib/viem/publicClient';
import { coinbaseSmartWalletAbi } from '@/lib/abi/coinbaseSmartWalletAbi';

const isSmartWalletOwnerAddress = (
  smartWalletAddress: Address,
  ownerAddress: Address
): Promise<boolean> =>
  getPublicClient().readContract({
    address: smartWalletAddress,
    abi: coinbaseSmartWalletAbi,
    functionName: 'isOwnerAddress',
    args: [ownerAddress],
  });

export default isSmartWalletOwnerAddress;
