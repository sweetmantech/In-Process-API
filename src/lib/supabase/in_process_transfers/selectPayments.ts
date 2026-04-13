import type { TransfersQueryParams } from '@/lib/schema/transfersQuerySchema';
import { supabase } from '../client';
import { paymentTransfersQuery } from './queries';

const selectPayments = async (params: TransfersQueryParams) => {
  const { artist, collector, chainId, limit, page } = params;

  let query = supabase
    .from('in_process_transfers')
    .select(paymentTransfersQuery, { count: 'exact' });

  query = query.eq('moment.collection.protocol', 'in_process');
  query = query.gte('value', 0);
  query = query.order('transferred_at', { ascending: false });

  if (artist) {
    query = query.eq('moment.fee_recipients.artist_address', artist);
  }

  if (collector) {
    query = query.eq('recipient.address', collector);
  }

  if (chainId) {
    query = query.eq('moment.collection.chain_id', chainId);
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
};

export default selectPayments;
