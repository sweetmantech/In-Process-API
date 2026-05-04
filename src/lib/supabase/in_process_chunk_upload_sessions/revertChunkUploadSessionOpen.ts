import { supabase } from '@/lib/supabase/client';

const revertChunkUploadSessionOpen = async (id: string) =>
  supabase
    .from('in_process_chunk_upload_sessions')
    .update({ status: 'open' })
    .eq('id', id)
    .eq('status', 'completing');

export default revertChunkUploadSessionOpen;
