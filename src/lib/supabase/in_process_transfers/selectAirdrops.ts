import type { TransfersQueryParams } from '@/lib/schema/transfersQuerySchema';
import { supabase } from '../client';
import { transfersQuery } from './queries';

const selectAirdrops = async (params: TransfersQueryParams) => {
  const { artist, collector, chainId, content_type, limit, page } = params;

  let query = supabase
    .from('in_process_transfers')
    .select(transfersQuery, { count: 'planned' });

  query = query.is('value', null);
  query = query.eq('moment.collection.protocol', 'in_process');
  query = query.order('transferred_at', { ascending: false });

  if (artist) {
    query = query.eq('moment.collection.creator', artist);
    query = query.neq('collector.address', artist);
  }

  if (collector) {
    query = query.eq('collector.address', collector);
    query = query.neq('moment.collection.creator', collector);
  }

  if (chainId) {
    query = query.eq('moment.collection.chain_id', chainId);
  }

  if (content_type) {
    query = query.ilike('moment.metadata.content->>mime', `%${content_type}%`);
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
};

export default selectAirdrops;
