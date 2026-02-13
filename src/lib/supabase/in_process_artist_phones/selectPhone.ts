import { supabase } from '../client';

const selectPhone = async (phone_number: string) => {
  const { data, error } = await supabase
    .from('in_process_artist_phones')
    .select(
      'artist_address, phone_number, verified, artist:in_process_artists!inner(address)'
    )
    .eq('phone_number', phone_number)
    .single();

  return { data, error };
};

export default selectPhone;
