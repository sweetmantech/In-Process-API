import { supabase } from '@/lib/supabase/client';

const getChunkUploadSession = async (id: string) =>
  supabase
    .from('in_process_chunk_upload_sessions')
    .select('id, status, expires_at, artist_address, total_chunks')
    .eq('id', id)
    .single();

export default getChunkUploadSession;
