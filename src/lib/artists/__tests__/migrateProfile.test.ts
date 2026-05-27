import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/upsertArtists', () => ({
  upsertArtists: vi.fn(),
}));

import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';
import migrateProfile from '@/lib/artists/migrateProfile';

const social = '0xb234567890123456789012345678901234567891';
const artist = '0xa123456789012345678901234567890123456789';

const makeProfile = (fields: object) => ({
  data: [fields],
  error: null,
  count: null,
  status: 200,
  statusText: 'OK',
});

describe('migrateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(upsertArtists).mockResolvedValue(undefined);
  });

  it('copies social profile onto artist wallet then clears social row', async () => {
    const profile = {
      username: 'u',
      bio: 'b',
      instagram: 'ig',
      x: 'tw',
      telegram: 'tg',
    };
    vi.mocked(selectArtists).mockResolvedValue(makeProfile(profile) as any);

    await migrateProfile({ social_wallet: social, artist_wallet: artist });

    expect(selectArtists).toHaveBeenCalledTimes(2);
    expect(selectArtists).toHaveBeenNthCalledWith(1, { address: social });
    expect(selectArtists).toHaveBeenNthCalledWith(2, { address: artist });
    expect(upsertArtists).toHaveBeenNthCalledWith(1, [
      {
        address: artist.toLowerCase(),
        username: 'u',
        bio: 'b',
        instagram: 'ig',
        x: 'tw',
        telegram: 'tg',
      },
    ]);
    expect(upsertArtists).toHaveBeenNthCalledWith(2, [
      {
        address: social.toLowerCase(),
        username: '',
        bio: '',
        instagram: '',
        x: '',
        telegram: '',
      },
    ]);
  });

  it('prefers artist wallet profile fields over social when both exist', async () => {
    vi.mocked(selectArtists)
      .mockResolvedValueOnce(
        makeProfile({
          username: 'from_social',
          bio: 'social_bio',
          instagram: 'ig_s',
          x: 'tw_s',
          telegram: 'tg_s',
        }) as any
      )
      .mockResolvedValueOnce(
        makeProfile({
          username: 'from_artist',
          bio: 'artist_bio',
          instagram: 'ig_a',
          x: 'tw_a',
          telegram: 'tg_a',
        }) as any
      );

    await migrateProfile({ social_wallet: social, artist_wallet: artist });

    expect(upsertArtists).toHaveBeenNthCalledWith(1, [
      {
        address: artist.toLowerCase(),
        username: 'from_artist',
        bio: 'artist_bio',
        instagram: 'ig_a',
        x: 'tw_a',
        telegram: 'tg_a',
      },
    ]);
  });

  it('fills artist row from social when artist field is missing or empty string', async () => {
    vi.mocked(selectArtists)
      .mockResolvedValueOnce(
        makeProfile({
          username: 'soc_u',
          bio: 'soc_bio',
          instagram: null,
          x: '',
          telegram: 'tg_s',
        }) as any
      )
      .mockResolvedValueOnce(
        makeProfile({
          username: '',
          bio: null,
          instagram: 'ig_a',
          x: null,
          telegram: null,
        }) as any
      );

    await migrateProfile({ social_wallet: social, artist_wallet: artist });

    expect(upsertArtists).toHaveBeenNthCalledWith(1, [
      {
        address: artist.toLowerCase(),
        username: 'soc_u',
        bio: 'soc_bio',
        instagram: 'ig_a',
        x: '',
        telegram: 'tg_s',
      },
    ]);
  });

  it('when both profiles empty, upserts artist row with undefined fields then clears social', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [],
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    } as any);

    await migrateProfile({
      social_wallet: '0xB234567890123456789012345678901234567891',
      artist_wallet: '0xA123456789012345678901234567890123456789',
    });

    expect(selectArtists).toHaveBeenCalledTimes(2);
    expect(upsertArtists).toHaveBeenNthCalledWith(1, [
      {
        address: '0xa123456789012345678901234567890123456789',
        username: undefined,
        bio: undefined,
        instagram: undefined,
        x: undefined,
        telegram: undefined,
      },
    ]);
    expect(upsertArtists).toHaveBeenNthCalledWith(2, [
      {
        address: '0xb234567890123456789012345678901234567891',
        username: '',
        bio: '',
        instagram: '',
        x: '',
        telegram: '',
      },
    ]);
  });

  it('throws when upsertArtists fails', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(selectArtists).mockResolvedValue({
      data: [],
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    } as any);
    vi.mocked(upsertArtists).mockRejectedValue(new Error('db'));

    await expect(
      migrateProfile({
        social_wallet: '0xb2',
        artist_wallet: '0xa1',
      })
    ).rejects.toThrow(/❌ migrateProfile:/);
    errSpy.mockRestore();
  });
});
