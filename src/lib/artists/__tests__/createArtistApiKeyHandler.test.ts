import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api-keys/generateApiKey', () => ({
  generateApiKey: vi.fn(() => 'art_sk_raw'),
}));
vi.mock('@/lib/api-keys/hashApiKey', () => ({
  hashApiKey: vi.fn(() => 'hashed'),
}));
vi.mock('@/lib/artists/ensureArtists', () => ({
  ensureArtists: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_api_keys/insertApiKey', () => ({
  insertApiKey: vi.fn(),
}));

import { generateApiKey } from '@/lib/api-keys/generateApiKey';
import { hashApiKey } from '@/lib/api-keys/hashApiKey';
import { ensureArtists } from '@/lib/artists/ensureArtists';
import { insertApiKey } from '@/lib/supabase/in_process_api_keys/insertApiKey';
import createArtistApiKeyHandler from '@/lib/artists/createArtistApiKeyHandler';
import { PRIVY_PROJECT_SECRET } from '@/lib/consts';

describe('createArtistApiKeyHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ensureArtists).mockResolvedValue(undefined);
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
    expect(ensureArtists).toHaveBeenCalledWith([
      '0xa123456789012345678901234567890123456789',
    ]);
    expect(insertApiKey).toHaveBeenCalledWith({
      name: 'prod',
      artist_address: '0xa123456789012345678901234567890123456789',
      key_hash: 'hashed',
    });
    expect(json).toEqual({ key: 'art_sk_raw' });
  });

  it('calls ensureArtists before insertApiKey', async () => {
    const order: string[] = [];
    vi.mocked(ensureArtists).mockImplementation(async () => {
      order.push('ensure');
    });
    vi.mocked(insertApiKey).mockImplementation(async () => {
      order.push('insert');
      return { error: null } as any;
    });

    await createArtistApiKeyHandler({
      artistAddress: '0xa123456789012345678901234567890123456789',
      key_name: 'n',
    });

    expect(order).toEqual(['ensure', 'insert']);
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
