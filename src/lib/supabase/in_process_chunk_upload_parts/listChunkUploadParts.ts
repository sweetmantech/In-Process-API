import { supabase } from '@/lib/supabase/client';

const listChunkUploadParts = async (sessionId: string) =>
  supabase
    .from('in_process_chunk_upload_parts')
    .select('chunk_index, byte_length, blob_url')
    .eq('session_id', sessionId)
    .order('chunk_index', { ascending: true });

export default listChunkUploadParts;
