import getCustodyAddress from '@/lib/farcaster/getCustodyAddress';
import { FARCASTER_HUB_API } from '@/lib/consts';

const isAuthorizedSigner = async (
  fid: bigint,
  signer: string
): Promise<{ authorized: boolean; custodyAddress: string }> => {
  const custodyAddress = await getCustodyAddress(fid);
  if (signer.toLowerCase() === custodyAddress)
    return { authorized: true, custodyAddress };

  const res = await fetch(`${FARCASTER_HUB_API}/verificationsByFid?fid=${fid}`);
  if (!res.ok) return { authorized: false, custodyAddress };
  const data = await res.json();
  const messages: any[] = data.messages ?? [];
  const authorized = messages.some(
    (msg) =>
      msg?.data?.verificationAddEthOrSolAddressBody?.address?.toLowerCase() ===
      signer.toLowerCase()
  );
  return { authorized, custodyAddress };
};

export default isAuthorizedSigner;
