export type ActiveArtistsSortBy =
  | 'created_count'
  | 'airdropped_count'
  | 'telegram_count'
  | 'web_count'
  | 'api_count'
  | 'sms_count';

export type ActiveArtistsSortOrder = 'asc' | 'desc';

export interface ActiveArtistsStatsParams {
  period?: 'day' | 'week' | 'month' | 'all';
  limit?: number;
  page?: number;
  artist?: string;
  sort_by?: ActiveArtistsSortBy;
  sort_order?: ActiveArtistsSortOrder;
}

export interface ActiveArtistStats {
  address: string;
  username: string;
  created_count: number;
  airdropped_count: number;
  telegram_count: number;
  web_count: number;
  api_count: number;
  sms_count: number;
}

export interface ActiveArtistsStatsResponse {
  data: ActiveArtistStats[];
  total_count: number;
  page: number;
  total_pages: number;
}
