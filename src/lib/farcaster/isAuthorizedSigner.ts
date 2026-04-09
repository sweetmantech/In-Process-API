import { bytesToHex } from 'viem';
import getCustodyAddress from '@/lib/farcaster/getCustodyAddress';
import hubClient from '@/lib/farcaster/hubClient';

const isAuthorizedSigner = async (
  fid: bigint,
  signer: string
): Promise<{ authorized: boolean; custodyAddress: string }> => {
  const custodyAddress = await getCustodyAddress(fid);
  if (signer.toLowerCase() === custodyAddress)
    return { authorized: true, custodyAddress };

  const result = await hubClient.getAllVerificationMessagesByFid({
    fid: Number(fid),
  });
  if (result.isErr()) return { authorized: false, custodyAddress };

  const authorized = result.value.messages.some((msg) => {
    const addr = msg.data?.verificationAddAddressBody?.address;
    if (!addr?.length) return false;
    return bytesToHex(addr).toLowerCase() === signer.toLowerCase();
  });

  return { authorized, custodyAddress };
};

export default isAuthorizedSigner;
