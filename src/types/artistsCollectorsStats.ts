export type ArtistsCollectorsStatsSortBy =
  | 'total_created_count'
  | 'total_collected_count';

export type ArtistsCollectorsStatsSortOrder = 'asc' | 'desc';

export interface ArtistsCollectorsStatsParams {
  period?: 'day' | 'week' | 'month' | 'all';
  limit?: number;
  page?: number;
  artist?: string;
  sort_by?: ArtistsCollectorsStatsSortBy;
  sort_order?: ArtistsCollectorsStatsSortOrder;
}

export interface ArtistsCollectorsStats {
  artist_id: string;
  username: string;
  wallets: { address: string; type: string }[];
  total_created_count: number;
  total_collected_count: number;
}

export interface ArtistsCollectorsStatsResponse {
  artists: ArtistsCollectorsStats[];
  page: number;
}
