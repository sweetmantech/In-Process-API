import { supabase } from '@/lib/supabase/client';
import { CHAIN_ID } from '@/lib/consts';

export type InProcessPayment = {
  id: string;
  moment: {
    id: string;
    token_id: number;
    uri: string;
    collection: {
      address: string;
      chain_id: number;
      creator: string;
    };
    fee_recipients: Array<{
      artist_address: string;
      percent_allocation: number;
    }>;
    metadata: Record<string, unknown> | null;
  };
  buyer: {
    address: string;
    username: string | null;
  };
  amount: string;
  transaction_hash: string;
  transferred_at: string;
  currency: string;
};

export interface InProcessPaymentsQuery {
  limit?: number;
  page?: number;
  artists?: string[];
  collectors: string[];
  chainId?: number;
  mime?: string;
}

export async function selectPayments({
  limit = 20,
  page = 1,
  artists,
  collectors,
  chainId = CHAIN_ID,
  mime,
}: InProcessPaymentsQuery) {
  const { data, error } = await supabase.rpc('get_in_process_payments', {
    p_limit: limit,
    p_page: page,
    p_artists: artists && artists.length > 0 ? artists : undefined,
    p_collectors: collectors && collectors.length > 0 ? collectors : undefined,
    p_chainid: chainId,
    p_mime: mime,
  });

  if (error) return { data: null, count: null, error };

  const result = data as {
    payments: InProcessPayment[];
    count: number;
    pagination: {
      page: number;
      limit: number;
      total_pages: number;
    };
  };

  return {
    data: result.payments || [],
    count: result.count || 0,
    error: null,
  };
}
