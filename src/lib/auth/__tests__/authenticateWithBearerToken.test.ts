import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('@/lib/privy/getWalletsByPrivyToken', () => ({
  getWalletsByPrivyToken: vi.fn(),
}));

import { getWalletsByPrivyToken } from '@/lib/privy/getWalletsByPrivyToken';
import { AuthMethod } from '@/types/auth';
import authenticateWithBearerToken from '@/lib/auth/authenticateWithBearerToken';

const PRIMARY_WALLET = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33' as Address;
const SECONDARY_WALLET =
  '0x0000000000000000000000000000000000000001' as Address;
const ARTIST_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

describe('authenticateWithBearerToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns wallets and authMethod when getWalletsByPrivyToken succeeds', async () => {
    const mockWallets = [
      { address: PRIMARY_WALLET, type: 'privy' as const },
      { address: SECONDARY_WALLET, type: 'external' as const },
    ];
    vi.mocked(getWalletsByPrivyToken).mockResolvedValue({
      primaryWallet: PRIMARY_WALLET,
      wallets: mockWallets,
      artistId: ARTIST_ID,
    });

    const result = await authenticateWithBearerToken('token');

    expect(getWalletsByPrivyToken).toHaveBeenCalledWith('token');
    expect(result).toEqual({
      primaryWallet: PRIMARY_WALLET,
      wallets: mockWallets,
      artistId: ARTIST_ID,
      authMethod: AuthMethod.Privy,
    });
  });

  it('throws when getWalletsByPrivyToken throws', async () => {
    vi.mocked(getWalletsByPrivyToken).mockRejectedValue(
      new Error('Invalid authentication token')
    );

    await expect(authenticateWithBearerToken('bad-token')).rejects.toThrow(
      'Invalid authentication token'
    );
  });
});
