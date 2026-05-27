import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api-keys/generateApiKey', () => ({
  generateApiKey: vi.fn(() => 'art_sk_raw'),
}));
vi.mock('@/lib/api-keys/hashApiKey', () => ({
  hashApiKey: vi.fn(() => 'hashed'),
}));
vi.mock('@/lib/supabase/in_process_api_keys/insertApiKey', () => ({
  insertApiKey: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_wallets/upsertWallets', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_wallets/linkWalletToArtist', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/upsertArtists', () => ({
  upsertArtists: vi.fn(),
}));

import { generateApiKey } from '@/lib/api-keys/generateApiKey';
import { hashApiKey } from '@/lib/api-keys/hashApiKey';
import { insertApiKey } from '@/lib/supabase/in_process_api_keys/insertApiKey';
import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import linkWalletToArtist from '@/lib/supabase/in_process_wallets/linkWalletToArtist';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';
import createArtistApiKeyHandler from '@/lib/artists/createArtistApiKeyHandler';
import { PRIVY_PROJECT_SECRET } from '@/lib/consts';

const ARTIST_ADDRESS = '0xA123456789012345678901234567890123456789';
const ARTIST_LC = ARTIST_ADDRESS.toLowerCase();
const ARTIST_UUID = '00000000-0000-0000-0000-000000000001';

describe('createArtistApiKeyHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(upsertWallets).mockResolvedValue(undefined);
    vi.mocked(linkWalletToArtist).mockResolvedValue({ error: null } as any);
    vi.mocked(insertApiKey).mockResolvedValue({ error: null } as any);
  });

  it('uses existing artist UUID when wallet is already linked', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ artist: ARTIST_UUID }],
      error: null,
    } as any);

    const res = await createArtistApiKeyHandler({
      artistAddress: ARTIST_ADDRESS,
      key_name: '  prod  ',
    });
    const json = await res.json();

    expect(generateApiKey).toHaveBeenCalledWith('art_sk');
    expect(hashApiKey).toHaveBeenCalledWith('art_sk_raw', PRIVY_PROJECT_SECRET);
    expect(upsertWallets).toHaveBeenCalledWith([{ address: ARTIST_LC }], {
      ignoreDuplicates: true,
    });
    expect(upsertArtists).not.toHaveBeenCalled();
    expect(linkWalletToArtist).not.toHaveBeenCalled();
    expect(insertApiKey).toHaveBeenCalledWith({
      name: 'prod',
      artist_id: ARTIST_UUID,
      key_hash: 'hashed',
    });
    expect(json).toEqual({ key: 'art_sk_raw' });
  });

  it('creates a new artist when the wallet has no link, then inserts key', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ artist: null }],
      error: null,
    } as any);
    vi.mocked(upsertArtists).mockResolvedValue([{ id: ARTIST_UUID }] as any);

    await createArtistApiKeyHandler({
      artistAddress: ARTIST_LC,
      key_name: 'n',
    });

    expect(upsertArtists).toHaveBeenCalledWith({ address: ARTIST_LC });
    expect(linkWalletToArtist).toHaveBeenCalledWith(ARTIST_LC, ARTIST_UUID);
    expect(insertApiKey).toHaveBeenCalledWith({
      name: 'n',
      artist_id: ARTIST_UUID,
      key_hash: 'hashed',
    });
  });

  it('throws when insertApiKey fails', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ artist: ARTIST_UUID }],
      error: null,
    } as any);
    vi.mocked(insertApiKey).mockResolvedValue({
      error: { message: 'e' },
    } as any);

    await expect(
      createArtistApiKeyHandler({
        artistAddress: ARTIST_LC,
        key_name: 'n',
      })
    ).rejects.toThrow('Failed to store api key');
  });
});
