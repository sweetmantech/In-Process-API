import { describe, it, expect, vi, beforeEach } from 'vitest';
import processVerificationMessage from '@/lib/messages/processVerificationMessage';

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

vi.mock('@/lib/supabase/in_process_artist_phones/updatePhoneVerified', () => ({
  updatePhoneVerified: vi.fn(),
}));

import insertMessageMetadata from '@/lib/supabase/in_process_message_metadata/insertMessageMetadata';
import insertMessage from '@/lib/supabase/in_process_messages/insertMessage';
import { sendSms } from '@/lib/phones/sendSms';
import { updatePhoneVerified } from '@/lib/supabase/in_process_artist_phones/updatePhoneVerified';

describe('processVerificationMessage', () => {
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

  it('should verify phone, log message, and send SMS', async () => {
    vi.mocked(updatePhoneVerified).mockResolvedValue({
      data: { artist_address: '0xArtist123' },
      error: null,
    } as any);

    await processVerificationMessage('+1234567890');

    expect(updatePhoneVerified).toHaveBeenCalledWith('+1234567890');
    expect(insertMessageMetadata).toHaveBeenCalledWith({
      client: 'sms',
      artist_address: '0xArtist123',
    });
    expect(sendSms).toHaveBeenCalledWith(
      '+1234567890',
      'Your phone number has been verified! You can now text photos and descriptions to post them on In Process.'
    );
  });

  it('should throw error if phone verification fails', async () => {
    vi.mocked(updatePhoneVerified).mockResolvedValue({
      data: null,
      error: { message: 'Error' },
    } as any);

    await expect(processVerificationMessage('+1234567890')).rejects.toThrow(
      'Failed to verify phone.'
    );

    expect(sendSms).not.toHaveBeenCalled();
  });
});
