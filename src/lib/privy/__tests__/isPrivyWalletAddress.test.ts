import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/privy/client', () => ({
  default: {
    users: vi.fn(),
  },
}));

import privyClient from '@/lib/privy/client';
import isPrivyWalletAddress from '@/lib/privy/isPrivyWalletAddress';

describe('isPrivyWalletAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when address is a privy embedded wallet', async () => {
    vi.mocked(privyClient.users).mockReturnValue({
      getByWalletAddress: vi.fn().mockResolvedValue({
        linked_accounts: [
          {
            type: 'wallet',
            wallet_client_type: 'privy',
            address: '0xPrivyWallet',
          },
        ],
      }),
    } as any);

    const result = await isPrivyWalletAddress('0xprivywallet');

    expect(result).toBe(true);
  });

  it('returns false when address is an external wallet', async () => {
    vi.mocked(privyClient.users).mockReturnValue({
      getByWalletAddress: vi.fn().mockResolvedValue({
        linked_accounts: [
          {
            type: 'wallet',
            wallet_client_type: 'metamask',
            address: '0xExternalWallet',
          },
        ],
      }),
    } as any);

    const result = await isPrivyWalletAddress('0xexternalwallet');

    expect(result).toBe(false);
  });

  it('returns false when privy throws', async () => {
    vi.mocked(privyClient.users).mockReturnValue({
      getByWalletAddress: vi.fn().mockRejectedValue(new Error('not found')),
    } as any);

    const result = await isPrivyWalletAddress('0xunknown');

    expect(result).toBe(false);
  });
});
