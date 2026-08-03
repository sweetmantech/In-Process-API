import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CHAIN_ID, USDC_ADDRESS } from '@/lib/consts';
import { zeroAddress } from 'viem';

const mockRange = vi.fn();
const mockOrder = vi.fn(() => ({ range: mockRange }));
const mockNot = vi.fn(() => ({ order: mockOrder }));
const mockEqChain = vi.fn(() => ({ not: mockNot }));
const mockEqRecipient = vi.fn(() => ({ eq: mockEqChain }));
const mockSelect = vi.fn(() => ({ eq: mockEqRecipient }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('@/lib/supabase/client', () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

import getCollectingStats, {
  emptyCollectingStats,
} from '../getCollectingStats';

describe('getCollectingStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEqRecipient });
    mockEqRecipient.mockReturnValue({ eq: mockEqChain });
    mockEqChain.mockReturnValue({ not: mockNot });
    mockNot.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ range: mockRange });
  });

  it('sums spend for transfers on the app chain', async () => {
    mockRange.mockResolvedValue({
      data: [
        { value: 0, currency: zeroAddress },
        { value: 1.5, currency: zeroAddress },
        { value: 2, currency: USDC_ADDRESS[CHAIN_ID] },
      ],
      error: null,
    });

    await expect(
      getCollectingStats('0xAbC0000000000000000000000000000000000001')
    ).resolves.toEqual({
      eth_spent: '1.5',
      usdc_spent: '2',
    });

    expect(mockFrom).toHaveBeenCalledWith('in_process_transfers');
    expect(mockEqRecipient).toHaveBeenCalledWith(
      'recipient',
      '0xabc0000000000000000000000000000000000001'
    );
    expect(mockEqChain).toHaveBeenCalledWith(
      'moment.collection.chain_id',
      CHAIN_ID
    );
    expect(mockNot).toHaveBeenCalledWith('value', 'is', null);
  });

  it('returns empty stats when the query fails', async () => {
    mockRange.mockResolvedValue({
      data: null,
      error: new Error('db failed'),
    });

    await expect(getCollectingStats('0xabc')).resolves.toEqual(
      emptyCollectingStats
    );
  });
});
