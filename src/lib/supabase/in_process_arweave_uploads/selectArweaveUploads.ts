import { supabase } from '../client';

const selectArweaveUploads = (params: {
  rpc: 'get_arweave_uploads' | 'get_artist_arweave_uploads';
  artist?: string;
  from?: string;
  limit: number;
  page: number;
  sortBy: 'usdc_cost' | 'winc_cost' | 'size';
  sortOrder: 'asc' | 'desc';
}) =>
  supabase.rpc(params.rpc, {
    p_artist: params.artist,
    p_from: params.from,
    p_limit: params.limit,
    p_page: params.page,
    p_sort_by: params.sortBy,
    p_sort_order: params.sortOrder,
  });

export default selectArweaveUploads;
