import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock(
  '@/lib/supabase/in_process_chunk_upload_sessions/updateChunkUploadSessionStatus',
  () => ({ default: vi.fn() })
);
vi.mock(
  '@/lib/supabase/in_process_chunk_upload_parts/listChunkUploadParts',
  () => ({ default: vi.fn() })
);
vi.mock('@/lib/chunk-upload/getFileFromBlobs', () => ({ default: vi.fn() }));
vi.mock('@/lib/arweave/uploadToArweave', () => ({ default: vi.fn() }));
vi.mock('@/lib/vercel-blob/blobDel', () => ({ default: vi.fn() }));

import updateChunkUploadSessionStatus from '@/lib/supabase/in_process_chunk_upload_sessions/updateChunkUploadSessionStatus';
import listChunkUploadParts from '@/lib/supabase/in_process_chunk_upload_parts/listChunkUploadParts';
import getFileFromBlobs from '@/lib/chunk-upload/getFileFromBlobs';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import blobDel from '@/lib/vercel-blob/blobDel';
import completeChunkUploadHandler from '@/lib/chunk-upload/completeChunkUploadHandler';

const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';

const lockedRow = {
  id: SESSION_ID,
  total_chunks: 2,
  filename: 'a.bin',
  content_type: 'application/octet-stream',
  total_size_bytes: null as number | null,
  status: 'completing' as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(updateChunkUploadSessionStatus).mockImplementation(
    async ({ to }) => {
      if (to === 'completing') return { data: [lockedRow], error: null } as any;
      return { data: [], error: null } as any;
    }
  );
  vi.mocked(blobDel).mockImplementation(() => Promise.resolve());
});

describe('completeChunkUploadHandler', () => {
  it('returns 500 when session cannot be locked', async () => {
    vi.mocked(updateChunkUploadSessionStatus).mockResolvedValue({
      data: null,
      error: { message: 'x' },
    } as any);

    const res = await completeChunkUploadHandler(SESSION_ID, '0xartist');
    expect(res.status).toBe(500);
    expect(updateChunkUploadSessionStatus).toHaveBeenCalledWith({
      id: SESSION_ID,
      from: 'open',
      to: 'completing',
    });
  });

  it('returns 500 when parts cannot be listed', async () => {
    vi.mocked(listChunkUploadParts).mockResolvedValue({
      data: null,
      error: { message: 'x' },
    } as any);

    const res = await completeChunkUploadHandler(SESSION_ID, '0xartist');
    expect(res.status).toBe(500);
  });

  it('returns 500 when chunk count does not match session', async () => {
    vi.mocked(listChunkUploadParts).mockResolvedValue({
      data: [{ chunk_index: 0, byte_length: 1, blob_url: 'https://0' }],
      error: null,
    } as any);

    const res = await completeChunkUploadHandler(SESSION_ID, '0xartist');
    expect(res.status).toBe(500);
    const j = await res.json();
    expect(j.message).toMatch(/Expected 2 chunks/);
  });

  it('returns 500 when chunk indices are out of order', async () => {
    vi.mocked(listChunkUploadParts).mockResolvedValue({
      data: [
        { chunk_index: 0, byte_length: 1, blob_url: 'https://0' },
        { chunk_index: 2, byte_length: 1, blob_url: 'https://2' },
      ],
      error: null,
    } as any);

    const res = await completeChunkUploadHandler(SESSION_ID, '0xartist');
    expect(res.status).toBe(500);
    const j = await res.json();
    expect(j.message).toMatch(/out-of-order|Missing/);
  });

  it('returns 500 when getFileFromBlobs fails', async () => {
    vi.mocked(listChunkUploadParts).mockResolvedValue({
      data: [
        { chunk_index: 0, byte_length: 1, blob_url: 'https://0' },
        { chunk_index: 1, byte_length: 1, blob_url: 'https://1' },
      ],
      error: null,
    } as any);
    vi.mocked(getFileFromBlobs).mockResolvedValue({
      ok: false,
      status: 400,
      message: 'bad file',
    });

    const res = await completeChunkUploadHandler(SESSION_ID, '0xartist');
    expect(res.status).toBe(500);
    const j = await res.json();
    expect(j.message).toBe('bad file');
  });

  it('uploads assembled file, deletes blobs, marks session done', async () => {
    const file = new File([Buffer.from('xy')], 'a.bin', {
      type: 'application/octet-stream',
    });

    vi.mocked(listChunkUploadParts).mockResolvedValue({
      data: [
        { chunk_index: 0, byte_length: 1, blob_url: 'https://0' },
        { chunk_index: 1, byte_length: 1, blob_url: 'https://1' },
      ],
      error: null,
    } as any);
    vi.mocked(getFileFromBlobs).mockResolvedValue({ ok: true, file });
    vi.mocked(uploadToArweave).mockResolvedValue({
      arweave_uri: 'ar://hash',
      winc_cost: '100',
    });

    const res = await completeChunkUploadHandler(SESSION_ID, '0xartist');

    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.uri).toBe('ar://hash');
    expect(uploadToArweave).toHaveBeenCalledWith(file);
    expect(blobDel).toHaveBeenCalledWith(['https://0', 'https://1']);
    expect(updateChunkUploadSessionStatus).toHaveBeenCalledWith({
      id: SESSION_ID,
      from: 'completing',
      to: 'done',
      extra: expect.objectContaining({ completed_at: expect.any(String) }),
    });
  });

  it('reverts session to open on failure', async () => {
    vi.mocked(listChunkUploadParts).mockResolvedValue({
      data: null,
      error: { message: 'db' },
    } as any);

    const res = await completeChunkUploadHandler(SESSION_ID, '0xartist');

    expect(res.status).toBe(500);
    expect(updateChunkUploadSessionStatus).toHaveBeenCalledWith({
      id: SESSION_ID,
      from: 'completing',
      to: 'open',
    });
  });

  it('still returns JSON error as NextResponse on failure path', async () => {
    vi.mocked(updateChunkUploadSessionStatus).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const res = await completeChunkUploadHandler(SESSION_ID, '0xartist');
    expect(res).toBeInstanceOf(NextResponse);
  });
});
