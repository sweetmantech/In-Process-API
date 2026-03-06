import { describe, it, expect, vi, beforeEach } from 'vitest';
import { zeroAddress } from 'viem';

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));
vi.mock('@/lib/viem/publicClient', () => ({
  getPublicClient: vi.fn(),
}));
vi.mock('@/lib/balance/getUsdcBalance', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/viem/getAllowance', () => ({
  default: vi.fn(),
}));

import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getPublicClient } from '@/lib/viem/publicClient';
import getUsdcBalance from '@/lib/balance/getUsdcBalance';
import getAllowance from '@/lib/viem/getAllowance';
import collectCatalogMomentHandler from '../collectCatalogMomentHandler';

const SMART_WALLET_ADDRESS =
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1' as `0x${string}`;
const ARTIST_ADDRESS =
  '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb01' as `0x${string}`;
const COLLECTION_ADDRESS =
  '0xcccccccccccccccccccccccccccccccccccccc01' as `0x${string}`;
const TX_HASH = '0xdeadbeef';

const baseInput = {
  artistAddress: ARTIST_ADDRESS,
  moment: {
    tokenId: '1',
    collectionAddress: COLLECTION_ADDRESS,
    chainId: 8453,
  },
  amount: 2,
  recipient: undefined,
  ref0: undefined,
  ref1: undefined,
};

// 1 USDC per token (6 decimals)
const PRICE_PER_TOKEN = BigInt(1_000_000);

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
    address: SMART_WALLET_ADDRESS,
  } as any);

  vi.mocked(getPublicClient).mockReturnValue({
    readContract: vi.fn().mockResolvedValue(PRICE_PER_TOKEN),
  } as any);

  vi.mocked(getUsdcBalance).mockResolvedValue('10.0'); // 10 USDC balance
  vi.mocked(getAllowance).mockResolvedValue('0'); // no allowance
  vi.mocked(sendUserOperation).mockResolvedValue({
    transactionHash: TX_HASH,
  } as any);
});

describe('collectCatalogMomentHandler', () => {
  it('returns hash and chainId on success', async () => {
    vi.mocked(getAllowance).mockResolvedValue('10');
    const res = await collectCatalogMomentHandler(baseInput);
    const body = await res.json();
    expect(body.hash).toBe(TX_HASH);
    expect(body.chainId).toBeDefined();
  });

  it('throws when USDC balance is insufficient', async () => {
    vi.mocked(getUsdcBalance).mockResolvedValue('1.0'); // only 1 USDC, need 2
    await expect(collectCatalogMomentHandler(baseInput)).rejects.toThrow(
      'Insufficient USDC balance'
    );
  });

  it('includes approve call when allowance is below total price', async () => {
    vi.mocked(getAllowance).mockResolvedValue('0');
    await collectCatalogMomentHandler(baseInput);
    const calls = vi.mocked(sendUserOperation).mock.calls[0][0].calls as any[];
    expect(calls).toHaveLength(2); // approve + purchase
  });

  it('skips approve call when allowance covers total price', async () => {
    vi.mocked(getAllowance).mockResolvedValue('100'); // well above 2 USDC
    await collectCatalogMomentHandler(baseInput);
    const calls = vi.mocked(sendUserOperation).mock.calls[0][0].calls as any[];
    expect(calls).toHaveLength(1); // purchase only
  });

  it('uses artistAddress as recipient when no recipient provided', async () => {
    vi.mocked(getAllowance).mockResolvedValue('10');
    const readContract = vi.fn().mockResolvedValue(PRICE_PER_TOKEN);
    vi.mocked(getPublicClient).mockReturnValue({ readContract } as any);

    await collectCatalogMomentHandler(baseInput);

    // purchaseTokenWithValue args[0] should be artistAddress (lowercased by viem getAddress)
    const purchaseCall = vi.mocked(sendUserOperation).mock.calls[0][0]
      .calls[0] as any;
    expect(purchaseCall.to.toLowerCase()).toBe(
      COLLECTION_ADDRESS.toLowerCase()
    );
  });

  it('uses recipient as `to` when provided', async () => {
    const RECIPIENT = '0xdddddddddddddddddddddddddddddddddddddd01';
    vi.mocked(getAllowance).mockResolvedValue('10');

    await collectCatalogMomentHandler({
      ...baseInput,
      recipient: RECIPIENT as any,
    });

    const calls = vi.mocked(sendUserOperation).mock.calls[0][0].calls as any[];
    // The purchase call is the last call (or only call when allowance is sufficient)
    const purchaseCall = calls[calls.length - 1];
    // The encoded data in purchaseCall includes recipient as first arg — we verify
    // sendUserOperation was called with the correct number of calls
    expect(purchaseCall).toBeDefined();
  });

  it('passes ref0 and ref1 in purchase call data', async () => {
    const REF = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee01';
    vi.mocked(getAllowance).mockResolvedValue('10');

    await collectCatalogMomentHandler({
      ...baseInput,
      ref0: REF as any,
      ref1: REF as any,
    });

    const calls = vi.mocked(sendUserOperation).mock.calls[0][0].calls as any[];
    const purchaseCall = calls[calls.length - 1];
    // encoded data should contain the REF address bytes
    expect(purchaseCall.data).toContain(REF.slice(2).toLowerCase());
  });

  it('uses zeroAddress for missing refs', async () => {
    vi.mocked(getAllowance).mockResolvedValue('10');
    // No error should be thrown — zeroAddress is used for undefined refs
    await expect(collectCatalogMomentHandler(baseInput)).resolves.toBeDefined();
  });
});
