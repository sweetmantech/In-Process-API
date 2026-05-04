import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({
  authMiddleware: vi.fn(),
}));

import { authMiddleware } from '@/authMiddleware';
import validateArtistApiKeysGet from '@/lib/artists/validateArtistApiKeysGet';
import { AuthMethod } from '@/types/auth';

const ADDRESS = '0xa123456789012345678901234567890123456789';

describe('validateArtistApiKeysGet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns lowercased artistAddress when auth succeeds', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: ADDRESS,
      authMethod: AuthMethod.Privy,
    } as any);

    const req = new NextRequest('http://localhost/api/artists/api-keys');
    const result = await validateArtistApiKeysGet(req);

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({ artistAddress: ADDRESS.toLowerCase() });
  });

  it('returns 500 when artistAddress is empty after auth', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: '',
      authMethod: AuthMethod.Privy,
    } as any);

    const req = new NextRequest('http://localhost/api/artists/api-keys');
    const result = await validateArtistApiKeysGet(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(500);
    const json = await (result as NextResponse).json();
    expect(json.message).toBe('No artist address found for this API key');
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
