import { supabase } from '../client';

const SORT_COLUMN: Record<'size' | 'usdc_cost' | 'created_at', string> = {
  size: 'file_size_bytes',
  usdc_cost: 'usdc_cost',
  created_at: 'created_at',
};

const selectArweaveUploads = (params: {
  artist?: string;
  from?: string;
  limit: number;
  page: number;
  sortBy: 'size' | 'usdc_cost' | 'created_at';
  sortOrder: 'asc' | 'desc';
}) => {
  const { artist, from, limit, page, sortBy, sortOrder } = params;

  let query = supabase
    .from('in_process_arweave_uploads')
    .select(
      'id, arweave_uri, winc_cost, usdc_cost, file_size_bytes, content_type, created_at, artist:in_process_artists!inner(username, address)',
      { count: 'estimated' }
    )
    .order(SORT_COLUMN[sortBy], { ascending: sortOrder === 'asc' });

  if (artist) {
    if (/^0x[0-9a-fA-F]{40}$/.test(artist)) {
      query = query.eq('artist_address', artist.toLowerCase());
    } else {
      query = query.ilike('in_process_artists.username', artist);
    }
  }

  if (from) {
    query = query.gte('created_at', from);
  }

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  return query;
};

export default selectArweaveUploads;
