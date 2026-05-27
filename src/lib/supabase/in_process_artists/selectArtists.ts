import { supabase } from '@/lib/supabase/client';

const selectArtists = async ({
  address,
  telegram,
  q,
  type = 'human',
  limit = 50,
  page = 1,
}: {
  address?: string;
  telegram?: string;
  q?: string;
  type?: 'human' | 'bot';
  limit?: number;
  page?: number;
} = {}) => {
  let query = supabase
    .from('in_process_artists')
    .select('*', { count: 'exact' });

  if (address) query = query.eq('address', address.toLowerCase()).limit(1);
  else if (telegram)
    query = query.eq('telegram', telegram.toLowerCase()).limit(1);
  else if (q?.trim()) query = query.ilike('username', `${q}%`).limit(limit);
  else {
    query =
      type === 'human'
        ? query.not('username', 'is', null)
        : query.is('username', null);
    query = query.range((page - 1) * limit, page * limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, error, count };
};

export default selectArtists;
