import type { Address } from 'viem';
import getFarcasterUsernameByAddress from '@/lib/farcaster/getFarcasterUsernameByAddress';
import resolveAddressToEns from '@/lib/ens/resolveAddressToEns';

const resolveAddressDisplayName = async (
  address: string
): Promise<string | null> => {
  const farcasterName = await getFarcasterUsernameByAddress(address);
  if (farcasterName) return farcasterName;
  return resolveAddressToEns(address as Address);
};

export default resolveAddressDisplayName;
