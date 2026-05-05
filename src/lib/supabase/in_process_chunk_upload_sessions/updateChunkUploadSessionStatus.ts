import { supabase } from '@/lib/supabase/client';

type ChunkUploadSessionStatus =
  | 'open'
  | 'completing'
  | 'done'
  | 'failed'
  | 'expired';

const updateChunkUploadSessionStatus = async (params: {
  id: string;
  from: ChunkUploadSessionStatus;
  to: ChunkUploadSessionStatus;
  extra?: Partial<{ completed_at: string }>;
}) =>
  supabase
    .from('in_process_chunk_upload_sessions')
    .update({ status: params.to, ...params.extra })
    .eq('id', params.id)
    .eq('status', params.from)
    .select('*');

export default updateChunkUploadSessionStatus;
