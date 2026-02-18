import { supabase } from '@/lib/supabase/client';

const selectArtists = async ({
  address,
  q,
  type = 'human',
  limit = 50,
  page = 1,
}: {
  address?: string;
  q?: string;
  type?: 'human' | 'bot';
  limit?: number;
  page?: number;
} = {}) => {
  let query = supabase
    .from('in_process_artists')
    .select('*', { count: 'exact' });

  if (address) {
    return query.eq('address', address.toLowerCase()).limit(1);
  }

  if (q?.trim()) {
    return query.ilike('username', `${q}%`).limit(limit);
  }

  if (type === 'human') {
    query = query.not('username', 'is', null).neq('username', '');
  } else {
    query = query.or('username.is.null,username.eq.');
  }

  return query.range((page - 1) * limit, page * limit - 1);
};

export default selectArtists;
