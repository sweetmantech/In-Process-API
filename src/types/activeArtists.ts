export interface ActiveArtistsStatsParams {
  period?: 'day' | 'week' | 'month' | 'all';
  limit?: number;
  page?: number;
  artist?: string;
}

export interface ActiveArtistStats {
  address: string;
  username: string;
  moments_created: number;
  airdropped: number;
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
