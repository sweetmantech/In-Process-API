import { supabase } from '../client';

const selectArweaveUploads = (params: {
  artistAddress?: string;
  limit: number;
  page: number;
}) => {
  const { artistAddress, limit, page } = params;

  let query = supabase
    .from('in_process_arweave_uploads')
    .select(
      'id, arweave_uri, winc_cost, usdc_cost, file_size_bytes, content_type, created_at, in_process_artists!inner(username, artist_address)',
      { count: 'estimated' }
    )
    .order('created_at', { ascending: false });

  if (artistAddress) {
    query = query.eq('artist_address', artistAddress);
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  return query;
};

export default selectArweaveUploads;
