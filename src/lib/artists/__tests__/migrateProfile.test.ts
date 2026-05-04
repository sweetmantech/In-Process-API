import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_artists/getProfile', () => ({
  getProfile: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/upsertArtists', () => ({
  upsertArtists: vi.fn(),
}));

import { getProfile } from '@/lib/supabase/in_process_artists/getProfile';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';
import migrateProfile from '@/lib/artists/migrateProfile';

describe('migrateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(upsertArtists).mockResolvedValue(undefined);
  });

  it('copies social profile onto artist wallet then clears social row', async () => {
    vi.mocked(getProfile).mockResolvedValue({
      username: 'u',
      bio: 'b',
      farcaster_username: 'fc',
      instagram_username: 'ig',
      twitter_username: 'tw',
      telegram_username: 'tg',
    } as any);

    await migrateProfile({
      social_wallet: '0xb234567890123456789012345678901234567891',
      artist_wallet: '0xa123456789012345678901234567890123456789',
    });

    expect(getProfile).toHaveBeenCalledWith(
      '0xb234567890123456789012345678901234567891'
    );
    expect(upsertArtists).toHaveBeenNthCalledWith(1, [
      {
        address: '0xa123456789012345678901234567890123456789',
        username: 'u',
        bio: 'b',
        farcaster_username: 'fc',
        instagram_username: 'ig',
        twitter_username: 'tw',
        telegram_username: 'tg',
      },
    ]);
    expect(upsertArtists).toHaveBeenNthCalledWith(2, [
      {
        address: '0xb234567890123456789012345678901234567891',
        username: '',
        bio: '',
        farcaster_username: '',
        instagram_username: '',
        twitter_username: '',
        telegram_username: '',
      },
    ]);
  });

  it('when social has no profile, upserts artist row with undefined fields then clears social', async () => {
    vi.mocked(getProfile).mockResolvedValue(null);

    await migrateProfile({
      social_wallet: '0xB234567890123456789012345678901234567891',
      artist_wallet: '0xA123456789012345678901234567890123456789',
    });

    expect(upsertArtists).toHaveBeenNthCalledWith(1, [
      {
        address: '0xa123456789012345678901234567890123456789',
        username: undefined,
        bio: undefined,
        farcaster_username: undefined,
        instagram_username: undefined,
        twitter_username: undefined,
        telegram_username: undefined,
      },
    ]);
    expect(upsertArtists).toHaveBeenNthCalledWith(2, [
      {
        address: '0xb234567890123456789012345678901234567891',
        username: '',
        bio: '',
        farcaster_username: '',
        instagram_username: '',
        twitter_username: '',
        telegram_username: '',
      },
    ]);
  });

  it('throws when upsertArtists fails', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getProfile).mockResolvedValue(null);
    vi.mocked(upsertArtists).mockRejectedValue(new Error('db'));

    await expect(
      migrateProfile({
        social_wallet: '0xb2',
        artist_wallet: '0xa1',
      })
    ).rejects.toThrow('Failed to migrate profile');
    errSpy.mockRestore();
  });
});
