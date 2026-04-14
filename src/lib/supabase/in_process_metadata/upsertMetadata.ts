import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function upsertMetadata(
  metadata: Array<Database['public']['Tables']['in_process_metadata']['Insert']>
): Promise<void> {
  if (!metadata.length) return;
  const { error } = await supabase
    .from('in_process_metadata')
    .upsert(metadata, { onConflict: 'moment' });
  if (error) throw error;
}
