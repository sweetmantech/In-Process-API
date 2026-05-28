import { supabase } from '@/lib/supabase/client';

export async function deleteApiKey(keyId: string): Promise<void> {
  const { error } = await supabase
    .from('in_process_api_keys')
    .delete()
    .eq('id', keyId);
  if (error) throw error;
}
