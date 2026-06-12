import { supabase } from '@/lib/supabase/client';
import { SUPABASE_STORAGE_BUCKET } from '@/lib/consts';

const BUCKET_PREFIX = `/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/`;

const deleteFileFromSupabase = async (publicUrl: string): Promise<void> => {
  const idx = publicUrl.indexOf(BUCKET_PREFIX);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + BUCKET_PREFIX.length);
  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .remove([path]);
  if (error) throw new Error(`Supabase delete failed: ${error.message}`);
};

export default deleteFileFromSupabase;
