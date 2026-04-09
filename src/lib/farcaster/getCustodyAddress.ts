import neynarFetch from '@/lib/farcaster/neynarFetch';

const getCustodyAddress = async (fid: bigint): Promise<string> => {
  const data = (await neynarFetch(
    `/v2/farcaster/user/bulk?fids=${fid}`
  )) as any;
  const custodyAddress = data?.users?.[0]?.custody_address;
  if (!custodyAddress) throw new Error('No custody address found for FID');
  return custodyAddress.toLowerCase();
};

export default getCustodyAddress;
