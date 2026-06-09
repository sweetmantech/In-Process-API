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
  address: string;
  username: string;
  total_created_count: number;
  total_collected_count: number;
}

export interface ArtistsCollectorsStatsResponse {
  data: ArtistsCollectorsStats[];
  total_count: number;
  page: number;
  total_pages: number;
}
