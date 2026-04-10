import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/splits/isSplitContract', () => ({ default: vi.fn() }));
vi.mock('@/lib/splits/distribute', () => ({ distribute: vi.fn() }));
vi.mock('@/lib/getRetryDelay', () => ({
  getRetryDelay: vi.fn().mockReturnValue(0),
}));
vi.mock('@/lib/isRateLimitError', () => ({
  isRateLimitError: vi.fn().mockReturnValue(false),
}));

import { distribute } from '../distribute';
import isSplitContract from '@/lib/splits/isSplitContract';
import { distribute as splitDistribute } from '@/lib/splits/distribute';

const mockIsSplit = vi.mocked(isSplitContract);
const mockSplitDistribute = vi.mocked(splitDistribute);

const deposit = {
  id: '1',
  collection: '0xcol',
  token_id: '1',
  currency: '0xUSDC',
  recipient: '0xrecipient',
  spender: '0xspender',
  amount: '1.0',
  chain_id: 8453,
  transaction_hash: '0xtx',
  transferred_at: 1000,
};

describe('distribute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
      fn();
      return 0 as any;
    });
  });

  it('skips non-split recipients', async () => {
    mockIsSplit.mockResolvedValue(false);
    await distribute([deposit]);
    expect(mockSplitDistribute).not.toHaveBeenCalled();
  });

  it('distributes to split recipients', async () => {
    mockIsSplit.mockResolvedValue(true);
    mockSplitDistribute.mockResolvedValue(undefined as any);

    await distribute([deposit]);

    expect(mockSplitDistribute).toHaveBeenCalledWith({
      splitAddress: deposit.recipient,
      tokenAddress: deposit.currency,
      chainId: deposit.chain_id,
    });
  });

  it('retries on failure up to maxRetries times', async () => {
    mockIsSplit.mockResolvedValue(true);
    mockSplitDistribute
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'));

    await expect(distribute([deposit])).resolves.not.toThrow();
    expect(mockSplitDistribute).toHaveBeenCalledTimes(4); // 1 + 3 retries
  });

  it('succeeds if retry succeeds', async () => {
    mockIsSplit.mockResolvedValue(true);
    mockSplitDistribute
      .mockRejectedValueOnce(new Error('transient'))
      .mockResolvedValueOnce(undefined as any);

    await distribute([deposit]);
    expect(mockSplitDistribute).toHaveBeenCalledTimes(2);
  });

  it('handles empty deposits array', async () => {
    await distribute([]);
    expect(mockIsSplit).not.toHaveBeenCalled();
  });
});
