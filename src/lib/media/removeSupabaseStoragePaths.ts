import { supabase } from '@/lib/supabase/client';
import { SUPABASE_STORAGE_BUCKET } from '@/lib/consts';

const removeSupabaseStoragePaths = async (paths: string[]): Promise<number> => {
  if (paths.length === 0) return 0;
  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .remove(paths);
  if (error)
    throw new Error(`Failed to delete storage paths: ${error.message}`);
  return paths.length;
};

export default removeSupabaseStoragePaths;
