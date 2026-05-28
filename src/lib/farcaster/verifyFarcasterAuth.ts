import { parseSiweMessage } from 'viem/siwe';
import { recoverMessageAddress } from 'viem';
import { optimism } from 'viem/chains';
import parseFidFromResources from '@/lib/farcaster/parseFidFromResources';
import isAuthorizedSigner from '@/lib/farcaster/isAuthorizedSigner';
import { Address } from 'viem';

const verifyFarcasterAuth = async (
  message: string,
  signature: string
): Promise<{
  verifiedAddress: Address;
  artistName: string;
}> => {
  const parsed = parseSiweMessage(message);

  if (parsed.chainId !== optimism.id) {
    throw new Error('Invalid chainId');
  }

  const recovered = await recoverMessageAddress({
    message,
    signature: signature as `0x${string}`,
  });

  if (recovered.toLowerCase() !== parsed.address?.toLowerCase()) {
    throw new Error('Invalid signature');
  }

  const fid = parseFidFromResources(parsed.resources);
  if (fid === null) throw new Error('No FID found in SIWE message');

  const { authorized, verifiedAddress, artistName } = await isAuthorizedSigner(
    fid,
    recovered
  );
  if (!authorized) throw new Error('Signer not authorized for FID');

  return {
    verifiedAddress: verifiedAddress as Address,
    artistName: artistName as string,
  };
};

export default verifyFarcasterAuth;
