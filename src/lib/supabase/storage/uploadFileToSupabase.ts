import { supabase } from '@/lib/supabase/client';
import { SUPABASE_STORAGE_BUCKET } from '@/lib/consts';
import { v4 as uuidv4 } from 'uuid';

const uploadFileToSupabase = async (file: File): Promise<string> => {
  const safeFile = file.name
    ? file
    : new File([file], 'upload', { type: file.type });
  const ext = safeFile.name.split('.').pop();
  const path = ext ? `${uuidv4()}.${ext}` : uuidv4();
  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(path, safeFile, { contentType: safeFile.type, upsert: false });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  return supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(path).data
    .publicUrl;
};

export default uploadFileToSupabase;
