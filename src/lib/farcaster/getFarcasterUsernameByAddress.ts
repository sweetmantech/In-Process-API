import neynarFetch from '@/lib/farcaster/neynarFetch';

const getFarcasterUsernameByAddress = async (
  address: string
): Promise<string | undefined> => {
  try {
    const data = (await neynarFetch(
      `/v2/farcaster/user/bulk-by-address?addresses=${address}`
    )) as Record<string, { display_name?: string; username?: string }[]>;
    const users = data[address.toLowerCase()] ?? data[address];
    const user = users?.[0];
    return user?.display_name || user?.username || undefined;
  } catch {
    return undefined;
  }
};

export default getFarcasterUsernameByAddress;
