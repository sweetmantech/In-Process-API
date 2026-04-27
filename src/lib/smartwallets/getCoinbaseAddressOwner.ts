import { getAddress, type Address, type Hex } from 'viem';
import coinbaseSmartWalletAbi from '@/lib/abi/coinbaseSmartWalletAbi';
import { getPublicClient } from '@/lib/viem/publicClient';

const getCoinbaseAddressOwner = async (
  wallet: Address,
  chainId: number
): Promise<Address | null> => {
  const client = getPublicClient(chainId);
  const next = await client.readContract({
    address: wallet,
    abi: coinbaseSmartWalletAbi,
    functionName: 'nextOwnerIndex',
  });
  const n = Number(next);
  if (n <= 0 || !Number.isSafeInteger(n)) return null;

  const contracts = Array.from({ length: n }, (_, i) => ({
    address: wallet,
    abi: coinbaseSmartWalletAbi,
    functionName: 'ownerAtIndex' as const,
    args: [BigInt(i)] as const,
  }));
  const results = await client.multicall({ contracts });

  for (const row of results) {
    const raw = row.result as Hex | undefined;
    if (!raw || raw === '0x') continue;
    const byteLen = (raw.length - 2) / 2;
    if (byteLen !== 32) continue;
    try {
      return getAddress(`0x${raw.slice(-40)}`);
    } catch {
      continue;
    }
  }

  return null;
};

export default getCoinbaseAddressOwner;
