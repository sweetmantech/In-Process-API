import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/consts', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  return {
    ...original,
    CHUNK_UPLOAD_MAX_PART_BYTES: 100,
    CHUNK_UPLOAD_MAX_TOTAL_BYTES: 1000,
    CHUNK_UPLOAD_MAX_CHUNK_COUNT: 10,
  };
});

vi.mock('@/lib/vercel-blob/blobPut', () => ({ default: vi.fn() }));
vi.mock('@/lib/vercel-blob/blobDel', () => ({ default: vi.fn() }));
vi.mock(
  '@/lib/supabase/in_process_chunk_upload_parts/insertChunkUploadPart',
  () => ({ default: vi.fn() })
);

import blobPut from '@/lib/vercel-blob/blobPut';
import blobDel from '@/lib/vercel-blob/blobDel';
import insertChunkUploadPart from '@/lib/supabase/in_process_chunk_upload_parts/insertChunkUploadPart';
import patchChunkUploadHandler from '@/lib/chunk-upload/patchChunkUploadHandler';

const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';

const makeReq = (body: ArrayBuffer) =>
  new NextRequest('http://localhost/api/upload/chunk', {
    method: 'PATCH',
    body,
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(blobPut).mockResolvedValue('https://blob.example/p');
  vi.mocked(insertChunkUploadPart).mockResolvedValue({ error: null } as any);
});

describe('patchChunkUploadHandler', () => {
  const sessionTwo = { id: SESSION_ID, total_chunks: 2 };

  it('returns 500 for empty chunk body', async () => {
    const res = await patchChunkUploadHandler(
      makeReq(new ArrayBuffer(0)),
      sessionTwo,
      0
    );
    expect(res.status).toBe(500);
    const j = await res.json();
    expect(j.message).toMatch(/empty/i);
  });

  it('returns 500 when chunk exceeds max part size', async () => {
    const res = await patchChunkUploadHandler(
      makeReq(new Uint8Array(101).buffer),
      sessionTwo,
      0
    );
    expect(res.status).toBe(500);
    const j = await res.json();
    expect(j.message).toMatch(/exceeds max size/);
  });

  it('returns 500 when non-final chunk is not exactly max part size', async () => {
    const res = await patchChunkUploadHandler(
      makeReq(new Uint8Array(50).buffer),
      sessionTwo,
      0
    );
    expect(res.status).toBe(500);
    const j = await res.json();
    expect(j.message).toMatch(/Non-final chunks/);
  });

  it('allows non-final chunk of exact max size', async () => {
    const res = await patchChunkUploadHandler(
      makeReq(new Uint8Array(100).buffer),
      sessionTwo,
      0
    );
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.chunk_index).toBe(0);
    expect(j.byte_length).toBe(100);
  });

  it('allows final chunk smaller than max part size', async () => {
    const res = await patchChunkUploadHandler(
      makeReq(new Uint8Array(7).buffer),
      sessionTwo,
      1
    );
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.byte_length).toBe(7);
  });

  it('returns 500 when blob put fails', async () => {
    vi.mocked(blobPut).mockRejectedValueOnce(new Error('network'));

    const res = await patchChunkUploadHandler(
      makeReq(new Uint8Array(100).buffer),
      sessionTwo,
      0
    );
    expect(res.status).toBe(500);
    const j = await res.json();
    expect(j.message).toMatch(/blob/i);
  });

  it('returns 500 on duplicate chunk without deleting blob', async () => {
    vi.mocked(insertChunkUploadPart).mockResolvedValueOnce({
      error: { code: '23505' },
    } as any);

    const res = await patchChunkUploadHandler(
      makeReq(new Uint8Array(100).buffer),
      sessionTwo,
      0
    );
    expect(res.status).toBe(500);
    expect(blobDel).not.toHaveBeenCalled();
  });

  it('deletes blob and returns 500 on other insert errors', async () => {
    vi.mocked(insertChunkUploadPart).mockResolvedValueOnce({
      error: { code: '23503' },
    } as any);

    const res = await patchChunkUploadHandler(
      makeReq(new Uint8Array(100).buffer),
      sessionTwo,
      0
    );
    expect(res.status).toBe(500);
    expect(blobDel).toHaveBeenCalledWith('https://blob.example/p');
  });
});
