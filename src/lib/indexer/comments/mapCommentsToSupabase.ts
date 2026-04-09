import toSupabaseTimestamp from '@/lib/indexer/toSupabaseTimestamp';
import type { InProcess_Moment_Comments_t } from '@/types/envio';
import type { Database } from '@/lib/supabase/types';
import { getMomentIdMap } from '@/lib/indexer/moments/getMomentIdMap';

export async function mapCommentsToSupabase(
  momentComments: InProcess_Moment_Comments_t[]
): Promise<
  Database['public']['Tables']['in_process_moment_comments']['Insert'][]
> {
  const mappedComments: Array<
    Database['public']['Tables']['in_process_moment_comments']['Insert']
  > = [];
  const momentIdMap = await getMomentIdMap(momentComments);

  for (const comment of momentComments) {
    const tripletKey = `${comment.collection.toLowerCase()}:${comment.chain_id}:${comment.token_id}`;
    const momentId = momentIdMap.get(tripletKey);
    if (momentId) {
      mappedComments.push({
        moment: momentId,
        artist_address: comment.sender.toLowerCase(),
        comment: comment.comment ?? null,
        commented_at: toSupabaseTimestamp(comment.commented_at),
      });
    }
  }

  return mappedComments;
}
