import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock(
  '@/lib/supabase/in_process_chunk_upload_sessions/insertChunkUploadSession',
  () => ({ default: vi.fn() })
);
vi.mock('@/lib/arweave/topUpTurboCredits', () => ({ default: vi.fn() }));

import insertChunkUploadSession from '@/lib/supabase/in_process_chunk_upload_sessions/insertChunkUploadSession';
import topUpTurboCredits from '@/lib/arweave/topUpTurboCredits';
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
      uploadType: 'free',
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

  it('tops up Turbo credits before inserting session for paid uploads', async () => {
    vi.mocked(insertChunkUploadSession).mockResolvedValue({
      data: { id: 'paid-session-id' },
      error: null,
    } as any);

    await createChunkUploadSessionHandler(ARTIST, {
      filename: 'a.wav',
      content_type: 'audio/wav',
      total_chunks: 1,
      uploadType: 'paid',
      usdcAmountMicros: BigInt(50_000),
    });

    expect(
      vi.mocked(topUpTurboCredits).mock.invocationCallOrder[0]
    ).toBeLessThan(
      vi.mocked(insertChunkUploadSession).mock.invocationCallOrder[0]
    );
    expect(topUpTurboCredits).toHaveBeenCalledWith(ARTIST, BigInt(50_000));
    expect(insertChunkUploadSession).toHaveBeenCalled();
  });

  it('rejects when Turbo funding fails before insert', async () => {
    vi.mocked(insertChunkUploadSession).mockResolvedValue({
      data: { id: 'paid-session-id' },
      error: null,
    } as any);
    vi.mocked(topUpTurboCredits).mockRejectedValue(new Error('turbo down'));

    await expect(
      createChunkUploadSessionHandler(ARTIST, {
        filename: 'a.wav',
        content_type: 'audio/wav',
        total_chunks: 1,
        uploadType: 'paid',
        usdcAmountMicros: BigInt(50_000),
      })
    ).rejects.toThrow('turbo down');

    expect(insertChunkUploadSession).not.toHaveBeenCalled();
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
      uploadType: 'free',
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
      uploadType: 'free',
    });

    expect(res.status).toBe(500);
  });
});
