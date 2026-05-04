import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api-keys/generateApiKey', () => ({
  generateApiKey: vi.fn(() => 'art_sk_raw'),
}));
vi.mock('@/lib/api-keys/hashApiKey', () => ({
  hashApiKey: vi.fn(() => 'hashed'),
}));
vi.mock('@/lib/supabase/in_process_artists/upsertProfile', () => ({
  upsertProfile: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_api_keys/insertApiKey', () => ({
  insertApiKey: vi.fn(),
}));

import { generateApiKey } from '@/lib/api-keys/generateApiKey';
import { hashApiKey } from '@/lib/api-keys/hashApiKey';
import { upsertProfile } from '@/lib/supabase/in_process_artists/upsertProfile';
import { insertApiKey } from '@/lib/supabase/in_process_api_keys/insertApiKey';
import createArtistApiKeyHandler from '@/lib/artists/createArtistApiKeyHandler';
import { PRIVY_PROJECT_SECRET } from '@/lib/consts';

describe('createArtistApiKeyHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(upsertProfile).mockResolvedValue({ error: null } as any);
    vi.mocked(insertApiKey).mockResolvedValue({ error: null } as any);
  });

  it('returns raw key and stores hashed key with trimmed name', async () => {
    const res = await createArtistApiKeyHandler({
      artistAddress: '0xA123456789012345678901234567890123456789',
      key_name: '  prod  ',
    });
    const json = await res.json();

    expect(generateApiKey).toHaveBeenCalledWith('art_sk');
    expect(hashApiKey).toHaveBeenCalledWith('art_sk_raw', PRIVY_PROJECT_SECRET);
    expect(upsertProfile).toHaveBeenCalledWith({
      address: '0xa123456789012345678901234567890123456789',
    });
    expect(insertApiKey).toHaveBeenCalledWith({
      name: 'prod',
      artist_address: '0xa123456789012345678901234567890123456789',
      key_hash: 'hashed',
    });
    expect(json).toEqual({ key: 'art_sk_raw' });
  });

  it('throws when upsertProfile fails', async () => {
    vi.mocked(upsertProfile).mockResolvedValue({
      error: { message: 'e' },
    } as any);

    await expect(
      createArtistApiKeyHandler({
        artistAddress: '0xa123456789012345678901234567890123456789',
        key_name: 'n',
      })
    ).rejects.toThrow('Failed to upsert profile');
  });

  it('throws when insertApiKey fails', async () => {
    vi.mocked(insertApiKey).mockResolvedValue({
      error: { message: 'e' },
    } as any);

    await expect(
      createArtistApiKeyHandler({
        artistAddress: '0xa123456789012345678901234567890123456789',
        key_name: 'n',
      })
    ).rejects.toThrow('Failed to store api key');
  });
});
