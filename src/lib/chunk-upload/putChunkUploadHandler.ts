import { NextRequest, NextResponse } from 'next/server';
import blobDel from '@/lib/vercel-blob/blobDel';
import blobPut from '@/lib/vercel-blob/blobPut';
import insertChunkUploadPart from '@/lib/supabase/in_process_chunk_upload_parts/insertChunkUploadPart';
import { CHUNK_UPLOAD_MAX_PART_BYTES } from '@/lib/consts';
import chunkUploadBlobPathname from '@/lib/chunk-upload/chunkUploadBlobPathname';
import type { Database } from '@/lib/supabase/types';

/** Only `getChunkUploadSession` fields plus what this handler reads: `total_chunks`. */
type SessionForPutChunk = Pick<
  Database['public']['Tables']['in_process_chunk_upload_sessions']['Row'],
  'id' | 'total_chunks'
>;

const putChunkUploadHandler = async (
  req: NextRequest,
  session: SessionForPutChunk,
  chunkIndex: number
) => {
  try {
    const buffer = await req.arrayBuffer().catch(() => undefined);
    if (buffer === undefined) {
      throw new Error('Invalid request body');
    }

    const n = buffer.byteLength;
    if (n === 0) {
      throw new Error('Chunk body must not be empty');
    }
    if (n > CHUNK_UPLOAD_MAX_PART_BYTES) {
      throw new Error(
        `Chunk exceeds max size of ${CHUNK_UPLOAD_MAX_PART_BYTES} bytes`
      );
    }

    const isLast = chunkIndex === session.total_chunks - 1;
    if (!isLast && n !== CHUNK_UPLOAD_MAX_PART_BYTES) {
      throw new Error(
        `Non-final chunks must be exactly ${CHUNK_UPLOAD_MAX_PART_BYTES} bytes`
      );
    }

    const pathname = chunkUploadBlobPathname(session.id, chunkIndex);

    const blobUrl = await blobPut(pathname, buffer).catch((e: unknown) => {
      console.error('vercel blob put', e);
      return undefined;
    });
    if (blobUrl === undefined) {
      throw new Error('Failed to store chunk in blob');
    }

    const { error } = await insertChunkUploadPart({
      session_id: session.id,
      chunk_index: chunkIndex,
      byte_length: n,
      blob_url: blobUrl,
    });

    if (error) {
      if (error.code === '23505') {
        // Blob path is deterministic (addRandomSuffix: false), so del(blobUrl) would
        // delete the original valid chunk — skip deletion and just throw.
        throw new Error('This chunk index was already uploaded');
      }
      await blobDel(blobUrl).catch((delErr: unknown) =>
        console.error('del orphaned chunk blob', delErr)
      );
      console.error('insertChunkUploadPart', error);
      throw new Error('Failed to store chunk');
    }

    return NextResponse.json({
      ok: true,
      chunk_index: chunkIndex,
      byte_length: n,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ message }, { status: 500 });
  }
};

export default putChunkUploadHandler;
