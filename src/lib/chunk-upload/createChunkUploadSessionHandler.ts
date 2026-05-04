import { NextResponse } from 'next/server';
import type { Address } from 'viem';
import insertChunkUploadSession from '@/lib/supabase/in_process_chunk_upload_sessions/insertChunkUploadSession';
import topUpTurboCredits from '@/lib/arweave/topUpTurboCredits';
import {
  CHUNK_UPLOAD_MAX_PART_BYTES,
  CHUNK_UPLOAD_MAX_CHUNK_COUNT,
  CHUNK_UPLOAD_MAX_TOTAL_BYTES,
} from '@/lib/consts';

const createChunkUploadSessionHandler = async (
  artistAddress: string,
  data: {
    filename: string;
    content_type: string;
    total_chunks: number;
    total_size_bytes?: number;
    uploadType: 'free' | 'paid';
    usdcAmount?: number;
  }
) => {
  if (data.uploadType === 'paid') {
    await topUpTurboCredits(artistAddress as Address, data.usdcAmount!);
  }

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
    chunk_size_bytes: CHUNK_UPLOAD_MAX_PART_BYTES,
    max_total_bytes: CHUNK_UPLOAD_MAX_TOTAL_BYTES,
    max_chunks: CHUNK_UPLOAD_MAX_CHUNK_COUNT,
  });
};

export default createChunkUploadSessionHandler;
