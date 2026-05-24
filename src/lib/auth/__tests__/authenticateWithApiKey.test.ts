import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api-keys/getAuthorizedAddressByApiKey', () => ({
  getAuthorizedAddressByApiKey: vi.fn(),
}));

import { getAuthorizedAddressByApiKey } from '@/lib/api-keys/getAuthorizedAddressByApiKey';
import { AuthMethod } from '@/types/auth';
import authenticateWithApiKey from '@/lib/auth/authenticateWithApiKey';

const ARTIST_ADDRESS = '0xabc123';

describe('authenticateWithApiKey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns artistAddress and ApiKey authMethod on success', async () => {
    vi.mocked(getAuthorizedAddressByApiKey).mockResolvedValue(ARTIST_ADDRESS);

    const result = await authenticateWithApiKey('valid-key');

    expect(result).toEqual({
      artistAddress: ARTIST_ADDRESS,
      authMethod: AuthMethod.ApiKey,
    });
  });

  it('throws when getAuthorizedAddressByApiKey throws', async () => {
    vi.mocked(getAuthorizedAddressByApiKey).mockRejectedValue(
      new Error('Invalid API key')
    );

    await expect(authenticateWithApiKey('bad-key')).rejects.toThrow(
      'Invalid API key'
    );
  });
});
