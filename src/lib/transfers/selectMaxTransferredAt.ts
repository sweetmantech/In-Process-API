import { selectMax } from '@/lib/supabase/in_process_transfers/selectMax';

export async function selectMaxTransferredAt(): Promise<number | null> {
  const maxTransferredAt = await selectMax('transferred_at');
  if (!maxTransferredAt) return null;
  return new Date(maxTransferredAt).getTime();
}
