import { supabase } from '@/lib/supabase/client';

const deleteMediaCache = async (hashes: string[]): Promise<void> => {
  if (hashes.length === 0) return;
  const { error } = await supabase
    .from('in_process_media_cache')
    .delete()
    .in('hash', hashes);
  if (error)
    throw new Error(`Failed to delete media cache rows: ${error.message}`);
};

export default deleteMediaCache;
