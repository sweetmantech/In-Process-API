import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/privy/createPrivyEmbeddedWallet', () => ({
  default: vi.fn(),
}));

import createPrivyEmbeddedWallet from '@/lib/privy/createPrivyEmbeddedWallet';
import ensurePrivySocialWallet from '@/lib/privy/ensurePrivySocialWallet';

const authData = () => ({
  token: 'privy-token-abc',
  user: { id: 'did:privy:abc', linked_accounts: [] },
});

describe('ensurePrivySocialWallet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns existing privy wallet without calling create', async () => {
    const wallet = await ensurePrivySocialWallet({
      token: 't',
      user: {
        id: 'did:privy:abc',
        linked_accounts: [
          {
            type: 'wallet',
            wallet_client_type: 'privy',
            address: '0xExisting',
          },
        ],
      },
    });

    expect(wallet).toBe('0xexisting');
    expect(createPrivyEmbeddedWallet).not.toHaveBeenCalled();
  });

  it('creates wallet when none exists', async () => {
    vi.mocked(createPrivyEmbeddedWallet).mockResolvedValue('0xnewwallet');

    const wallet = await ensurePrivySocialWallet(authData());

    expect(createPrivyEmbeddedWallet).toHaveBeenCalledWith('did:privy:abc');
    expect(wallet).toBe('0xnewwallet');
  });

  it('throws when Privy user id is missing', async () => {
    await expect(
      ensurePrivySocialWallet({ token: 'privy-token-abc' })
    ).rejects.toThrow('Privy user id missing');
  });
});
