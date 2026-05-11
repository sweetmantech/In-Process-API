import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/privy/client', () => ({
  default: {
    users: vi.fn(),
  },
}));

import privyClient from '@/lib/privy/client';
import getEmailByWalletAddress from '@/lib/privy/getEmailByWalletAddress';

describe('getEmailByWalletAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns email when user has an email account', async () => {
    vi.mocked(privyClient.users).mockReturnValue({
      getByWalletAddress: vi.fn().mockResolvedValue({
        linked_accounts: [
          { type: 'wallet', address: '0xabc' },
          { type: 'email', address: 'user@example.com' },
        ],
      }),
    } as any);

    const result = await getEmailByWalletAddress('0xabc');

    expect(result).toBe('user@example.com');
  });

  it('returns null when user has no email account', async () => {
    vi.mocked(privyClient.users).mockReturnValue({
      getByWalletAddress: vi.fn().mockResolvedValue({
        linked_accounts: [{ type: 'wallet', address: '0xabc' }],
      }),
    } as any);

    const result = await getEmailByWalletAddress('0xabc');

    expect(result).toBeNull();
  });

  it('returns null when user has no linked accounts', async () => {
    vi.mocked(privyClient.users).mockReturnValue({
      getByWalletAddress: vi.fn().mockResolvedValue({
        linked_accounts: [],
      }),
    } as any);

    const result = await getEmailByWalletAddress('0xabc');

    expect(result).toBeNull();
  });

  it('returns null when privy throws', async () => {
    vi.mocked(privyClient.users).mockReturnValue({
      getByWalletAddress: vi.fn().mockRejectedValue(new Error('not found')),
    } as any);

    const result = await getEmailByWalletAddress('0xunknown');

    expect(result).toBeNull();
  });

  it('passes the address to privy getByWalletAddress', async () => {
    const mockGetByWalletAddress = vi.fn().mockResolvedValue({
      linked_accounts: [{ type: 'email', address: 'user@example.com' }],
    });
    vi.mocked(privyClient.users).mockReturnValue({
      getByWalletAddress: mockGetByWalletAddress,
    } as any);

    await getEmailByWalletAddress('0xdeadbeef');

    expect(mockGetByWalletAddress).toHaveBeenCalledWith({
      address: '0xdeadbeef',
    });
  });
});
