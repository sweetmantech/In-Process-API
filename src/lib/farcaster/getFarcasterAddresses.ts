import neynarFetch from '@/lib/farcaster/neynarFetch';

const getFarcasterAddresses = async (
  fid: bigint
): Promise<{
  custodyAddress: string;
  verifiedAddress: string;
  artistName: string | undefined;
  farcasterUsername: string | undefined;
}> => {
  const data = (await neynarFetch(
    `/v2/farcaster/user/bulk?fids=${fid}`
  )) as any;
  const user = data?.users?.[0];
  const custodyAddress = user?.custody_address;
  if (!custodyAddress) throw new Error('No custody address found for FID');
  const primaryEthAddress: string | undefined =
    user?.verified_addresses?.primary?.eth_address;
  const verifiedAddress = (primaryEthAddress ?? custodyAddress).toLowerCase();
  const artistName: string | undefined = user?.display_name;
  const farcasterUsername: string | undefined = user?.username;
  return {
    custodyAddress: custodyAddress.toLowerCase(),
    verifiedAddress,
    artistName,
    farcasterUsername,
  };
};

export default getFarcasterAddresses;
