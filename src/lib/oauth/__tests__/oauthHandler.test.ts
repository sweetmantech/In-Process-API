import { describe, it, expect, vi } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/getArtistProfile', () => ({
  default: vi.fn(),
}));

import oauthHandler from '@/lib/oauth/oauthHandler';
import getArtistProfile from '@/lib/getArtistProfile';

const mockGetArtistProfile = vi.mocked(getArtistProfile);

describe('oauthHandler', () => {
  it('returns artistAddress and profile in response', async () => {
    const profile = { username: 'alice', bio: 'artist' };
    mockGetArtistProfile.mockResolvedValue(profile as any);

    const res = await oauthHandler('0xABC');
    const json = await res.json();

    expect(res).toBeInstanceOf(NextResponse);
    expect(json).toEqual({ artistAddress: '0xABC', profile });
  });

  it('calls getArtistProfile with lowercased address', async () => {
    mockGetArtistProfile.mockResolvedValue(null as any);

    await oauthHandler('0xABC');

    expect(mockGetArtistProfile).toHaveBeenCalledWith('0xabc');
  });

  it('returns null profile when getArtistProfile returns null', async () => {
    mockGetArtistProfile.mockResolvedValue(null as any);

    const res = await oauthHandler('0xabc');
    const json = await res.json();

    expect(json).toEqual({ artistAddress: '0xabc', profile: null });
  });
});
