import { supabase } from '../client';
import type { MintComment } from '@/types/moment';

export const COMMENTS_PAGE_SIZE = 20;
export const REPLY_PREVIEW = 3;

type RpcResult = {
  comments: MintComment[];
};

const getMomentCommentsRpc = async ({
  momentId,
  offset,
  replyToId,
}: {
  momentId: string;
  offset: number;
  replyToId?: string;
}): Promise<MintComment[]> => {
  const { data, error } = await supabase.rpc('get_moment_comments', {
    p_moment_id: momentId,
    p_offset: offset,
    p_limit: COMMENTS_PAGE_SIZE,
    ...(replyToId ? { p_reply_to_id: replyToId } : {}),
    p_reply_preview: REPLY_PREVIEW,
  });

  if (error) throw error;

  const result = data as unknown as RpcResult | null;
  return result?.comments ?? [];
};

export default getMomentCommentsRpc;
