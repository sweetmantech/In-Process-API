import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));

import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import isSameArtist from '../isSameArtist';

const ADDR_A = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const ADDR_B = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const ARTIST_ID = 'artist-uuid-1';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('isSameArtist', () => {
  it('returns true when both addresses belong to the same artist', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [
        { address: ADDR_A, artist_id: ARTIST_ID },
        { address: ADDR_B, artist_id: ARTIST_ID },
      ],
    } as never);

    expect(await isSameArtist(ADDR_A, ADDR_B)).toBe(true);
  });

  it('returns false when addresses belong to different artists', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [
        { address: ADDR_A, artist_id: 'artist-uuid-1' },
        { address: ADDR_B, artist_id: 'artist-uuid-2' },
      ],
    } as never);

    expect(await isSameArtist(ADDR_A, ADDR_B)).toBe(false);
  });

  it('returns false when one address is not in the DB', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ address: ADDR_A, artist_id: ARTIST_ID }],
    } as never);

    expect(await isSameArtist(ADDR_A, ADDR_B)).toBe(false);
  });

  it('returns false when wallets data is null', async () => {
    vi.mocked(selectWallets).mockResolvedValue({ data: null } as never);

    expect(await isSameArtist(ADDR_A, ADDR_B)).toBe(false);
  });
});
