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

  if (address) {
    const { data, error, count } = await query
      .eq('address', address.toLowerCase())
      .limit(1);
    if (error) throw error;
    return { data, error, count };
  }

  if (telegram) {
    const { data, error, count } = await query
      .eq('telegram', telegram.toLowerCase())
      .limit(1);
    if (error) throw error;
    return { data, error, count };
  }

  if (q?.trim()) {
    const { data, error, count } = await query
      .ilike('username', `${q}%`)
      .limit(limit);
    if (error) throw error;
    return { data, error, count };
  }

  if (type === 'human') {
    query = query.not('username', 'is', null);
  } else {
    query = query.is('username', null);
  }

  const { data, error, count } = await query.range(
    (page - 1) * limit,
    page * limit - 1
  );
  if (error) throw error;
  return { data, error, count };
};

export default selectArtists;
