import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processMomentMessage } from '@/lib/messages/processMomentMessage';

vi.mock('@/lib/phones/sendSms', () => ({
  sendSms: vi.fn(),
}));

vi.mock('@/lib/consts', () => ({
  IS_TESTNET: false,
  SITE_ORIGINAL_URL: 'https://inprocess.world',
}));

import { sendSms } from '@/lib/phones/sendSms';

describe('processMomentMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send SMS with the moment URL', async () => {
    await processMomentMessage('0xContract123', '1', '+1234567890');

    expect(sendSms).toHaveBeenCalledWith(
      '+1234567890',
      'Moment created! https://inprocess.world/sms/base:0xContract123/1'
    );
  });
});
