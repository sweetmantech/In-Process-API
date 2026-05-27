import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));

import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import getSmartWalletAddress from '@/lib/smartwallets/getSmartWalletAddress';

const ARTIST_ADDRESS = '0xArtist000000000000000000000000000000000' as const;
const SMART_WALLET = '0xSmartWallet0000000000000000000000000000' as const;

describe('getSmartWalletAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns existing smart_wallet_address from DB (lowercased)', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ smart_wallet_address: SMART_WALLET }],
      error: null,
    } as any);

    const result = await getSmartWalletAddress(ARTIST_ADDRESS);

    expect(result).toBe(SMART_WALLET.toLowerCase());
    expect(getOrCreateSmartWallet).not.toHaveBeenCalled();
  });

  it('lowercases the address before querying DB', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ smart_wallet_address: SMART_WALLET }],
      error: null,
    } as any);

    await getSmartWalletAddress('0xABCDEF' as any);

    expect(selectWallets).toHaveBeenCalledWith({ addresses: ['0xabcdef'] });
  });

  it('throws when selectWallets rejects', async () => {
    vi.mocked(selectWallets).mockRejectedValue(new Error('DB failure'));

    await expect(getSmartWalletAddress(ARTIST_ADDRESS)).rejects.toThrow(
      'Failed to get or create smart wallet'
    );
    expect(getOrCreateSmartWallet).not.toHaveBeenCalled();
  });

  it('calls getOrCreateSmartWallet when wallet has no smart_wallet_address', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ smart_wallet_address: null }],
      error: null,
    } as any);
    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
      address: SMART_WALLET,
    } as any);

    const result = await getSmartWalletAddress(ARTIST_ADDRESS);

    expect(getOrCreateSmartWallet).toHaveBeenCalledWith({
      address: ARTIST_ADDRESS.toLowerCase(),
    });
    expect(result).toBe(SMART_WALLET.toLowerCase());
  });

  it('calls getOrCreateSmartWallet when wallet is not found in DB', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [],
      error: null,
    } as any);
    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
      address: SMART_WALLET,
    } as any);

    const result = await getSmartWalletAddress(ARTIST_ADDRESS);

    expect(getOrCreateSmartWallet).toHaveBeenCalled();
    expect(result).toBe(SMART_WALLET.toLowerCase());
  });

  it('throws wrapped error when getOrCreateSmartWallet returns no address', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [],
      error: null,
    } as any);
    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
      address: undefined,
    } as any);

    await expect(getSmartWalletAddress(ARTIST_ADDRESS)).rejects.toThrow(
      'Failed to get or create smart wallet'
    );
  });

  it('throws wrapped error when getOrCreateSmartWallet rejects', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [],
      error: null,
    } as any);
    vi.mocked(getOrCreateSmartWallet).mockRejectedValue(
      new Error('Coinbase API down')
    );

    await expect(getSmartWalletAddress(ARTIST_ADDRESS)).rejects.toThrow(
      'Failed to get or create smart wallet'
    );
  });
});
