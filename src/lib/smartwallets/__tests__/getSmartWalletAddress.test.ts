import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));

import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import getSmartWalletAddress from '@/lib/smartwallets/getSmartWalletAddress';

const ARTIST_ADDRESS = '0xArtist000000000000000000000000000000000' as const;
const SMART_WALLET = '0xSmartWallet0000000000000000000000000000' as const;

describe('getSmartWalletAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns existing smart_wallet from DB (lowercased)', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [{ smart_wallet: SMART_WALLET }],
      count: 1,
      error: null,
    } as any);

    const result = await getSmartWalletAddress(ARTIST_ADDRESS);

    expect(result).toBe(SMART_WALLET.toLowerCase());
    expect(getOrCreateSmartWallet).not.toHaveBeenCalled();
  });

  it('lowercases the address before querying DB', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [{ smart_wallet: SMART_WALLET }],
      count: 1,
      error: null,
    } as any);

    await getSmartWalletAddress('0xABCDEF' as any);

    expect(selectArtists).toHaveBeenCalledWith({ address: '0xabcdef' });
  });

  it('throws when selectArtists returns an error', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: null,
      count: null,
      error: { message: 'DB failure' },
    } as any);

    await expect(getSmartWalletAddress(ARTIST_ADDRESS)).rejects.toThrow(
      'DB failure'
    );
    expect(getOrCreateSmartWallet).not.toHaveBeenCalled();
  });

  it('calls getOrCreateSmartWallet when artist has no smart_wallet', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [{ smart_wallet: null }],
      count: 1,
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

  it('calls getOrCreateSmartWallet when artist is not found in DB', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [],
      count: 0,
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
    vi.mocked(selectArtists).mockResolvedValue({
      data: [],
      count: 0,
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
    vi.mocked(selectArtists).mockResolvedValue({
      data: [],
      count: 0,
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
