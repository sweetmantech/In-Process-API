import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processVideoMessage } from '@/lib/messages/processVideoMessage';

vi.mock(
  '@/lib/supabase/in_process_message_metadata/insertMessageMetadata',
  () => ({
    default: vi.fn(),
  })
);

vi.mock('@/lib/supabase/in_process_messages/insertMessage', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/phones/sendSms', () => ({
  sendSms: vi.fn(),
}));

vi.mock('@/lib/consts', () => ({
  IS_TESTNET: false,
  SITE_ORIGINAL_URL: 'https://inprocess.world',
}));

import insertMessageMetadata from '@/lib/supabase/in_process_message_metadata/insertMessageMetadata';
import insertMessage from '@/lib/supabase/in_process_messages/insertMessage';
import { sendSms } from '@/lib/phones/sendSms';

describe('processVideoMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(insertMessageMetadata).mockResolvedValue({
      data: { id: 'metadata-123' },
      error: null,
    } as any);
    vi.mocked(insertMessage).mockResolvedValue({
      data: { id: 'message-456' },
      error: null,
    } as any);
  });

  it('should log video unsupported message and send SMS', async () => {
    await processVideoMessage('+1234567890', '0xArtist123');

    expect(insertMessageMetadata).toHaveBeenCalledWith({
      client: 'sms',
      artist_address: '0xArtist123',
    });

    expect(sendSms).toHaveBeenCalledWith(
      '+1234567890',
      'Sorry, videos are not supported because their quality is significantly degraded when sent via SMS text message. Please go to https://inprocess.world/create to upload videos.'
    );
  });
});
