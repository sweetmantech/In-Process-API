import getCollectorsStats from '@/lib/supabase/in_process_transfers/getCollectorsStats';

export type CollectingStats = {
  eth_spent: string;
  usdc_spent: string;
};

export const emptyCollectingStats: CollectingStats = {
  eth_spent: '0',
  usdc_spent: '0',
};

const getCollectingStats = async (artist: string): Promise<CollectingStats> => {
  try {
    const { data } = await getCollectorsStats({
      artist: artist.toLowerCase(),
      period: 'all',
      limit: 1,
      page: 1,
    });
    const row = data?.[0];
    if (!row) return emptyCollectingStats;

    return {
      eth_spent: row.eth_spent ?? '0',
      usdc_spent: row.usdc_spent ?? '0',
    };
  } catch (error) {
    console.error(error);
    return emptyCollectingStats;
  }
};

export default getCollectingStats;
