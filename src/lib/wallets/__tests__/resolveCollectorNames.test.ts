import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/upsertArtistNames', () => ({
  upsertArtistNames: vi.fn(),
}));
vi.mock('@/lib/artists/resolveAddressDisplayName', () => ({
  default: vi.fn(),
}));

import resolveCollectorNames from '../resolveCollectorNames';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { upsertArtistNames } from '@/lib/supabase/in_process_artists/upsertArtistNames';
import resolveAddressDisplayName from '@/lib/artists/resolveAddressDisplayName';

const mockSelectWallets = vi.mocked(selectWallets);
const mockUpsertArtistNames = vi.mocked(upsertArtistNames);
const mockResolveDisplayName = vi.mocked(resolveAddressDisplayName);

describe('resolveCollectorNames', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsertArtistNames.mockResolvedValue(undefined);
  });

  it('does nothing for empty input', async () => {
    await resolveCollectorNames([]);
    expect(mockSelectWallets).not.toHaveBeenCalled();
  });

  it('skips wallets that already have a username', async () => {
    mockSelectWallets.mockResolvedValue({
      data: [
        {
          address: '0xnamed',
          artist_id: 'a1',
          type: null,
          artist: {
            id: 'a1',
            username: 'alice',
            bio: null,
            x: null,
            telegram: null,
            instagram: null,
          },
        },
      ] as never,
    });

    await resolveCollectorNames(['0xnamed']);

    expect(mockResolveDisplayName).not.toHaveBeenCalled();
    expect(mockUpsertArtistNames).not.toHaveBeenCalled();
  });

  it('resolves and upserts names only for wallets without a username', async () => {
    mockSelectWallets.mockResolvedValue({
      data: [
        {
          address: '0xnamed',
          artist_id: 'a1',
          type: null,
          artist: {
            id: 'a1',
            username: 'alice',
            bio: null,
            x: null,
            telegram: null,
            instagram: null,
          },
        },
        {
          address: '0xunnamed',
          artist_id: null,
          type: null,
          artist: null,
        },
      ] as never,
    });
    mockResolveDisplayName.mockResolvedValue('bob.eth');

    await resolveCollectorNames(['0xnamed', '0xunnamed']);

    expect(mockResolveDisplayName).toHaveBeenCalledTimes(1);
    expect(mockResolveDisplayName).toHaveBeenCalledWith('0xunnamed');
    expect(mockUpsertArtistNames).toHaveBeenCalledWith(
      new Map([['0xunnamed', 'bob.eth']])
    );
  });

  it('does not upsert when no unnamed wallet resolves to a name', async () => {
    mockSelectWallets.mockResolvedValue({ data: [] as never });
    mockResolveDisplayName.mockResolvedValue(null);

    await resolveCollectorNames(['0xunresolved']);

    expect(mockUpsertArtistNames).toHaveBeenCalledWith(new Map());
  });

  it('normalizes and dedupes addresses before querying', async () => {
    mockSelectWallets.mockResolvedValue({ data: [] as never });
    mockResolveDisplayName.mockResolvedValue(null);

    await resolveCollectorNames(['0xABC', '0xabc']);

    expect(mockSelectWallets).toHaveBeenCalledWith({ addresses: ['0xabc'] });
  });
});
