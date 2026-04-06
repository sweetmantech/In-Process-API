import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/consts', () => ({
  IS_TESTNET: false,
  SITE_ORIGINAL_URL: 'https://inprocess.world',
}));

vi.mock('@/lib/phones/createMomentFromMedia', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/messages/processVideoMessage', () => ({
  processVideoMessage: vi.fn(),
}));

vi.mock('@/lib/phones/sendSms', () => ({
  sendSms: vi.fn(),
}));

import createMomentFromMedia from '@/lib/phones/createMomentFromMedia';
import { processVideoMessage } from '@/lib/messages/processVideoMessage';
import { sendSms } from '@/lib/phones/sendSms';
import { processMmsMedia } from '@/lib/phones/processMmsMedia';

const PHONE = {
  phone_number: '+15551234567',
  artist: { address: '0xArtist' },
};
const CONTRACT = '0xContract';
const TOKEN_ID = '42';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createMomentFromMedia).mockResolvedValue({
    contractAddress: CONTRACT,
    tokenId: TOKEN_ID,
  } as never);
  vi.mocked(sendSms).mockResolvedValue(undefined as never);
  vi.mocked(processVideoMessage).mockResolvedValue(undefined);
});

describe('processMmsMedia', () => {
  it('sends an SMS with the sms editing URL after creating the moment', async () => {
    const media = {
      content_type: 'image/jpeg',
      url: 'https://example.com/img.jpg',
    } as never;

    await processMmsMedia(PHONE, media, undefined);

    expect(sendSms).toHaveBeenCalledWith(
      PHONE.phone_number,
      `Moment created, ready for editing at https://inprocess.world/sms/base:${CONTRACT}/${TOKEN_ID}`
    );
  });

  it('returns contractAddress and tokenId on success', async () => {
    const media = {
      content_type: 'image/jpeg',
      url: 'https://example.com/img.jpg',
    } as never;

    const result = await processMmsMedia(PHONE, media, undefined);

    expect(result).toEqual({ contractAddress: CONTRACT, tokenId: TOKEN_ID });
  });

  it('delegates to processVideoMessage and returns void for video content', async () => {
    const media = {
      content_type: 'video/mp4',
      url: 'https://example.com/vid.mp4',
    } as never;

    const result = await processMmsMedia(PHONE, media, undefined);

    expect(processVideoMessage).toHaveBeenCalledWith(
      PHONE.phone_number,
      PHONE.artist.address
    );
    expect(createMomentFromMedia).not.toHaveBeenCalled();
    expect(sendSms).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
