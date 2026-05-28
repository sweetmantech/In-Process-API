import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InboundMessageWebhookEvent } from 'telnyx/resources/webhooks';

vi.mock('@/lib/supabase/in_process_artist_phones/selectPhone', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/phones/processMmsMedia', () => ({ processMmsMedia: vi.fn() }));
vi.mock('@/lib/messages/sendNewbieWelcome', () => ({
  sendNewbieWelcome: vi.fn(),
}));
vi.mock('@/lib/messages/sendVerificationRequest', () => ({
  sendVerificationRequest: vi.fn(),
}));
vi.mock('@/lib/messages/verifyAndNotifyPhone', () => ({ default: vi.fn() }));

import selectPhone from '@/lib/supabase/in_process_artist_phones/selectPhone';
import { processMmsMedia } from '@/lib/phones/processMmsMedia';
import { sendNewbieWelcome } from '@/lib/messages/sendNewbieWelcome';
import { sendVerificationRequest } from '@/lib/messages/sendVerificationRequest';
import verifyAndNotifyPhone from '@/lib/messages/verifyAndNotifyPhone';
import smsWebhookHandler from '@/lib/sms/smsWebhookHandler';

const PHONE_NUMBER = '+15550001234';
const PRIMARY_WALLET = '0x1234567890123456789012345678901234567890';

const makeEvent = (
  overrides: Partial<InboundMessageWebhookEvent['data']> = {}
): InboundMessageWebhookEvent =>
  ({
    data: {
      event_type: 'message.received',
      payload: {
        text: 'hello',
        from: { phone_number: PHONE_NUMBER },
        media: undefined,
        ...overrides.payload,
      },
      ...overrides,
    },
  }) as InboundMessageWebhookEvent;

const verifiedPhoneRow = {
  phone_number: PHONE_NUMBER,
  verified: true,
  artist_id: 'artist-uuid-123',
  artist: {
    id: 'artist-uuid-123',
    username: 'testartist',
    wallets: [{ address: PRIMARY_WALLET, type: 'external' as const }],
  },
};

describe('smsWebhookHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(selectPhone).mockResolvedValue({ data: null, error: null });
    vi.mocked(processMmsMedia).mockResolvedValue(undefined);
    vi.mocked(sendNewbieWelcome).mockResolvedValue(undefined);
    vi.mocked(sendVerificationRequest).mockResolvedValue(undefined);
    vi.mocked(verifyAndNotifyPhone).mockResolvedValue(undefined);
  });

  it('returns success for non message.received events', async () => {
    const res = await smsWebhookHandler(
      makeEvent({ event_type: 'message.sent' })
    );

    expect(await res.json()).toEqual({ success: true });
    expect(selectPhone).not.toHaveBeenCalled();
  });

  it('processes MMS media for verified phones', async () => {
    const media = [
      { content_type: 'image/jpeg', url: 'https://example.com/x' },
    ];
    vi.mocked(selectPhone).mockResolvedValue({
      data: verifiedPhoneRow,
      error: null,
    });

    await smsWebhookHandler(
      makeEvent({
        payload: { text: '', from: { phone_number: PHONE_NUMBER }, media },
      })
    );

    expect(processMmsMedia).toHaveBeenCalledWith(
      {
        phone_number: PHONE_NUMBER,
        artist: {
          artistId: 'artist-uuid-123',
          primaryWallet: PRIMARY_WALLET,
          wallets: [{ address: PRIMARY_WALLET, type: 'external' as const }],
        },
      },
      media[0],
      expect.objectContaining({ from: { phone_number: PHONE_NUMBER } })
    );
  });

  it('verifies phone when unverified user replies yes', async () => {
    vi.mocked(selectPhone).mockResolvedValue({
      data: { ...verifiedPhoneRow, verified: false },
      error: null,
    });

    await smsWebhookHandler(
      makeEvent({
        payload: { text: 'YES', from: { phone_number: PHONE_NUMBER } },
      })
    );

    expect(verifyAndNotifyPhone).toHaveBeenCalledWith(
      'testartist',
      PHONE_NUMBER
    );
    expect(sendVerificationRequest).not.toHaveBeenCalled();
  });

  it('sends verification request for unverified non-yes replies', async () => {
    vi.mocked(selectPhone).mockResolvedValue({
      data: { ...verifiedPhoneRow, verified: false },
      error: null,
    });

    await smsWebhookHandler(
      makeEvent({
        payload: { text: 'maybe', from: { phone_number: PHONE_NUMBER } },
      })
    );

    expect(sendVerificationRequest).toHaveBeenCalledWith(
      PHONE_NUMBER,
      PRIMARY_WALLET
    );
    expect(verifyAndNotifyPhone).not.toHaveBeenCalled();
  });

  it('welcomes unknown phone numbers', async () => {
    await smsWebhookHandler(makeEvent());

    expect(sendNewbieWelcome).toHaveBeenCalledWith('hello', PHONE_NUMBER);
    expect(processMmsMedia).not.toHaveBeenCalled();
  });
});
