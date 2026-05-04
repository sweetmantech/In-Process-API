import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock(
  '@/lib/supabase/in_process_chunk_upload_sessions/insertChunkUploadSession',
  () => ({ default: vi.fn() })
);

import insertChunkUploadSession from '@/lib/supabase/in_process_chunk_upload_sessions/insertChunkUploadSession';
import createChunkUploadSessionHandler from '@/lib/chunk-upload/createChunkUploadSessionHandler';
import {
  CHUNK_UPLOAD_MAX_PART_BYTES,
  CHUNK_UPLOAD_MAX_CHUNK_COUNT,
  CHUNK_UPLOAD_MAX_TOTAL_BYTES,
} from '@/lib/consts';

const ARTIST = '0xAf1452D289E22FBd0dea9D5097353C72a90FAC33';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createChunkUploadSessionHandler', () => {
  it('returns session metadata on successful insert', async () => {
    vi.mocked(insertChunkUploadSession).mockResolvedValue({
      data: { id: 'new-session-id' },
      error: null,
    } as any);

    const res = await createChunkUploadSessionHandler(ARTIST, {
      filename: 'a.wav',
      content_type: 'audio/wav',
      total_chunks: 2,
      total_size_bytes: 100,
    });

    expect(res).toBeInstanceOf(NextResponse);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.session_id).toBe('new-session-id');
    expect(json.chunk_size_bytes).toBe(CHUNK_UPLOAD_MAX_PART_BYTES);
    expect(json.max_total_bytes).toBe(CHUNK_UPLOAD_MAX_TOTAL_BYTES);
    expect(json.max_chunks).toBe(CHUNK_UPLOAD_MAX_CHUNK_COUNT);

    expect(insertChunkUploadSession).toHaveBeenCalledWith(
      expect.objectContaining({
        artist_address: ARTIST.toLowerCase(),
        filename: 'a.wav',
        content_type: 'audio/wav',
        total_chunks: 2,
        total_size_bytes: 100,
      })
    );
  });

  it('returns 500 when insert fails', async () => {
    vi.mocked(insertChunkUploadSession).mockResolvedValue({
      data: null,
      error: { message: 'fail' },
    } as any);

    const res = await createChunkUploadSessionHandler(ARTIST, {
      filename: 'a.wav',
      content_type: 'audio/wav',
      total_chunks: 1,
    });

    expect(res.status).toBe(500);
  });

  it('returns 500 when row has no id', async () => {
    vi.mocked(insertChunkUploadSession).mockResolvedValue({
      data: {},
      error: null,
    } as any);

    const res = await createChunkUploadSessionHandler(ARTIST, {
      filename: 'a.wav',
      content_type: 'audio/wav',
      total_chunks: 1,
    });

    expect(res.status).toBe(500);
  });
});
