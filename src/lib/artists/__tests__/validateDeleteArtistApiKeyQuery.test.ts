import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({
  authMiddleware: vi.fn(),
}));

import { authMiddleware } from '@/authMiddleware';
import validateDeleteArtistApiKeyQuery from '@/lib/artists/validateDeleteArtistApiKeyQuery';

const ARTIST_ID = '00000000-0000-0000-0000-000000000001';
const VALID_KEY_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const makeRequest = (keyId?: string) => {
  const url = new URL('http://localhost/api/artists/api-keys');
  if (keyId !== undefined) url.searchParams.set('keyId', keyId);
  return new NextRequest(url, { headers: { authorization: 'Bearer token' } });
};

describe('validateDeleteArtistApiKeyQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMiddleware).mockResolvedValue({ artistId: ARTIST_ID } as any);
  });

  it('returns keyId when auth succeeds and keyId is a valid UUID', async () => {
    const result = await validateDeleteArtistApiKeyQuery(
      makeRequest(VALID_KEY_ID)
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({ keyId: VALID_KEY_ID });
  });

  it('returns 400 when keyId is missing', async () => {
    const result = await validateDeleteArtistApiKeyQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
    const json = await (result as NextResponse).json();
    expect(json.message).toBeTruthy();
  });

  it('returns 400 when keyId is not a valid UUID', async () => {
    const result = await validateDeleteArtistApiKeyQuery(
      makeRequest('not-a-uuid')
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
    const json = await (result as NextResponse).json();
    expect(json.message).toBe('keyId must be a valid UUID');
  });

  it('returns auth failure when authMiddleware returns NextResponse', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateDeleteArtistApiKeyQuery(
      makeRequest(VALID_KEY_ID)
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });
});
