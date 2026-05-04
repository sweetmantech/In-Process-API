import { supabase } from '@/lib/supabase/client';

const markChunkUploadSessionCompleting = async (
  id: string,
  fromStatus: 'open'
) =>
  supabase
    .from('in_process_chunk_upload_sessions')
    .update({ status: 'completing' })
    .eq('id', id)
    .eq('status', fromStatus)
    .select('*')
    .single();

export default markChunkUploadSessionCompleting;
