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
  // Address-based lookup routes through in_process_wallets so it keeps
  // working after in_process_artists.address is dropped.
  if (address) {
    const { data: walletRows, error: walletErr } = await supabase
      .from('in_process_wallets')
      .select('artist')
      .eq('address', address.toLowerCase())
      .not('artist', 'is', null)
      .limit(1);
    if (walletErr) throw walletErr;
    const artistId = walletRows?.[0]?.artist;
    if (!artistId) return { data: [], error: null, count: 0 };

    const { data, error } = await supabase
      .from('in_process_artists')
      .select(
        'id, username, bio, x, telegram, instagram, in_process_wallets(address)'
      )
      .eq('id', artistId)
      .limit(1);
    if (error) throw error;
    return { data: flattenRows(data), error: null, count: data?.length ?? 0 };
  }

  let query = supabase
    .from('in_process_artists')
    .select(
      'id, username, bio, x, telegram, instagram, in_process_wallets(address)',
      { count: 'exact' }
    );

  if (telegram) {
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
  return { data: flattenRows(data), error: null, count: count ?? null };
};

const flattenRows = (
  rows: Array<{
    id: string;
    username: string | null;
    bio: string | null;
    instagram: string | null;
    telegram: string | null;
    x: string | null;
    in_process_wallets: Array<{ address: string }> | null;
  }> | null
): ArtistRow[] =>
  (rows ?? []).map(({ in_process_wallets, ...rest }) => ({
    ...rest,
    address: in_process_wallets?.[0]?.address ?? null,
  }));

export default selectArtists;
