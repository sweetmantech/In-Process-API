import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));
vi.mock(
  '@/lib/supabase/in_process_chunk_upload_sessions/getChunkUploadSession',
  () => ({ default: vi.fn() })
);

import { authMiddleware } from '@/authMiddleware';
import getChunkUploadSession from '@/lib/supabase/in_process_chunk_upload_sessions/getChunkUploadSession';
import validatePutChunkUpload from '@/lib/chunk-upload/validatePutChunkUpload';

const ARTIST = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33';
const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';

const openSession = {
  id: SESSION_ID,
  status: 'open' as const,
  expires_at: new Date(Date.now() + 60_000).toISOString(),
  artist_address: ARTIST,
  total_chunks: 3,
};

const makeRequest = (headers: Record<string, string>) =>
  new NextRequest('http://localhost/api/upload/chunk', {
    method: 'PUT',
    headers: new Headers(headers),
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authMiddleware).mockResolvedValue({ artistAddress: ARTIST } as any);
  vi.mocked(getChunkUploadSession).mockResolvedValue({
    data: openSession,
    error: null,
  } as any);
});

describe('validatePutChunkUpload', () => {
  it('returns session and chunkIndex when headers and session are valid', async () => {
    const result = await validatePutChunkUpload(
      makeRequest({
        'x-session-id': SESSION_ID,
        'x-chunk-index': '1',
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).chunkIndex).toBe(1);
    expect((result as any).session.id).toBe(SESSION_ID);
  });

  it('returns 401 when auth fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'No' }, { status: 401 })
    );

    const result = await validatePutChunkUpload(
      makeRequest({ 'x-session-id': SESSION_ID, 'x-chunk-index': '0' })
    );
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 400 when x-session-id is missing', async () => {
    const result = await validatePutChunkUpload(
      makeRequest({ 'x-chunk-index': '0' })
    );
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when x-chunk-index is missing', async () => {
    const result = await validatePutChunkUpload(
      makeRequest({ 'x-session-id': SESSION_ID })
    );
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for non-integer chunk index', async () => {
    const result = await validatePutChunkUpload(
      makeRequest({
        'x-session-id': SESSION_ID,
        'x-chunk-index': 'nope',
      })
    );
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when chunk_index >= total_chunks', async () => {
    const result = await validatePutChunkUpload(
      makeRequest({
        'x-session-id': SESSION_ID,
        'x-chunk-index': '3',
      })
    );
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 404 when session is missing', async () => {
    vi.mocked(getChunkUploadSession).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const result = await validatePutChunkUpload(
      makeRequest({
        'x-session-id': SESSION_ID,
        'x-chunk-index': '0',
      })
    );
    expect((result as NextResponse).status).toBe(404);
  });
});
