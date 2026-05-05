import getCompletedFreeUploads from '@/lib/supabase/in_process_chunk_upload_sessions/getCompletedFreeUploads';
import { FREE_TIER_MAX_BYTES, FREE_UPLOADS_PER_MONTH } from '@/lib/consts';

type ChunkUploadType =
  | { uploadType: 'free' }
  | { uploadType: 'paid' }
  | { error: string; status: 400 | 500 };

const getChunkUploadType = async (
  artistAddress: string,
  totalSizeBytes: number | undefined
): Promise<ChunkUploadType> => {
  if (totalSizeBytes !== undefined && totalSizeBytes >= FREE_TIER_MAX_BYTES) {
    return { uploadType: 'paid' };
  }

  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();
  const monthEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  ).toISOString();

  const { count, error } = await getCompletedFreeUploads(
    artistAddress,
    monthStart,
    monthEnd
  );
  if (error) {
    console.error('getCompletedFreeUploads', error);
    return { error: 'Failed to check upload quota', status: 500 };
  }

  if ((count ?? 0) >= FREE_UPLOADS_PER_MONTH) {
    if (totalSizeBytes === undefined) {
      return {
        error:
          'total_size_bytes is required when the free tier limit is reached',
        status: 400,
      };
    }
    return { uploadType: 'paid' };
  }

  return { uploadType: 'free' };
};

export default getChunkUploadType;
