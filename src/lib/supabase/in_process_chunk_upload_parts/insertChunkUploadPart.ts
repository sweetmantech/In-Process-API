import { supabase } from '@/lib/supabase/client';

const insertChunkUploadPart = async (row: {
  session_id: string;
  chunk_index: number;
  byte_length: number;
  blob_url: string;
}) => supabase.from('in_process_chunk_upload_parts').insert(row);

export default insertChunkUploadPart;
