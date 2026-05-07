import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/privy/getAddressesByAuthToken', () => ({
  getAddressesByAuthToken: vi.fn(),
}));

import { getAddressesByAuthToken } from '@/lib/privy/getAddressesByAuthToken';
import { AuthErrorMessages } from '@/errors';
import { AuthMethod } from '@/types/auth';
import authenticateWithBearerToken from '@/lib/auth/authenticateWithBearerToken';

const ARTIST_ADDRESS = '0xartist';
const SOCIAL_WALLET = '0xsocial';

describe('authenticateWithBearerToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns artistAddress when both artistAddress and socialWallet are present', async () => {
    vi.mocked(getAddressesByAuthToken).mockResolvedValue({
      artistAddress: ARTIST_ADDRESS,
      socialWallet: SOCIAL_WALLET,
    } as any);

    const result = await authenticateWithBearerToken('token');

    expect(result).toEqual({
      artistAddress: ARTIST_ADDRESS,
      authMethod: AuthMethod.Privy,
    });
  });

  it('falls back to socialWallet when artistAddress is empty', async () => {
    vi.mocked(getAddressesByAuthToken).mockResolvedValue({
      artistAddress: '',
      socialWallet: SOCIAL_WALLET,
    } as any);

    const result = await authenticateWithBearerToken('token');

    expect(result).toEqual({
      artistAddress: SOCIAL_WALLET,
      authMethod: AuthMethod.Privy,
    });
  });

  it('throws NO_SOCIAL_OR_ARTIST_WALLET when both artistAddress and socialWallet are empty', async () => {
    vi.mocked(getAddressesByAuthToken).mockResolvedValue({
      artistAddress: '',
      socialWallet: '',
    } as any);

    await expect(authenticateWithBearerToken('token')).rejects.toThrow(
      AuthErrorMessages.NO_SOCIAL_OR_ARTIST_WALLET
    );
  });

  it('throws when getAddressesByAuthToken throws', async () => {
    vi.mocked(getAddressesByAuthToken).mockRejectedValue(
      new Error('Invalid authentication token')
    );

    await expect(authenticateWithBearerToken('bad-token')).rejects.toThrow(
      'Invalid authentication token'
    );
  });
});
