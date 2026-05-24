import { supabase } from '../client';

const selectSocialWallets = async ({
  artistAddress,
  socialWallets,
}: {
  artistAddress?: string;
  socialWallets?: string[];
}) => {
  const query = supabase
    .from('in_process_artist_social_wallets')
    .select('social_wallet, artist_address, in_process_artists(username)');

  if (artistAddress) {
    return query.eq('artist_address', artistAddress.toLowerCase());
  }
  if (socialWallets?.length) {
    return query.in('social_wallet', socialWallets);
  }
  return query;
};

export default selectSocialWallets;
