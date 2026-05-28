import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('@/lib/farcaster/getWalletsByFarcasterToken', () => ({
  getWalletsByFarcasterToken: vi.fn(),
}));

import { getWalletsByFarcasterToken } from '@/lib/farcaster/getWalletsByFarcasterToken';
import { AuthMethod } from '@/types/auth';
import authenticateWithFarcasterToken from '@/lib/auth/authenticateWithFarcasterToken';

const ARTIST_ADDRESS = '0xartist' as Address;

describe('authenticateWithFarcasterToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns wallets and Farcaster authMethod on success', async () => {
    const mockWallets = [
      { address: ARTIST_ADDRESS, type: 'farcaster' as const },
    ];
    vi.mocked(getWalletsByFarcasterToken).mockResolvedValue({
      primaryWallet: ARTIST_ADDRESS,
      wallets: mockWallets,
      artistId: 'artist-uuid',
    });

    const result = await authenticateWithFarcasterToken('valid-token');

    expect(getWalletsByFarcasterToken).toHaveBeenCalledWith('valid-token');
    expect(result).toEqual({
      primaryWallet: ARTIST_ADDRESS,
      wallets: mockWallets,
      artistId: 'artist-uuid',
      authMethod: AuthMethod.Farcaster,
    });
  });

  it('propagates errors from getWalletsByFarcasterToken', async () => {
    vi.mocked(getWalletsByFarcasterToken).mockRejectedValue(
      new Error('Invalid signature')
    );

    await expect(authenticateWithFarcasterToken('token')).rejects.toThrow(
      'Invalid signature'
    );
  });
});
