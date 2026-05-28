import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/coinbase/getWalletLinkedSmartAccount', () => ({
  getWalletLinkedSmartAccount: vi.fn(),
}));

import { getWalletLinkedSmartAccount } from '@/lib/coinbase/getWalletLinkedSmartAccount';
import getSmartWalletAddress from '@/lib/smartwallets/getSmartWalletAddress';

const WALLET = '0xArtist000000000000000000000000000000000' as const;
const SMART_WALLET = '0xSmartWallet0000000000000000000000000000' as const;

describe('getSmartWalletAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the linked smart account address lowercased', async () => {
    vi.mocked(getWalletLinkedSmartAccount).mockResolvedValue({
      address: SMART_WALLET,
    } as any);

    const result = await getSmartWalletAddress(WALLET);

    expect(result).toBe(SMART_WALLET.toLowerCase());
    expect(getWalletLinkedSmartAccount).toHaveBeenCalledWith({
      address: WALLET.toLowerCase(),
    });
  });

  it('lowercases the wallet address before lookup', async () => {
    vi.mocked(getWalletLinkedSmartAccount).mockResolvedValue({
      address: SMART_WALLET,
    } as any);

    await getSmartWalletAddress('0xABCDEF' as any);

    expect(getWalletLinkedSmartAccount).toHaveBeenCalledWith({
      address: '0xabcdef',
    });
  });

  it('propagates when getWalletLinkedSmartAccount rejects', async () => {
    vi.mocked(getWalletLinkedSmartAccount).mockRejectedValue(
      new Error('Coinbase API down')
    );

    await expect(getSmartWalletAddress(WALLET)).rejects.toThrow(
      'Coinbase API down'
    );
  });
});
