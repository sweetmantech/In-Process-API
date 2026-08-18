import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
  IS_TESTNET: false,
}));

vi.mock('@/lib/coinbase/getWalletSmartAccount', () => ({
  getWalletSmartAccount: vi.fn(),
}));

vi.mock('@/lib/splits/normalizeSplitRecipients', () => ({
  normalizeSplitRecipients: vi.fn(),
}));

vi.mock('@/lib/splits/processSplits', () => ({
  processSplits: vi.fn(),
}));

import { getWalletSmartAccount } from '@/lib/coinbase/getWalletSmartAccount';
import { normalizeSplitRecipients } from '@/lib/splits/normalizeSplitRecipients';
import { processSplits } from '@/lib/splits/processSplits';
import createSplitsHandler from '@/lib/splits/createSplitsHandler';

const CALLER = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`;
const RECIPIENT = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as `0x${string}`;
const SPLIT_ADDRESS =
  '0xcccccccccccccccccccccccccccccccccccccccc' as `0x${string}`;

const splits = [
  { address: CALLER, percentAllocation: 60 },
  { address: RECIPIENT, percentAllocation: 40 },
];

const input = {
  artist: {
    artistId: 'artist-uuid',
    primaryWallet: CALLER,
    wallets: [],
  },
  splits,
};

const smartAccount = { address: CALLER };

describe('createSplitsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getWalletSmartAccount).mockResolvedValue(smartAccount as any);
    vi.mocked(normalizeSplitRecipients).mockResolvedValue(splits as any);
    vi.mocked(processSplits).mockResolvedValue({ splitAddress: SPLIT_ADDRESS });
  });

  it('creates a split with the artist smart wallet and returns the address', async () => {
    const result = await createSplitsHandler(input);

    expect(getWalletSmartAccount).toHaveBeenCalledWith({ address: CALLER });
    expect(normalizeSplitRecipients).toHaveBeenCalledWith(splits);
    expect(processSplits).toHaveBeenCalledWith(splits, smartAccount);
    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(200);
    await expect(result.json()).resolves.toEqual({
      splitAddress: SPLIT_ADDRESS,
      chainId: 8453,
    });
  });

  it('returns 500 when processSplits does not return an address', async () => {
    vi.mocked(processSplits).mockResolvedValue({ splitAddress: null });

    const result = await createSplitsHandler(input);

    expect(result.status).toBe(500);
    await expect(result.json()).resolves.toEqual({
      message: 'Failed to create split',
    });
  });
});
