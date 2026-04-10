import { selectMax } from '@/lib/supabase/in_process_collectors/selectMax';

export async function selectMaxCollectedAt(): Promise<number | null> {
  const maxCollectedAt = await selectMax('collected_at');
  if (!maxCollectedAt) return null;
  return new Date(maxCollectedAt).getTime();
}
