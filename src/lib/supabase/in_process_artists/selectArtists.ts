import { supabase } from '@/lib/supabase/client';

type ArtistRow = {
  id: string;
  address: string | null;
  username: string | null;
  bio: string | null;
  instagram: string | null;
  telegram: string | null;
  x: string | null;
};

const SELECT_FIELDS =
  'id, username, bio, x, telegram, instagram, in_process_wallets!inner(address)';

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
} = {}): Promise<{
  data: ArtistRow[];
  error: null;
  count: number | null;
}> => {
  let query = supabase
    .from('in_process_artists')
    .select(SELECT_FIELDS, { count: 'exact' });

  if (address) {
    query = query
      .eq('in_process_wallets.address', address.toLowerCase())
      .limit(1);
  } else if (telegram) {
    query = query.eq('telegram', telegram.toLowerCase()).limit(1);
  } else if (q?.trim()) {
    query = query.ilike('username', `${q}%`).limit(limit);
  } else {
    query =
      type === 'human'
        ? query.not('username', 'is', null)
        : query.is('username', null);
    query = query.range((page - 1) * limit, page * limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return {
    data: (data ?? []).map(({ in_process_wallets, ...rest }) => ({
      ...rest,
      address: in_process_wallets?.[0]?.address ?? null,
    })),
    error: null,
    count: count ?? null,
  };
};

export default selectArtists;
