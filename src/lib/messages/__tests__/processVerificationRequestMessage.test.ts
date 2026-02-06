import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processVerificationRequestMessage } from '@/lib/messages/processVerificationRequestMessage';

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

import insertMessageMetadata from '@/lib/supabase/in_process_message_metadata/insertMessageMetadata';
import insertMessage from '@/lib/supabase/in_process_messages/insertMessage';
import { sendSms } from '@/lib/phones/sendSms';

describe('processVerificationRequestMessage', () => {
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

  it('should log verification request and send SMS', async () => {
    await processVerificationRequestMessage('+1234567890', '0xArtist123');

    expect(insertMessageMetadata).toHaveBeenCalledWith({
      client: 'sms',
      artist_address: '0xArtist123',
    });

    expect(sendSms).toHaveBeenCalledWith(
      '+1234567890',
      "Your phone number is not verified. Please reply 'yes' to verify your phone number."
    );
  });
});
