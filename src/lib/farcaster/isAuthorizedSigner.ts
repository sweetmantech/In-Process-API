import getFarcasterAddresses from '@/lib/farcaster/getFarcasterAddresses';

const isAuthorizedSigner = async (
  fid: bigint,
  signer: string
): Promise<{ authorized: boolean; verifiedAddress: string }> => {
  const { custodyAddress, verifiedAddress } = await getFarcasterAddresses(fid);
  const authorized = signer.toLowerCase() === custodyAddress;
  return { authorized, verifiedAddress };
};

export default isAuthorizedSigner;
