import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InboundMessagePayload } from 'telnyx/resources/shared';
import { processMmsMedia } from '../processMmsMedia';

vi.mock('@/lib/phones/createMomentFromMedia', () => ({ default: vi.fn() }));
vi.mock('@/lib/messages/sendVideoNotSupported', () => ({
  sendVideoNotSupported: vi.fn(),
}));
vi.mock('@/lib/phones/sendSms', () => ({ sendSms: vi.fn() }));
vi.mock('@/lib/moment/getMomentSuccessMessage', () => ({ default: vi.fn() }));

import createMomentFromMedia from '@/lib/phones/createMomentFromMedia';
import { sendVideoNotSupported } from '@/lib/messages/sendVideoNotSupported';
import { sendSms } from '@/lib/phones/sendSms';
import getMomentSuccessMessage from '@/lib/moment/getMomentSuccessMessage';

const PHONE_NUMBER = '+15550001234';
const ARTIST_ADDRESS = '0xArtist';
const phone = { phone_number: PHONE_NUMBER, artist: { address: ARTIST_ADDRESS } };

const makeMedia = (
  content_type: string
): NonNullable<InboundMessagePayload['media']>[number] => ({
  content_type,
  url: 'https://example.com/file',
  hash: null,
  size: null,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createMomentFromMedia).mockResolvedValue({
    contractAddress: '0xContract',
    tokenId: '1',
  });
  vi.mocked(getMomentSuccessMessage).mockReturnValue('Success! Check it out.');
  vi.mocked(sendSms).mockResolvedValue(undefined as never);
  vi.mocked(sendVideoNotSupported).mockResolvedValue(undefined);
});

describe('processMmsMedia', () => {
  it('sends video-not-supported message for video content and returns early', async () => {
    const result = await processMmsMedia(phone, makeMedia('video/mp4'), undefined);

    expect(sendVideoNotSupported).toHaveBeenCalledWith(PHONE_NUMBER, ARTIST_ADDRESS);
    expect(createMomentFromMedia).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('creates a moment from image media', async () => {
    const media = makeMedia('image/jpeg');
    await processMmsMedia(phone, media, undefined);

    expect(createMomentFromMedia).toHaveBeenCalledWith(
      media,
      undefined,
      ARTIST_ADDRESS
    );
  });

  it('sends success SMS after creating a moment', async () => {
    await processMmsMedia(phone, makeMedia('image/jpeg'), undefined);

    expect(getMomentSuccessMessage).toHaveBeenCalledWith('0xContract', '1');
    expect(sendSms).toHaveBeenCalledWith(PHONE_NUMBER, 'Success! Check it out.');
  });

  it('returns contractAddress and tokenId on success', async () => {
    const result = await processMmsMedia(phone, makeMedia('image/jpeg'), undefined);

    expect(result).toEqual({ contractAddress: '0xContract', tokenId: '1' });
  });
});
