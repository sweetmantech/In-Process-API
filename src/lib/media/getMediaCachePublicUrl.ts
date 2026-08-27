import { supabase } from '@/lib/supabase/client';
import { SUPABASE_STORAGE_BUCKET } from '@/lib/consts';

const getMediaCachePublicUrl = (path: string) =>
  supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(path).data
    .publicUrl;

export default getMediaCachePublicUrl;
