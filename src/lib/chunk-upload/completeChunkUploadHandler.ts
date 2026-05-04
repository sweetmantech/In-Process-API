import { NextResponse } from 'next/server';
import blobDel from '@/lib/vercel-blob/blobDel';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import updateChunkUploadSessionStatus from '@/lib/supabase/in_process_chunk_upload_sessions/updateChunkUploadSessionStatus';
import listChunkUploadParts from '@/lib/supabase/in_process_chunk_upload_parts/listChunkUploadParts';
import { chunkUploadMaxTotalBytes } from '@/lib/chunk-upload/chunkUploadMaxPartBytes';
import getFileFromBlobs from '@/lib/chunk-upload/getFileFromBlobs';

const completeChunkUploadHandler = async (sessionId: string) => {
  try {
    const { data, error: lockErr } = await updateChunkUploadSessionStatus({
      id: sessionId,
      from: 'open',
      to: 'completing',
    });
    const locked = data?.[0];

    if (lockErr || !locked) {
      if (lockErr)
        console.error('updateChunkUploadSessionStatus lock', lockErr);
      throw new Error('Upload session is not available for completion');
    }

    const { data: parts, error: partsErr } =
      await listChunkUploadParts(sessionId);
    if (partsErr || !parts) {
      console.error('listChunkUploadParts', partsErr);
      throw new Error('Failed to read chunks');
    }

    const contiguous =
      parts.length === locked.total_chunks &&
      parts.every((row, idx) => row.chunk_index === idx);
    if (!contiguous) {
      throw new Error(
        parts.length !== locked.total_chunks
          ? `Expected ${locked.total_chunks} chunks, got ${parts.length}`
          : 'Missing or out-of-order chunk indices'
      );
    }

    const assembled = await getFileFromBlobs(parts, {
      filename: locked.filename,
      contentType: locked.content_type,
      totalSizeBytes: locked.total_size_bytes,
      maxTotalBytes: chunkUploadMaxTotalBytes,
    });
    if (!assembled.ok) {
      throw new Error(assembled.message);
    }

    const uri = await uploadToArweave(assembled.file);

    await blobDel(parts.map((p) => p.blob_url)).catch((e: unknown) =>
      console.error('del chunk blobs', e)
    );

    const { error: doneErr } = await updateChunkUploadSessionStatus({
      id: sessionId,
      from: 'completing',
      to: 'done',
      extra: { completed_at: new Date().toISOString() },
    });
    if (doneErr) console.error('updateChunkUploadSessionStatus done', doneErr);

    return NextResponse.json({ uri });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Upload failed';
    const { error } = await updateChunkUploadSessionStatus({
      id: sessionId,
      from: 'completing',
      to: 'open',
    });
    if (error) console.error('updateChunkUploadSessionStatus revert', error);
    return NextResponse.json({ message }, { status: 500 });
  }
};

export default completeChunkUploadHandler;
