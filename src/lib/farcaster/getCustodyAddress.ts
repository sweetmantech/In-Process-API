import { FARCASTER_HUB_API } from '@/lib/consts';

const getCustodyAddress = async (fid: bigint): Promise<string> => {
  const res = await fetch(
    `${FARCASTER_HUB_API}/custodyAddressByFid?fid=${fid}`
  );
  if (!res.ok) throw new Error('Failed to fetch custody address from Hub');
  const data = await res.json();
  const address = data.custodyAddress ?? data.result?.custodyAddress;
  if (!address) throw new Error('No custody address found for FID');
  return address.toLowerCase();
};

export default getCustodyAddress;
