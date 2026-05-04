import { NextResponse } from 'next/server';
import insertChunkUploadSession from '@/lib/supabase/in_process_chunk_upload_sessions/insertChunkUploadSession';
import chunkUploadMaxPartBytes, {
  chunkUploadMaxChunkCount,
  chunkUploadMaxTotalBytes,
} from '@/lib/chunk-upload/chunkUploadMaxPartBytes';

const createChunkUploadSessionHandler = async (
  artistAddress: string,
  data: {
    filename: string;
    content_type: string;
    total_chunks: number;
    total_size_bytes?: number;
  }
) => {
  const { data: row, error } = await insertChunkUploadSession({
    artist_address: artistAddress.toLowerCase(),
    filename: data.filename,
    content_type: data.content_type,
    total_chunks: data.total_chunks,
    total_size_bytes: data.total_size_bytes ?? null,
  });

  if (error || !row?.id) {
    if (error) console.error('insertChunkUploadSession', error);
    return NextResponse.json(
      { message: 'Failed to create upload session' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    session_id: row.id,
    chunk_size_bytes: chunkUploadMaxPartBytes,
    max_total_bytes: chunkUploadMaxTotalBytes,
    max_chunks: chunkUploadMaxChunkCount,
  });
};

export default createChunkUploadSessionHandler;
