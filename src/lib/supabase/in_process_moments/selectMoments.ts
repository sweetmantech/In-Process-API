import { supabase } from '../client';
import { Moment } from '@/types/moment';
import type { Database } from '@/lib/supabase/types';
import {
  momentsWithCollectionAndMetadataQuery,
  momentsWithCollectionQuery,
} from './queries';

type MomentRow = Database['public']['Tables']['in_process_moments']['Row'];

export type MomentWithCollection = Omit<MomentRow, 'collection'> & {
  collection: {
    id: string;
    address: string;
    chain_id: number;
    creator: string;
    protocol: string;
  };
};

export type MomentMetadata = {
  image: string | null;
  name: string | null;
  description: string | null;
  external_url: string | null;
  animation_url: string | null;
  content: unknown;
};

export type SelectedMoment = MomentWithCollection & {
  metadata?: MomentMetadata;
};

type SelectMomentsArgs = {
  moments?: Moment[];
  artists?: string[];
  chainId?: number;
  limit?: number;
  includeMetadata?: boolean;
};

async function selectMoments(args: SelectMomentsArgs = {}): Promise<{
  data: SelectedMoment[] | null;
  error: { message: string } | null;
}> {
  const includeMetadata = args.includeMetadata === true;

  let query = supabase
    .from('in_process_moments')
    .select(
      includeMetadata
        ? momentsWithCollectionAndMetadataQuery
        : momentsWithCollectionQuery
    );

  if (args.moments?.length) {
    query = query
      .in(
        'collection.address',
        args.moments.map((m) => m.collectionAddress.toLowerCase())
      )
      .in(
        'token_id',
        args.moments.map((m) => Number(m.tokenId))
      );
  }

  if (args.artists) query = query.in('collection.creator', args.artists);
  if (args.chainId) query = query.eq('collection.chain_id', args.chainId);
  if (args.limit) query = query.limit(args.limit);
  else query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) return { data: null, error };

  return {
    data: (data ?? []) as any,
    error: null,
  };
}

export default selectMoments;
