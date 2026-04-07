import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/consts', () => ({
  IS_TESTNET: false,
  SITE_ORIGINAL_URL: 'https://inprocess.world',
}));

import getMomentSuccessMessage from '@/lib/moment/getMomentSuccessMessage';

describe('getMomentSuccessMessage', () => {
  it('returns the editing URL on mainnet', () => {
    expect(getMomentSuccessMessage('0xContract', '42')).toBe(
      'Moment created, ready for editing at https://inprocess.world/sms/base:0xContract/42'
    );
  });

  it('uses bsep chain on testnet', async () => {
    vi.resetModules();
    vi.doMock('@/lib/consts', () => ({
      IS_TESTNET: true,
      SITE_ORIGINAL_URL: 'https://inprocess.world',
    }));
    const { default: getMomentSuccessMessageTestnet } =
      await import('@/lib/moment/getMomentSuccessMessage');
    expect(getMomentSuccessMessageTestnet('0xContract', '42')).toBe(
      'Moment created, ready for editing at https://inprocess.world/sms/bsep:0xContract/42'
    );
  });
});
