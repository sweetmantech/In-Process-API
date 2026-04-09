import getCustodyAddress from '@/lib/farcaster/getCustodyAddress';
import neynarFetch from '@/lib/farcaster/neynarFetch';

const isAuthorizedSigner = async (
  fid: bigint,
  signer: string
): Promise<{ authorized: boolean; verifiedAddress: string }> => {
  const { custodyAddress, verifiedAddress } = await getCustodyAddress(fid);
  if (signer.toLowerCase() === custodyAddress)
    return { authorized: true, verifiedAddress };

  try {
    const data = (await neynarFetch(
      `/v2/farcaster/user/verifications?fid=${fid}`
    )) as any;
    const verifications: { address: string }[] = data?.verifications ?? [];
    const authorized = verifications.some(
      (v) => v.address?.toLowerCase() === signer.toLowerCase()
    );
    return { authorized, verifiedAddress };
  } catch {
    return { authorized: false, verifiedAddress };
  }
};

export default isAuthorizedSigner;
