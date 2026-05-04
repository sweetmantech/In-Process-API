import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));
vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));
vi.mock(
  '@/lib/supabase/in_process_chunk_upload_sessions/getCompletedFreeUploads',
  () => ({ default: vi.fn() })
);

import { authMiddleware } from '@/authMiddleware';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import getCompletedFreeUploads from '@/lib/supabase/in_process_chunk_upload_sessions/getCompletedFreeUploads';
import validateCreateChunkUploadSession from '@/lib/chunk-upload/validateCreateChunkUploadSession';
import { FREE_TIER_MAX_BYTES } from '@/lib/consts';

const ARTIST = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/upload/chunk-session', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authMiddleware).mockResolvedValue({ artistAddress: ARTIST } as any);
  vi.mocked(selectArtists).mockResolvedValue({
    data: [{ username: 'coolartist' }],
    error: null,
    count: null,
    status: 200,
    statusText: 'OK',
  } as any);
  vi.mocked(getCompletedFreeUploads).mockResolvedValue({
    count: 0,
    error: null,
    data: null,
    status: 200,
    statusText: 'OK',
  } as any);
});

describe('validateCreateChunkUploadSession', () => {
  it('returns artist and parsed body on success', async () => {
    const result = await validateCreateChunkUploadSession(
      makeRequest({
        filename: 'track.wav',
        content_type: 'audio/wav',
        total_chunks: 1,
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artistAddress).toBe(ARTIST);
    expect((result as any).filename).toBe('track.wav');
    expect((result as any).content_type).toBe('audio/wav');
    expect((result as any).total_chunks).toBe(1);
  });

  it('returns 401 when auth fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateCreateChunkUploadSession(
      makeRequest({ filename: 'a', total_chunks: 1 })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/upload/chunk-session', {
      method: 'POST',
      body: '{',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await validateCreateChunkUploadSession(req);
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when schema validation fails', async () => {
    const result = await validateCreateChunkUploadSession(
      makeRequest({ filename: '', total_chunks: 1 })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 413 when total_size_bytes exceeds 5 MiB', async () => {
    const result = await validateCreateChunkUploadSession(
      makeRequest({
        filename: 'big.mp4',
        content_type: 'video/mp4',
        total_chunks: 2,
        total_size_bytes: FREE_TIER_MAX_BYTES + 1,
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(413);
    const j = await (result as NextResponse).json();
    expect(j.message).toMatch(/free tier limit/);
    expect(selectArtists).not.toHaveBeenCalled();
    expect(getCompletedFreeUploads).not.toHaveBeenCalled();
  });

  it('allows upload when total_size_bytes is exactly 5 MiB', async () => {
    const result = await validateCreateChunkUploadSession(
      makeRequest({
        filename: 'track.wav',
        content_type: 'audio/wav',
        total_chunks: 2,
        total_size_bytes: FREE_TIER_MAX_BYTES,
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artistAddress).toBe(ARTIST);
  });

  it('allows upload when total_size_bytes is not provided', async () => {
    const result = await validateCreateChunkUploadSession(
      makeRequest({
        filename: 'track.wav',
        content_type: 'audio/wav',
        total_chunks: 1,
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artistAddress).toBe(ARTIST);
  });

  it('returns 403 when artist has no username', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [{ username: null }],
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    } as any);

    const result = await validateCreateChunkUploadSession(
      makeRequest({
        filename: 'track.wav',
        content_type: 'audio/wav',
        total_chunks: 1,
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
  });

  it('returns 403 when monthly upload limit is reached', async () => {
    vi.mocked(getCompletedFreeUploads).mockResolvedValue({
      count: 11,
      error: null,
      data: null,
      status: 200,
      statusText: 'OK',
    } as any);

    const result = await validateCreateChunkUploadSession(
      makeRequest({
        filename: 'track.wav',
        content_type: 'audio/wav',
        total_chunks: 1,
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
    const j = await (result as NextResponse).json();
    expect(j.message).toMatch(/Monthly free upload limit reached/);
  });

  it('returns 200 when at exactly 10 completed uploads (limit not yet reached)', async () => {
    vi.mocked(getCompletedFreeUploads).mockResolvedValue({
      count: 10,
      error: null,
      data: null,
      status: 200,
      statusText: 'OK',
    } as any);

    const result = await validateCreateChunkUploadSession(
      makeRequest({
        filename: 'track.wav',
        content_type: 'audio/wav',
        total_chunks: 1,
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artistAddress).toBe(ARTIST);
  });

  it('returns 500 when getCompletedFreeUploads fails', async () => {
    vi.mocked(getCompletedFreeUploads).mockResolvedValue({
      count: null,
      error: { message: 'db error' },
      data: null,
      status: 500,
      statusText: 'Error',
    } as any);

    const result = await validateCreateChunkUploadSession(
      makeRequest({
        filename: 'track.wav',
        content_type: 'audio/wav',
        total_chunks: 1,
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(500);
  });

  it('returns 500 when selectArtists fails', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: null,
      error: { message: 'db' },
      count: null,
      status: 500,
      statusText: 'Error',
    } as any);

    const result = await validateCreateChunkUploadSession(
      makeRequest({
        filename: 'track.wav',
        content_type: 'audio/wav',
        total_chunks: 1,
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(500);
  });
});
