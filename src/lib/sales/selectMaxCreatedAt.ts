import { selectMax } from '@/lib/supabase/in_process_sales/selectMax';

export async function selectMaxCreatedAt(): Promise<number | null> {
  const maxCreatedAt = await selectMax('created_at');
  if (!maxCreatedAt) return null;
  return new Date(maxCreatedAt).getTime();
}
