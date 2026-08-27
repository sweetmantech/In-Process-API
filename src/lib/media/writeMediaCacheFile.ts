import { supabase } from '@/lib/supabase/client';
import { SUPABASE_STORAGE_BUCKET } from '@/lib/consts';

const writeMediaCacheFile = async (
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<void> => {
  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(path, buffer, { contentType, upsert: true });
  if (error) {
    console.error('Media cache upload failed:', error.message);
  }
};

export default writeMediaCacheFile;
