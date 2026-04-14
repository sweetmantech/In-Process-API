import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/splits/isSplitContract', () => ({ default: vi.fn() }));
vi.mock('@/lib/splits/distribute', () => ({ distribute: vi.fn() }));
vi.mock('@/lib/getRetryDelay', () => ({ getRetryDelay: vi.fn(() => 0) }));
vi.mock('@/lib/isRateLimitError', () => ({
  isRateLimitError: vi.fn(() => false),
}));
vi.mock('@/lib/sleep', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

import { distribute } from '../distribute';
import isSplitContract from '@/lib/splits/isSplitContract';
import { distribute as splitDistribute } from '@/lib/splits/distribute';
import { getRetryDelay } from '@/lib/getRetryDelay';
import { isRateLimitError } from '@/lib/isRateLimitError';
import sleep from '@/lib/sleep';
import type { Transfers_t } from '@/types/envio';
import { zeroAddress } from 'viem';

const mockIsSplit = vi.mocked(isSplitContract);
const mockSplitDistribute = vi.mocked(splitDistribute);
const mockGetRetryDelay = vi.mocked(getRetryDelay);
const mockIsRateLimit = vi.mocked(isRateLimitError);
const mockSleep = vi.mocked(sleep);

const baseTransfer = (over: Partial<Transfers_t> = {}): Transfers_t => ({
  id: '1',
  collection: '0xcol',
  token_id: '1',
  chain_id: 8453,
  recipient: '0xrecipient00000000000000000000000000000001',
  quantity: '1',
  value: '1000000',
  currency: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  transaction_hash: '0xtx',
  transferred_at: 1700000000,
  ...over,
});

describe('distribute (transfers)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRetryDelay.mockReturnValue(0);
    mockIsRateLimit.mockReturnValue(false);
    mockSleep.mockResolvedValue(undefined);
  });

  it('does not call split distribute for empty input', async () => {
    await distribute([]);
    expect(mockSplitDistribute).not.toHaveBeenCalled();
    expect(mockIsSplit).not.toHaveBeenCalled();
  });

  it('skips when value is missing or zero', async () => {
    await distribute([
      baseTransfer({ value: undefined }),
      baseTransfer({ value: '0' }),
    ]);
    expect(mockIsSplit).not.toHaveBeenCalled();
    expect(mockSplitDistribute).not.toHaveBeenCalled();
  });

  it('skips split distribute when recipient is not a split contract', async () => {
    mockIsSplit.mockResolvedValue(false);
    await distribute([baseTransfer()]);
    expect(mockIsSplit).toHaveBeenCalled();
    expect(mockSplitDistribute).not.toHaveBeenCalled();
  });

  it('calls splitDistribute with currency when split and value > 0', async () => {
    const t = baseTransfer();
    mockIsSplit.mockResolvedValue(true);
    mockSplitDistribute.mockResolvedValue('0xhash1');

    await distribute([t]);

    expect(mockSplitDistribute).toHaveBeenCalledTimes(1);
    expect(mockSplitDistribute).toHaveBeenCalledWith({
      splitAddress: t.recipient,
      tokenAddress: t.currency,
      chainId: 8453,
    });
  });

  it('uses zeroAddress when currency is undefined', async () => {
    mockIsSplit.mockResolvedValue(true);
    mockSplitDistribute.mockResolvedValue('0xhash1');

    await distribute([baseTransfer({ currency: undefined })]);

    expect(mockSplitDistribute).toHaveBeenCalledWith({
      splitAddress: baseTransfer().recipient,
      tokenAddress: zeroAddress,
      chainId: 8453,
    });
  });

  it('retries on failure then succeeds', async () => {
    mockIsSplit.mockResolvedValue(true);
    mockSplitDistribute
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('0xhash2');

    await distribute([baseTransfer()]);

    expect(mockSplitDistribute).toHaveBeenCalledTimes(2);
    expect(mockGetRetryDelay).toHaveBeenCalled();
    expect(mockSleep).toHaveBeenCalled();
  });

  it('stops after maxRetries + 1 attempts without rethrowing', async () => {
    mockIsSplit.mockResolvedValue(true);
    mockSplitDistribute.mockRejectedValue(new Error('always fail'));

    await expect(distribute([baseTransfer()])).resolves.toBeUndefined();
    expect(mockSplitDistribute).toHaveBeenCalledTimes(4);
  });

  it('handles multiple transfers independently', async () => {
    mockIsSplit.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    mockSplitDistribute.mockResolvedValue('0xh');

    const a = baseTransfer({
      recipient: '0x1111111111111111111111111111111111111111',
    });
    const b = baseTransfer({
      id: '2',
      recipient: '0x2222222222222222222222222222222222222222',
      value: '1',
    });

    await distribute([a, b]);

    expect(mockSplitDistribute).toHaveBeenCalledTimes(1);
  });
});
