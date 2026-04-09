import getCustodyAddress from '@/lib/farcaster/getCustodyAddress';
import { FARCASTER_HUB_API } from '@/lib/consts';

const isAuthorizedSigner = async (
  fid: bigint,
  signer: string
): Promise<boolean> => {
  const custodyAddress = await getCustodyAddress(fid);
  if (signer.toLowerCase() === custodyAddress) return true;

  const res = await fetch(`${FARCASTER_HUB_API}/verificationsByFid?fid=${fid}`);
  if (!res.ok) return false;
  const data = await res.json();
  const messages: any[] = data.messages ?? [];
  return messages.some(
    (msg) =>
      msg?.data?.verificationAddEthOrSolAddressBody?.address?.toLowerCase() ===
      signer.toLowerCase()
  );
};

export default isAuthorizedSigner;
