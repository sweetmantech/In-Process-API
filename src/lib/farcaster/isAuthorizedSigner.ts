import getFarcasterAddresses from '@/lib/farcaster/getFarcasterAddresses';
import { upsertArtistNames } from '@/lib/supabase/in_process_artists/upsertArtistNames';

const isAuthorizedSigner = async (
  fid: bigint,
  signer: string
): Promise<{
  authorized: boolean;
  verifiedAddress: string;
  farcasterUsername: string | undefined;
}> => {
  const { custodyAddress, verifiedAddress, artistName, farcasterUsername } =
    await getFarcasterAddresses(fid);
  const authorized = signer.toLowerCase() === custodyAddress;
  if (authorized && artistName) {
    upsertArtistNames(new Map([[verifiedAddress, artistName]])).catch((e) =>
      console.error('upsertArtistNames failed in isAuthorizedSigner:', e)
    );
  }
  return { authorized, verifiedAddress, farcasterUsername };
};

export default isAuthorizedSigner;
