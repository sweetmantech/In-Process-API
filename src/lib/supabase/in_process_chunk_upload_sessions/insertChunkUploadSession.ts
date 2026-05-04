import { supabase } from '@/lib/supabase/client';

const insertChunkUploadSession = async (row: {
  artist_address: string;
  filename: string;
  content_type: string;
  total_chunks: number;
  total_size_bytes: number | null;
}) =>
  supabase
    .from('in_process_chunk_upload_sessions')
    .insert(row)
    .select('id')
    .single();

export default insertChunkUploadSession;
