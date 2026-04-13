import { Transfer_Type } from '@/types/transfer';
import { supabase } from '../client';

const selectTransfers = async ({
  type,
  spender,
  recipient,
  chainId,
  limit,
  page,
}: {
  type?: Transfer_Type;
  spender?: string;
  recipient?: string;
  chainId?: number;
  limit: number;
  page: number;
}) => {
  let query = supabase
    .from('in_process_transfers')
    .select(
      '*, recipient:in_process_artists!inner(address, username), moment:in_process_moments!inner(token_id, collection:in_process_collections!inner(address, chain_id, protocol, spender:in_process_artists!creator(address, username)), metadata:in_process_metadata(name, description, external_url, image, animation_url, content))',
      { count: 'exact' }
    );

  if (spender) {
    query = query.eq('moment.collection.creator', spender);
    if (type === Transfer_Type.airdrop)
      query = query.neq('recipient.address', spender);
  }

  if (recipient) {
    query = query.eq('recipient.address', recipient);
    if (type === Transfer_Type.airdrop)
      query = query.neq('moment.collection.creator', recipient);
  }

  if (chainId) {
    query = query.eq('moment.collection.chain_id', chainId);
  }

  if (type === Transfer_Type.airdrop) {
    query = query.eq('moment.collection.protocol', 'in_process');
    query = query.is('value', null);
  }

  query = query.order('transferred_at', { ascending: false });

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
};

export default selectTransfers;
