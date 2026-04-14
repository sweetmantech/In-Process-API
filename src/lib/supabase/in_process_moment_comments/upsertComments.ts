import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function upsertComments(
  comments: Array<
    Database['public']['Tables']['in_process_moment_comments']['Insert']
  >
): Promise<void> {
  if (!comments.length) return;
  const { error } = await supabase
    .from('in_process_moment_comments')
    .upsert(comments, { onConflict: 'id' });
  if (error) throw error;
}
