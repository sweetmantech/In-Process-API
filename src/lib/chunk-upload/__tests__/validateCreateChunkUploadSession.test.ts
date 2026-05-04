import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));

import { authMiddleware } from '@/authMiddleware';
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
});
