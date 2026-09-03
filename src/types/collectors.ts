export type CollectorsSortBy = 'collected_count' | 'eth_spent' | 'usdc_spent';
export type CollectorsSortOrder = 'asc' | 'desc';

export interface CollectorsStatsParams {
  period?: 'day' | 'week' | 'month' | 'all';
  limit?: number;
  page?: number;
  artist?: string;
  sort_by?: CollectorsSortBy;
  sort_order?: CollectorsSortOrder;
}

export interface CollectorStats {
  artist_id: string;
  username: string | null;
  wallets: { address: string; type: string }[];
  collected_count: number;
  eth_spent: string;
  usdc_spent: string;
}

export interface CollectorsStatsResponse {
  collectors: CollectorStats[];
  page: number;
}
