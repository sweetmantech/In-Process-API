import { supabase } from '@/lib/supabase/client';

const deleteChunkUploadSession = async (id: string) =>
  supabase.from('in_process_chunk_upload_sessions').delete().eq('id', id);

export default deleteChunkUploadSession;
