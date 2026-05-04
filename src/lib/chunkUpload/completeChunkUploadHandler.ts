import { Buffer } from 'node:buffer';
import { NextResponse } from 'next/server';
import blobDel from '@/lib/vercel-blob/blobDel';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import markChunkUploadSessionCompleting from '@/lib/supabase/in_process_chunk_upload_sessions/markChunkUploadSessionCompleting';
import revertChunkUploadSessionOpen from '@/lib/supabase/in_process_chunk_upload_sessions/revertChunkUploadSessionOpen';
import deleteChunkUploadSession from '@/lib/supabase/in_process_chunk_upload_sessions/deleteChunkUploadSession';
import listChunkUploadParts from '@/lib/supabase/in_process_chunk_upload_parts/listChunkUploadParts';
import { chunkUploadMaxTotalBytes } from '@/lib/chunkUpload/chunkUploadMaxPartBytes';
import blobGetBuffer from '@/lib/vercel-blob/blobGetBuffer';

const completeChunkUploadHandler = async (sessionId: string) => {
  const { data: locked, error: lockErr } =
    await markChunkUploadSessionCompleting(sessionId, 'open');

  if (lockErr || !locked) {
    return NextResponse.json(
      { message: 'Upload session is not available for completion' },
      { status: 409 }
    );
  }

  const fail = async (status: number, message: string) => {
    const { error } = await revertChunkUploadSessionOpen(sessionId);
    if (error) console.error('revertChunkUploadSessionOpen', error);
    return NextResponse.json({ message }, { status });
  };

  try {
    const { data: parts, error: partsErr } =
      await listChunkUploadParts(sessionId);
    if (partsErr || !parts) {
      console.error('listChunkUploadParts', partsErr);
      return fail(500, 'Failed to read chunks');
    }

    if (parts.length !== locked.total_chunks) {
      return fail(
        400,
        `Expected ${locked.total_chunks} chunks, got ${parts.length}`
      );
    }

    for (let i = 0; i < parts.length; i++) {
      if (parts[i].chunk_index !== i) {
        return fail(400, 'Missing or out-of-order chunk indices');
      }
    }

    let sum = 0;
    const buffers: Buffer[] = [];
    for (const p of parts) {
      let buf: Buffer;
      try {
        buf = await blobGetBuffer(p.blob_url);
      } catch (e: unknown) {
        console.error('blobGetBuffer', e);
        return fail(500, 'Failed to read chunk from blob storage');
      }
      if (buf.length !== p.byte_length) {
        return fail(400, 'Chunk blob size mismatch');
      }
      sum += p.byte_length;
      buffers.push(buf);
    }

    if (locked.total_size_bytes !== null && sum !== locked.total_size_bytes) {
      return fail(400, 'Total size does not match total_size_bytes');
    }

    const fileBuf = Buffer.concat(buffers);
    if (fileBuf.length !== sum) {
      return fail(400, 'Assembled file size mismatch');
    }

    if (fileBuf.length > chunkUploadMaxTotalBytes) {
      return fail(
        400,
        `Assembled file exceeds max size of ${chunkUploadMaxTotalBytes} bytes`
      );
    }

    const file = new File([fileBuf], locked.filename, {
      type: locked.content_type,
    });
    const uri = await uploadToArweave(file);

    const blobUrls = parts.map((p) => p.blob_url);
    try {
      await blobDel(blobUrls);
    } catch (e: unknown) {
      console.error('del chunk blobs', e);
    }

    const { error: delErr } = await deleteChunkUploadSession(sessionId);
    if (delErr) console.error('deleteChunkUploadSession', delErr);

    return NextResponse.json({ uri });
  } catch (e: unknown) {
    const { error } = await revertChunkUploadSessionOpen(sessionId);
    if (error) console.error('revertChunkUploadSessionOpen', error);
    const message = e instanceof Error ? e.message : 'Upload failed';
    return NextResponse.json({ message }, { status: 500 });
  }
};

export default completeChunkUploadHandler;
