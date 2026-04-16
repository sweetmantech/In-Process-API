import { supabase } from '@/lib/supabase/client';
import type {
  GetCollectionTimelineParams,
  GetCollectionTimelineResponse,
} from '@/types/moment';

const getCollectionTimeline = async ({
  collection,
  limit = 100,
  page = 1,
  chainId,
  hidden = false,
  mime,
  period,
  channel,
  artist,
  curated = false,
}: GetCollectionTimelineParams): Promise<{
  data: GetCollectionTimelineResponse | null;
  error: Error | null;
}> => {
  const { data, error } = await supabase.rpc('get_collection_timeline', {
    p_collection: collection,
    p_limit: limit,
    p_page: page,
    p_chainid: chainId as number | undefined,
    p_hidden: hidden,
    p_mime: mime,
    p_period: period,
    p_channel: channel,
    p_artist: artist,
    p_curated: curated,
  });

  if (error) {
    return { data: null, error };
  }

  return {
    data: data as unknown as GetCollectionTimelineResponse,
    error: null,
  };
};

export default getCollectionTimeline;
