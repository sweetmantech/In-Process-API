import { selectMax } from '@/lib/supabase/in_process_admins/selectMax';

export async function selectMaxGrantedAt(): Promise<number | null> {
  const maxGrantedAt = await selectMax('granted_at');
  if (!maxGrantedAt) return null;
  return new Date(maxGrantedAt).getTime();
}
