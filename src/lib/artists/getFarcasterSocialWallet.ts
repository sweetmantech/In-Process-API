import selectArtists from '../supabase/in_process_artists/selectArtists';
import getFarcasterWalletByUsername from '../farcaster/getFarcasterWalletByUsername';

const getFarcasterSocialWallet = async (
  profileAddress: string
): Promise<string | undefined> => {
  const { data } = await selectArtists({ address: profileAddress });
  const farcasterUsername = data?.[0]?.farcaster_username;
  if (!farcasterUsername) return undefined;
  return getFarcasterWalletByUsername(farcasterUsername);
};

export default getFarcasterSocialWallet;
