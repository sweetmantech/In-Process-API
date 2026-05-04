import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_api_keys/getApiKeys', () => ({
  getApiKeys: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_api_keys/updateArtistAddress', () => ({
  updateArtistAddress: vi.fn(),
}));

import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import { updateArtistAddress } from '@/lib/supabase/in_process_api_keys/updateArtistAddress';
import migrateApiKey from '@/lib/artists/migrateApiKey';

describe('migrateApiKey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(updateArtistAddress).mockResolvedValue({ error: null });
  });

  it('does nothing when social wallet has no api keys', async () => {
    vi.mocked(getApiKeys).mockResolvedValue({
      data: [],
      error: null,
    } as any);

    await migrateApiKey({
      social_wallet: '0xb234567890123456789012345678901234567891',
      artist_wallet: '0xa123456789012345678901234567890123456789',
    });

    expect(getApiKeys).toHaveBeenCalledWith(
      '0xb234567890123456789012345678901234567891'
    );
    expect(updateArtistAddress).not.toHaveBeenCalled();
  });

  it('moves the most recent api key artist_address to the artist wallet (lowercased)', async () => {
    vi.mocked(getApiKeys).mockResolvedValue({
      data: [{ id: 'key-1', name: 'a', created_at: 't2' }],
      error: null,
    } as any);

    await migrateApiKey({
      social_wallet: '0xB234567890123456789012345678901234567891',
      artist_wallet: '0xA123456789012345678901234567890123456789',
    });

    expect(getApiKeys).toHaveBeenCalledWith(
      '0xb234567890123456789012345678901234567891'
    );
    expect(updateArtistAddress).toHaveBeenCalledWith(
      'key-1',
      '0xa123456789012345678901234567890123456789'
    );
  });

  it('throws when getApiKeys returns an error', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getApiKeys).mockResolvedValue({
      data: null,
      error: { message: 'db' },
    } as any);

    await expect(
      migrateApiKey({
        social_wallet: '0xb2',
        artist_wallet: '0xa1',
      })
    ).rejects.toThrow('Failed to migrate api key');
    errSpy.mockRestore();
  });

  it('throws when updateArtistAddress returns an error', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getApiKeys).mockResolvedValue({
      data: [{ id: 'key-1', name: 'a', created_at: 't' }],
      error: null,
    } as any);
    vi.mocked(updateArtistAddress).mockResolvedValue({
      error: { message: 'update failed' },
    } as any);

    await expect(
      migrateApiKey({
        social_wallet: '0xb2',
        artist_wallet: '0xa1',
      })
    ).rejects.toThrow('Failed to migrate api key');
    errSpy.mockRestore();
  });
});
