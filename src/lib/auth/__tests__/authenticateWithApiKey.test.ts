import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/wallets/getWalletsByApiKey', () => ({
  getWalletsByApiKey: vi.fn(),
}));

import { getWalletsByApiKey } from '@/lib/wallets/getWalletsByApiKey';
import { AuthMethod } from '@/types/auth';
import authenticateWithApiKey from '@/lib/auth/authenticateWithApiKey';

const WALLET_DATA = {
  primaryWallet: '0xabc123' as const,
  wallets: ['0xabc123' as const],
  artistId: 'artist-uuid',
};

describe('authenticateWithApiKey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns wallets and ApiKey authMethod on success', async () => {
    vi.mocked(getWalletsByApiKey).mockResolvedValue(WALLET_DATA);

    const result = await authenticateWithApiKey('valid-key');

    expect(result).toEqual({
      ...WALLET_DATA,
      authMethod: AuthMethod.ApiKey,
    });
  });

  it('throws when getWalletsByApiKey throws', async () => {
    vi.mocked(getWalletsByApiKey).mockRejectedValue(
      new Error('Invalid API key')
    );

    await expect(authenticateWithApiKey('bad-key')).rejects.toThrow(
      'Invalid API key'
    );
  });
});
