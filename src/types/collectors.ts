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
  collector: string;
  username: string | null;
  collected_count: number;
  eth_spent: string;
  usdc_spent: string;
}

export interface CollectorsStatsResponse {
  data: CollectorStats[];
  total_count: number;
  page: number;
  total_pages: number;
}
