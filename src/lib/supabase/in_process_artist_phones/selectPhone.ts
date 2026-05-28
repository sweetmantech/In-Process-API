import { supabase } from '../client';

const selectPhone = async ({
  phone_number,
  artist_id,
}: {
  phone_number?: string;
  artist_id?: string;
}) => {
  let query = supabase.from('in_process_artist_phones').select(
    `
      phone_number,
      verified,
      artist_id,
      artist:in_process_artists(
        id,
        username,
        wallets:in_process_wallets(address, type)
      )
    `
  );

  if (phone_number) {
    return query.eq('phone_number', phone_number).single();
  }
  if (artist_id) {
    return query.eq('artist_id', artist_id).maybeSingle();
  }

  throw new Error('selectPhone requires phone_number or artist_id');
};

export default selectPhone;
