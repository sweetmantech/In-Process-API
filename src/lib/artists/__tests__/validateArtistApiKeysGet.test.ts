import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({
  authMiddleware: vi.fn(),
}));

import { authMiddleware } from '@/authMiddleware';
import validateArtistApiKeysGet from '@/lib/artists/validateArtistApiKeysGet';

const ARTIST_ID = '00000000-0000-0000-0000-000000000001';

describe('validateArtistApiKeysGet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns artistId when auth succeeds', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      artistId: ARTIST_ID,
    } as any);

    const req = new NextRequest('http://localhost/api/artists/api-keys');
    const result = await validateArtistApiKeysGet(req);

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({ artistId: ARTIST_ID });
  });

  it('forwards auth middleware response', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const req = new NextRequest('http://localhost/api/artists/api-keys');
    const result = await validateArtistApiKeysGet(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });
});
