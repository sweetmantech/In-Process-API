import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/splits/processSplits', () => ({
  processSplits: vi.fn(),
}));

import { processSplits } from '@/lib/splits/processSplits';
import resolvePayoutRecipient from '@/lib/moment/resolvePayoutRecipient';

const SPLIT_ADDRESS = '0x1111111111111111111111111111111111111111' as const;
const DEFAULT_PAYOUT = '0x2222222222222222222222222222222222222222' as const;
const SMART_ACCOUNT = {
  address: '0x3333333333333333333333333333333333333333',
} as any;

const split1 = {
  address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  percentAllocation: 50,
};
const split2 = {
  address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  percentAllocation: 50,
};

describe('resolvePayoutRecipient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the split address when splits >= 2 and processSplits returns one', async () => {
    vi.mocked(processSplits).mockResolvedValue({ splitAddress: SPLIT_ADDRESS });

    const result = await resolvePayoutRecipient({
      resolvedSplits: [split1, split2],
      smartAccount: SMART_ACCOUNT,
      defaultPayoutRecipient: DEFAULT_PAYOUT,
    });

    expect(result?.toLowerCase()).toBe(SPLIT_ADDRESS.toLowerCase());
  });

  it('calls processSplits with the resolved splits and smart account', async () => {
    vi.mocked(processSplits).mockResolvedValue({ splitAddress: SPLIT_ADDRESS });

    await resolvePayoutRecipient({
      resolvedSplits: [split1, split2],
      smartAccount: SMART_ACCOUNT,
      defaultPayoutRecipient: DEFAULT_PAYOUT,
    });

    expect(processSplits).toHaveBeenCalledWith([split1, split2], SMART_ACCOUNT);
  });

  it('returns default when fewer than 2 splits', async () => {
    const result = await resolvePayoutRecipient({
      resolvedSplits: [split1],
      smartAccount: SMART_ACCOUNT,
      defaultPayoutRecipient: DEFAULT_PAYOUT,
    });

    expect(result).toBe(DEFAULT_PAYOUT);
    expect(processSplits).not.toHaveBeenCalled();
  });

  it('returns default when splits is empty', async () => {
    const result = await resolvePayoutRecipient({
      resolvedSplits: [],
      smartAccount: SMART_ACCOUNT,
      defaultPayoutRecipient: DEFAULT_PAYOUT,
    });

    expect(result).toBe(DEFAULT_PAYOUT);
    expect(processSplits).not.toHaveBeenCalled();
  });

  it('returns default when processSplits returns null splitAddress', async () => {
    vi.mocked(processSplits).mockResolvedValue({ splitAddress: null });

    const result = await resolvePayoutRecipient({
      resolvedSplits: [split1, split2],
      smartAccount: SMART_ACCOUNT,
      defaultPayoutRecipient: DEFAULT_PAYOUT,
    });

    expect(result).toBe(DEFAULT_PAYOUT);
  });

  it('returns undefined when no default and splits is empty', async () => {
    const result = await resolvePayoutRecipient({
      resolvedSplits: [],
      smartAccount: SMART_ACCOUNT,
      defaultPayoutRecipient: undefined,
    });

    expect(result).toBeUndefined();
  });
});
