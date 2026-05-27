import { supabase } from '@/lib/supabase/client';

// IS NULL guard makes this safe under concurrent writers: only the first
// caller that observes an unlinked wallet ends up writing the artist UUID.
const linkWalletToArtist = async (address: string, artistId: string) => {
  return supabase
    .from('in_process_wallets')
    .update({ artist: artistId })
    .eq('address', address.toLowerCase())
    .is('artist', null);
};

export default linkWalletToArtist;
