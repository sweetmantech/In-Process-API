import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/arweave/getWincCostForBytes', () => ({ default: vi.fn() }));
vi.mock('@/lib/arweave/getUsdcPriceForBytes', () => ({ default: vi.fn() }));
vi.mock('@/lib/upload/isMonthlyFreeUploadAvailable', () => ({
  default: vi.fn(),
}));

import getWincCostForBytes from '@/lib/arweave/getWincCostForBytes';
import getUsdcPriceForBytes from '@/lib/arweave/getUsdcPriceForBytes';
import isMonthlyFreeUploadAvailable from '@/lib/upload/isMonthlyFreeUploadAvailable';
import getUploadType from '@/lib/upload/getUploadType';
import { FREE_TIER_MAX_BYTES } from '@/lib/consts';

const ARTIST = '0xabc';
const SMALL = FREE_TIER_MAX_BYTES - 1;
const LARGE = FREE_TIER_MAX_BYTES;
const USDC = BigInt(5000);

describe('getUploadType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUsdcPriceForBytes).mockResolvedValue(USDC);
  });

  it('returns free with 0 usdcAmountMicros when winc is 0', async () => {
    vi.mocked(getWincCostForBytes).mockResolvedValue('0');

    const result = await getUploadType(ARTIST, SMALL);

    expect(result).toEqual({ uploadType: 'free', usdcAmountMicros: BigInt(0) });
    expect(isMonthlyFreeUploadAvailable).not.toHaveBeenCalled();
    expect(getUsdcPriceForBytes).not.toHaveBeenCalled();
  });

  it('returns paid with usdcAmountMicros when size >= FREE_TIER_MAX_BYTES', async () => {
    vi.mocked(getWincCostForBytes).mockResolvedValue('1000');

    const result = await getUploadType(ARTIST, LARGE);

    expect(result).toEqual({ uploadType: 'paid', usdcAmountMicros: USDC });
    expect(isMonthlyFreeUploadAvailable).not.toHaveBeenCalled();
  });

  it('returns free when monthly quota is available', async () => {
    vi.mocked(getWincCostForBytes).mockResolvedValue('1000');
    vi.mocked(isMonthlyFreeUploadAvailable).mockResolvedValue({
      available: true,
    });

    const result = await getUploadType(ARTIST, SMALL);

    expect(result).toEqual({ uploadType: 'free', usdcAmountMicros: BigInt(0) });
    expect(getUsdcPriceForBytes).not.toHaveBeenCalled();
  });

  it('returns paid when monthly quota is exhausted', async () => {
    vi.mocked(getWincCostForBytes).mockResolvedValue('1000');
    vi.mocked(isMonthlyFreeUploadAvailable).mockResolvedValue({
      available: false,
    });

    const result = await getUploadType(ARTIST, SMALL);

    expect(result).toEqual({ uploadType: 'paid', usdcAmountMicros: USDC });
    expect(getUsdcPriceForBytes).toHaveBeenCalledWith(SMALL);
  });

  it('propagates error from isMonthlyFreeUploadAvailable', async () => {
    vi.mocked(getWincCostForBytes).mockResolvedValue('1000');
    vi.mocked(isMonthlyFreeUploadAvailable).mockResolvedValue({
      error: 'Failed to check upload quota',
      status: 500,
    });

    const result = await getUploadType(ARTIST, SMALL);

    expect(result).toEqual({
      error: 'Failed to check upload quota',
      status: 500,
    });
  });
});
