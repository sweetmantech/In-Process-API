import { supabase } from '../client';

const selectPhone = async (phone_number: string) => {
  const { data, error } = await supabase
    .from('in_process_artist_phones')
    .select(
      `
      phone_number,
      verified,
      wallet:in_process_wallets!artist_address(
        address,
        artist_id:artist,
        artist:in_process_artists(
          id,
          username,
          wallets:in_process_wallets(address, type)
        )
      )
    `
    )
    .eq('phone_number', phone_number)
    .single();

  return { data, error };
};

export default selectPhone;
