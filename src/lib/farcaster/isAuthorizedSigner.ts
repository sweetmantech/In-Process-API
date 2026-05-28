import getFarcasterAddresses from '@/lib/farcaster/getFarcasterWalletByFid';

const isAuthorizedSigner = async (
  fid: bigint,
  signer: string
): Promise<{
  authorized: boolean;
  verifiedAddress: string;
  artistName: string | undefined;
}> => {
  const { custodyAddress, verifiedAddress, artistName } =
    await getFarcasterAddresses(fid);
  const authorized = signer.toLowerCase() === custodyAddress;

  return { authorized, verifiedAddress, artistName };
};

export default isAuthorizedSigner;
