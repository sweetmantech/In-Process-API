import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({
  authMiddleware: vi.fn(),
}));

import { authMiddleware } from '@/authMiddleware';
import validateCreateArtistApiKeyBody from '@/lib/artists/validateCreateArtistApiKeyBody';

const ARTIST_ID = '00000000-0000-0000-0000-000000000001';

const makeRequest = (
  body: unknown,
  headers?: Record<string, string>
): NextRequest =>
  new NextRequest('http://localhost/api/artists/api-keys', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', ...headers },
  });

describe('validateCreateArtistApiKeyBody', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMiddleware).mockResolvedValue({
      artistId: ARTIST_ID,
    } as any);
  });

  it('returns artistId and key_name', async () => {
    const result = await validateCreateArtistApiKeyBody(
      makeRequest({ key_name: 'My Key' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({
      artistId: ARTIST_ID,
      key_name: 'My Key',
    });
  });

  it('returns 400 when key_name is missing', async () => {
    const result = await validateCreateArtistApiKeyBody(makeRequest({}));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('forwards auth middleware response', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateCreateArtistApiKeyBody(
      makeRequest({ key_name: 'k' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });
});
