import { NextRequest, NextResponse } from 'next/server';
import { del, put } from '@vercel/blob';
import insertChunkUploadPart from '@/lib/supabase/in_process_chunk_upload_parts/insertChunkUploadPart';
import chunkUploadMaxPartBytes from '@/lib/chunkUpload/chunkUploadMaxPartBytes';
import chunkUploadBlobPathname from '@/lib/chunkUpload/chunkUploadBlobPathname';
import type { Database } from '@/lib/supabase/types';

type SessionRow =
  Database['public']['Tables']['in_process_chunk_upload_sessions']['Row'];

const putChunkUploadHandler = async (
  req: NextRequest,
  session: SessionRow,
  chunkIndex: number
) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { message: 'BLOB_READ_WRITE_TOKEN is not configured' },
      { status: 503 }
    );
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await req.arrayBuffer();
  } catch {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 }
    );
  }

  const n = buffer.byteLength;
  if (n === 0) {
    return NextResponse.json(
      { message: 'Chunk body must not be empty' },
      { status: 400 }
    );
  }
  if (n > chunkUploadMaxPartBytes) {
    return NextResponse.json(
      { message: `Chunk exceeds max size of ${chunkUploadMaxPartBytes} bytes` },
      { status: 413 }
    );
  }

  const isLast = chunkIndex === session.total_chunks - 1;
  if (!isLast && n !== chunkUploadMaxPartBytes) {
    return NextResponse.json(
      {
        message: `Non-final chunks must be exactly ${chunkUploadMaxPartBytes} bytes`,
      },
      { status: 400 }
    );
  }

  const pathname = chunkUploadBlobPathname(session.id, chunkIndex);

  let blobUrl: string;
  try {
    const blob = await put(pathname, buffer, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/octet-stream',
    });
    blobUrl = blob.url;
  } catch (e: unknown) {
    console.error('vercel blob put', e);
    return NextResponse.json(
      { message: 'Failed to store chunk in blob' },
      { status: 500 }
    );
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
      // delete the original valid chunk — skip deletion and just return 409.
      return NextResponse.json(
        { message: 'This chunk index was already uploaded' },
        { status: 409 }
      );
    }
    await del(blobUrl).catch((delErr: unknown) =>
      console.error('del orphaned chunk blob', delErr)
    );
    console.error('insertChunkUploadPart', error);
    return NextResponse.json(
      { message: 'Failed to store chunk' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    chunk_index: chunkIndex,
    byte_length: n,
  });
};

export default putChunkUploadHandler;
