import neynarFetch from './neynarFetch';

const getFarcasterWalletByUsername = async (
  username: string
): Promise<string | undefined> => {
  try {
    const data = (await neynarFetch(
      `/v2/farcaster/user/by_username?username=${encodeURIComponent(username)}`
    )) as any;
    const user = data?.user;
    if (!user) return undefined;
    const primaryEthAddress: string | undefined =
      user?.verified_addresses?.primary?.eth_address;
    const address = primaryEthAddress ?? user?.custody_address;
    return address ? address.toLowerCase() : undefined;
  } catch {
    return undefined;
  }
};

export default getFarcasterWalletByUsername;
