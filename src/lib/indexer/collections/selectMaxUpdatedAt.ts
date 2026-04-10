import { selectMax } from '@/lib/supabase/in_process_collections/selectMax';

export async function selectMaxUpdatedAt(): Promise<number | null> {
  const maxUpdatedAt = await selectMax('updated_at');
  if (!maxUpdatedAt) return null;
  return new Date(maxUpdatedAt).getTime();
}
