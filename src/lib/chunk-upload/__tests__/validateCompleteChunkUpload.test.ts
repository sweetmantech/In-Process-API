import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));
vi.mock(
  '@/lib/supabase/in_process_chunk_upload_sessions/getChunkUploadSession',
  () => ({ default: vi.fn() })
);

import { authMiddleware } from '@/authMiddleware';
import getChunkUploadSession from '@/lib/supabase/in_process_chunk_upload_sessions/getChunkUploadSession';
import validateCompleteChunkUpload from '@/lib/chunk-upload/validateCompleteChunkUpload';

const ARTIST = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33';
const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';

const openSession = {
  id: SESSION_ID,
  status: 'open' as const,
  expires_at: new Date(Date.now() + 60_000).toISOString(),
  artist_address: ARTIST,
  total_chunks: 1,
};

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/upload/chunk-session/complete', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authMiddleware).mockResolvedValue({ artistAddress: ARTIST } as any);
  vi.mocked(getChunkUploadSession).mockResolvedValue({
    data: openSession,
    error: null,
  } as any);
});

describe('validateCompleteChunkUpload', () => {
  it('returns session_id when body and session gate pass', async () => {
    const result = await validateCompleteChunkUpload(
      makeRequest({ session_id: SESSION_ID })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).session_id).toBe(SESSION_ID);
  });

  it('returns 400 for invalid session_id', async () => {
    const result = await validateCompleteChunkUpload(
      makeRequest({ session_id: 'not-a-uuid' })
    );
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 404 when session not found', async () => {
    vi.mocked(getChunkUploadSession).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const result = await validateCompleteChunkUpload(
      makeRequest({ session_id: SESSION_ID })
    );
    expect((result as NextResponse).status).toBe(404);
  });
});
