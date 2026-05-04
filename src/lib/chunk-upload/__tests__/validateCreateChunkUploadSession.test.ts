import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));
vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/chunk-upload/getChunkUploadType', () => ({ default: vi.fn() }));
vi.mock('@/lib/chunk-upload/getUsdcForChunkUpload', () => ({
  default: vi.fn(),
}));

import { authMiddleware } from '@/authMiddleware';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import getChunkUploadType from '@/lib/chunk-upload/getChunkUploadType';
import getUsdcForChunkUpload from '@/lib/chunk-upload/getUsdcForChunkUpload';
import validateCreateChunkUploadSession from '@/lib/chunk-upload/validateCreateChunkUploadSession';

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
  } as any);
  vi.mocked(getChunkUploadType).mockResolvedValue({ uploadType: 'free' });
  vi.mocked(getUsdcForChunkUpload).mockResolvedValue({ usdcAmount: 0.05 });
});

describe('validateCreateChunkUploadSession', () => {
  it('returns artist and parsed body with uploadType free on success', async () => {
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
    expect((result as any).uploadType).toBe('free');
    expect((result as any).usdcAmount).toBeUndefined();
  });

  it('returns paid upload type and usdcAmount when getChunkUploadType returns paid', async () => {
    vi.mocked(getChunkUploadType).mockResolvedValue({ uploadType: 'paid' });

    const result = await validateCreateChunkUploadSession(
      makeRequest({
        filename: 'big.mp4',
        content_type: 'video/mp4',
        total_chunks: 3,
        total_size_bytes: 10_000_000,
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).uploadType).toBe('paid');
    expect((result as any).usdcAmount).toBe(0.05);
    expect(getUsdcForChunkUpload).toHaveBeenCalledWith(ARTIST, 10_000_000);
  });

  it('returns 402 when smart wallet has insufficient USDC', async () => {
    vi.mocked(getChunkUploadType).mockResolvedValue({ uploadType: 'paid' });
    vi.mocked(getUsdcForChunkUpload).mockResolvedValue({
      error: 'Insufficient USDC balance in smart wallet',
      status: 402,
      required: '50000',
      available: '10000',
    });

    const result = await validateCreateChunkUploadSession(
      makeRequest({
        filename: 'big.mp4',
        content_type: 'video/mp4',
        total_chunks: 3,
        total_size_bytes: 10_000_000,
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(402);
    const j = await (result as NextResponse).json();
    expect(j.required).toBe('50000');
    expect(j.available).toBe('10000');
  });

  it('returns 400 when getChunkUploadType returns 400 error', async () => {
    vi.mocked(getChunkUploadType).mockResolvedValue({
      error: 'total_size_bytes is required when the free tier limit is reached',
      status: 400,
    });

    const result = await validateCreateChunkUploadSession(
      makeRequest({
        filename: 'track.wav',
        content_type: 'audio/wav',
        total_chunks: 1,
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 500 when getChunkUploadType returns 500 error', async () => {
    vi.mocked(getChunkUploadType).mockResolvedValue({
      error: 'Failed to check upload quota',
      status: 500,
    });

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
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when schema validation fails', async () => {
    const result = await validateCreateChunkUploadSession(
      makeRequest({ filename: '', total_chunks: 1 })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 403 when artist has no username', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [{ username: null }],
      error: null,
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

  it('returns 500 when selectArtists fails', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: null,
      error: { message: 'db' },
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
