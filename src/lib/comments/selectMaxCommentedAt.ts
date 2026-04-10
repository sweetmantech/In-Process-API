import { selectMax } from '@/lib/supabase/in_process_moment_comments/selectMax';

export async function selectMaxCommentedAt(): Promise<number | null> {
  const maxCommentedAt = await selectMax('commented_at');
  if (!maxCommentedAt) return null;
  return new Date(maxCommentedAt).getTime();
}
