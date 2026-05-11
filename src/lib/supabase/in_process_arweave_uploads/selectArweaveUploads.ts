import { supabase } from '../client';

const selectArweaveUploads = (params: {
  artist?: string;
  from?: string;
  limit: number;
  page: number;
  sortBy: 'size' | 'usdc_cost' | 'created_at';
  sortOrder: 'asc' | 'desc';
}) =>
  supabase.rpc('get_arweave_uploads', {
    p_artist: params.artist,
    p_from: params.from,
    p_limit: params.limit,
    p_page: params.page,
    p_sort_by: params.sortBy,
    p_sort_order: params.sortOrder,
  });

export default selectArweaveUploads;
