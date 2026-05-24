import { supabase } from '@/lib/supabase/client';

const selectArtists = async ({
  address,
  smart_wallet,
  telegram_username,
  farcaster_username,
  q,
  type = 'human',
  limit = 50,
  page = 1,
}: {
  address?: string;
  smart_wallet?: string;
  telegram_username?: string;
  farcaster_username?: string;
  q?: string;
  type?: 'human' | 'bot';
  limit?: number;
  page?: number;
} = {}) => {
  let query = supabase
    .from('in_process_artists')
    .select('*, phone:in_process_artist_phones(phone_number, verified)', {
      count: 'exact',
    });

  if (address) {
    return query.eq('address', address.toLowerCase()).limit(1);
  }

  if (smart_wallet) {
    return query.eq('smart_wallet', smart_wallet.toLowerCase()).limit(1);
  }

  if (telegram_username) {
    return query
      .eq('telegram_username', telegram_username.toLowerCase())
      .limit(1);
  }

  if (farcaster_username) {
    return query.eq('farcaster_username', farcaster_username).limit(1);
  }

  if (q?.trim()) {
    return query.ilike('username', `${q}%`).limit(limit);
  }

  if (type === 'human') {
    query = query.not('username', 'is', null).neq('username', '');
  } else {
    query = query.or('username.is.null,username.eq.""');
  }

  return query.range((page - 1) * limit, page * limit - 1);
};

export default selectArtists;
