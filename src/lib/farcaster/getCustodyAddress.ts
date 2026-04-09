import neynarFetch from '@/lib/farcaster/neynarFetch';

const getCustodyAddress = async (
  fid: bigint
): Promise<{ custodyAddress: string; verifiedAddress: string }> => {
  const data = (await neynarFetch(
    `/v2/farcaster/user/bulk?fids=${fid}`
  )) as any;
  const user = data?.users?.[0];
  const custodyAddress = user?.custody_address;
  if (!custodyAddress) throw new Error('No custody address found for FID');
  const verifications: string[] = user?.verifications ?? [];
  const verifiedAddress = (verifications[0] ?? custodyAddress).toLowerCase();
  return { custodyAddress: custodyAddress.toLowerCase(), verifiedAddress };
};

export default getCustodyAddress;
