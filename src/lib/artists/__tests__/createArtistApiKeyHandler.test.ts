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

import { generateApiKey } from '@/lib/api-keys/generateApiKey';
import { hashApiKey } from '@/lib/api-keys/hashApiKey';
import { insertApiKey } from '@/lib/supabase/in_process_api_keys/insertApiKey';
import createArtistApiKeyHandler from '@/lib/artists/createArtistApiKeyHandler';
import { PRIVY_PROJECT_SECRET } from '@/lib/consts';

const ARTIST_UUID = '00000000-0000-0000-0000-000000000001';

describe('createArtistApiKeyHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(insertApiKey).mockResolvedValue(undefined);
  });

  it('generates and inserts the api key for the artist', async () => {
    const res = await createArtistApiKeyHandler({
      artistId: ARTIST_UUID,
      key_name: '  prod  ',
    });
    const json = await res.json();

    expect(generateApiKey).toHaveBeenCalledWith('art_sk');
    expect(hashApiKey).toHaveBeenCalledWith('art_sk_raw', PRIVY_PROJECT_SECRET);
    expect(insertApiKey).toHaveBeenCalledWith({
      name: 'prod',
      artist_id: ARTIST_UUID,
      key_hash: 'hashed',
    });
    expect(json).toEqual({ key: 'art_sk_raw' });
  });

  it('propagates errors from insertApiKey', async () => {
    vi.mocked(insertApiKey).mockRejectedValue(new Error('insert failed'));

    await expect(
      createArtistApiKeyHandler({
        artistId: ARTIST_UUID,
        key_name: 'n',
      })
    ).rejects.toThrow('insert failed');
  });
});
