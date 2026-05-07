import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api-keys/getArtistAddressByApiKey', () => ({
  getArtistAddressByApiKey: vi.fn(),
}));

import { getArtistAddressByApiKey } from '@/lib/api-keys/getArtistAddressByApiKey';
import { AuthMethod } from '@/types/auth';
import authenticateWithApiKey from '@/lib/auth/authenticateWithApiKey';

const ARTIST_ADDRESS = '0xabc123';

describe('authenticateWithApiKey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns artistAddress and ApiKey authMethod on success', async () => {
    vi.mocked(getArtistAddressByApiKey).mockResolvedValue(ARTIST_ADDRESS);

    const result = await authenticateWithApiKey('valid-key');

    expect(result).toEqual({
      artistAddress: ARTIST_ADDRESS,
      authMethod: AuthMethod.ApiKey,
    });
  });

  it('throws when getArtistAddressByApiKey throws', async () => {
    vi.mocked(getArtistAddressByApiKey).mockRejectedValue(
      new Error('Invalid API key')
    );

    await expect(authenticateWithApiKey('bad-key')).rejects.toThrow(
      'Invalid API key'
    );
  });
});
