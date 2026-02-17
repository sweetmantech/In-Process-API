import { supabase } from '@/lib/supabase/client';

const getArtistAddresses = async (socialWallets: string[]) => {
  return supabase
    .from('in_process_artist_social_wallets')
    .select('social_wallet, artist_address, in_process_artists(username)')
    .in('social_wallet', socialWallets);
};

export default getArtistAddresses;
