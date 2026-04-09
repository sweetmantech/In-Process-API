import getCustodyAddress from '@/lib/farcaster/getCustodyAddress';
import neynarFetch from '@/lib/farcaster/neynarFetch';

const isAuthorizedSigner = async (
  fid: bigint,
  signer: string
): Promise<{ authorized: boolean; custodyAddress: string }> => {
  const custodyAddress = await getCustodyAddress(fid);
  if (signer.toLowerCase() === custodyAddress)
    return { authorized: true, custodyAddress };

  try {
    const data = (await neynarFetch(
      `/v2/farcaster/user/verifications?fid=${fid}`
    )) as any;
    const verifications: { address: string }[] = data?.verifications ?? [];
    const authorized = verifications.some(
      (v) => v.address?.toLowerCase() === signer.toLowerCase()
    );
    return { authorized, custodyAddress };
  } catch {
    return { authorized: false, custodyAddress };
  }
};

export default isAuthorizedSigner;
