import type { TransfersQueryParams } from '@/lib/schema/transfersQuerySchema';
import { supabase } from '../client';

type AirdropTransferResult = {
  transfers: Record<string, unknown>[];
  total_count: number;
};

const selectAirdrops = async (params: TransfersQueryParams) => {
  const { artist, collector, chainId, content_type, limit, page } = params;
  const from = (page - 1) * limit;

  const { data, error } = await (supabase as any).rpc('get_airdrop_transfers', {
    p_artist: artist ?? null,
    p_collector: collector ?? null,
    p_chain_id: chainId ?? null,
    p_content_type: content_type ?? null,
    p_limit: limit,
    p_offset: from,
  });

  if (error) throw error;

  const result = ((data ?? [])[0] ?? null) as AirdropTransferResult | null;
  return {
    data: result?.transfers ?? [],
    count: result?.total_count ?? 0,
  };
};

export default selectAirdrops;
