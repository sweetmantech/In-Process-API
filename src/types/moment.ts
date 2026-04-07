import { Address, Hash } from 'viem';

export interface Moment {
  collectionAddress: Address;
  tokenId: string;
  chainId: number;
}

export interface MomentCommentsResult {
  comments: MintComment[];
}

export interface MintComment {
  id: string;
  username: string;
  sender: string;
  comment: string;
  timestamp: number;
}

export interface MomentMetadata {
  image: string;
  name: string;
  description: string;
  external_url?: string;
  content: {
    mime: string;
    uri: string;
  };
  animation_url?: string;
}

export enum MomentType {
  Erc20Mint = 'erc20Mint',
  TimedMint = 'timed',
  FixedPriceMint = 'fixedPrice',
}

export interface TimelineMoment {
  address: string;
  token_id: string;
  chain_id: number;
  protocol: string;
  id: string;
  uri: string;
  creator: {
    address: string;
    username: string | null;
    hidden: boolean;
  };
  admins: Array<{
    address: string;
    hidden: boolean;
  }>;
  created_at: string;
  metadata: MomentMetadata | null;
}

export interface TimelinePagination {
  page: number;
  limit: number;
  total_pages: number;
}

export interface GetInProcessTimelineParams {
  limit?: number;
  page?: number;
  chainId?: number;
  hidden?: boolean;
  mime?: string;
  period?: string;
  channel?: string;
  curated?: boolean;
}

export interface GetInProcessTimelineResponse {
  moments: TimelineMoment[];
  pagination: TimelinePagination;
}

export interface GetArtistTimelineParams {
  artist: string;
  type?: 'mutual' | 'default' | null;
  limit?: number;
  page?: number;
  chainId?: number;
  hidden?: boolean;
  mime?: string;
  period?: string;
  channel?: string;
  curated?: boolean;
}

export interface GetArtistTimelineResponse {
  moments: TimelineMoment[];
  pagination: TimelinePagination;
}

export interface GetCollectionTimelineParams {
  collection: string;
  limit?: number;
  page?: number;
  chainId?: number;
  hidden?: boolean;
  mime?: string;
  period?: string;
  channel?: string;
  artist?: string;
  curated?: boolean;
}

export interface GetCollectionTimelineResponse {
  moments: TimelineMoment[];
  pagination: TimelinePagination;
}

export type MomentSaleConfig = {
  pricePerToken: string;
  saleStart: number;
  saleEnd: number;
  maxTokensPerAddress: number;
  fundsRecipient: Address;
  type: MomentType;
};

export type MomentResponse = {
  uri: string | null;
  owner: string | null;
  saleConfig: MomentSaleConfig | null;
  momentAdmins: string[];
  metadata: MomentMetadata;
};

export type MomentAdvancedInfo = {
  id: string | null;
  uri: string | null;
  owner: string | null;
  saleConfig: MomentSaleConfig | null;
};

export interface UpdateMomentURIInput {
  moment: Moment;
  newUri: string;
  artistAddress: Address;
}

export interface UpdateMomentURIResult {
  hash: Hash;
  chainId: number;
}

export interface MigrateMomentsApiInput {
  chainId?: number;
}

export interface MigrateMomentsResult {
  hash: Hash;
  chainId: number;
}

export interface MigrateMomentsApiResult {
  message: string;
  results: MigrateMomentsResult[];
}
