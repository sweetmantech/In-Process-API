import selectArtists from '../supabase/in_process_artists/selectArtists';
import selectWallets from '../supabase/in_process_wallets/selectWallets';

const getFarcasterSocialWallet = async (
  profileAddress: string
): Promise<string | undefined> => {
  const { data: artists } = await selectArtists({ address: profileAddress });
  const artistId = artists?.[0]?.id;
  if (!artistId) return undefined;

  const { data: wallets } = await selectWallets({
    artistId,
    type: 'farcaster',
  });
  return wallets?.[0]?.address ?? undefined;
};

export default getFarcasterSocialWallet;
