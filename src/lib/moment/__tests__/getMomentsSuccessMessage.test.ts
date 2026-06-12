import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/consts', () => ({
  IS_TESTNET: false,
  SITE_ORIGINAL_URL: 'https://inprocess.world',
}));

import getMomentsSuccessMessage from '@/lib/moment/getMomentsSuccessMessage';

describe('getMomentsSuccessMessage', () => {
  it('lists all tokenIds with their editing URLs on mainnet', () => {
    expect(getMomentsSuccessMessage('0xContract', ['1', '2', '3'])).toBe(
      'Moments created, ready for editing at:\n' +
        '#1: https://inprocess.world/sms/base:0xContract/1\n' +
        '#2: https://inprocess.world/sms/base:0xContract/2\n' +
        '#3: https://inprocess.world/sms/base:0xContract/3'
    );
  });

  it('uses bsep chain on testnet', async () => {
    vi.resetModules();
    vi.doMock('@/lib/consts', () => ({
      IS_TESTNET: true,
      SITE_ORIGINAL_URL: 'https://inprocess.world',
    }));
    const { default: getMomentsSuccessMessageTestnet } =
      await import('@/lib/moment/getMomentsSuccessMessage');
    expect(getMomentsSuccessMessageTestnet('0xContract', ['5'])).toBe(
      'Moments created, ready for editing at:\n' +
        '#5: https://inprocess.world/sms/bsep:0xContract/5'
    );
  });

  it('handles a single tokenId in the array', () => {
    expect(getMomentsSuccessMessage('0xContract', ['7'])).toBe(
      'Moments created, ready for editing at:\n' +
        '#7: https://inprocess.world/sms/base:0xContract/7'
    );
  });
});
