import { supabase } from '@/lib/supabase/client';
import { SUPABASE_STORAGE_BUCKET } from '@/lib/consts';
import { v4 as uuidv4 } from 'uuid';

const uploadBufferToSupabase = async (
  buffer: Buffer,
  contentType: string
): Promise<string> => {
  const path = uuidv4();
  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(path, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  return supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(path).data
    .publicUrl;
};

export default uploadBufferToSupabase;
