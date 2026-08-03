import { CHAIN_ID, USDC_ADDRESS } from '@/lib/consts';
import { supabase } from '@/lib/supabase/client';
import { zeroAddress } from 'viem';

export type CollectingStats = {
  eth_spent: string;
  usdc_spent: string;
};

export const emptyCollectingStats: CollectingStats = {
  eth_spent: '0',
  usdc_spent: '0',
};

const formatSpent = (value: number): string => {
  if (!Number.isFinite(value) || value === 0) return '0';
  return String(value);
};

const getCollectingStats = async (artist: string): Promise<CollectingStats> => {
  try {
    const recipient = artist.toLowerCase();
    const usdc = (USDC_ADDRESS[CHAIN_ID] ?? '').toLowerCase();

    const { data, error } = await supabase
      .from('in_process_transfers')
      .select('value, currency, moment!inner(collection!inner(chain_id))')
      .eq('recipient', recipient)
      .eq('moment.collection.chain_id', CHAIN_ID)
      .not('value', 'is', null)
      .order('transferred_at', { ascending: false })
      .range(0, 9999);

    if (error) throw error;

    let ethSpent = 0;
    let usdcSpent = 0;
    for (const row of data ?? []) {
      const amount = Number(row.value);
      if (!Number.isFinite(amount)) continue;
      const currency = (row.currency ?? '').toLowerCase();
      if (!currency || currency === zeroAddress) ethSpent += amount;
      else if (usdc && currency === usdc) usdcSpent += amount;
    }

    return {
      eth_spent: formatSpent(ethSpent),
      usdc_spent: formatSpent(usdcSpent),
    };
  } catch (error) {
    console.error(error);
    return emptyCollectingStats;
  }
};

export default getCollectingStats;
