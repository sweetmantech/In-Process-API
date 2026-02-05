import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processMomentMessage } from '@/lib/messages/processMomentMessage';

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

vi.mock('@trigger.dev/sdk', () => ({
  tasks: {
    trigger: vi.fn(),
  },
}));

vi.mock('@/lib/consts', () => ({
  IS_TESTNET: false,
  SITE_ORIGINAL_URL: 'https://inprocess.world',
}));

import insertMessageMetadata from '@/lib/supabase/in_process_message_metadata/insertMessageMetadata';
import insertMessage from '@/lib/supabase/in_process_messages/insertMessage';
import { sendSms } from '@/lib/phones/sendSms';
import { tasks } from '@trigger.dev/sdk';

describe('processMomentMessage', () => {
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

  it('should log moment message, trigger task, and send SMS', async () => {
    await processMomentMessage(
      '0xContract123',
      '1',
      '+1234567890',
      '0xArtist123'
    );

    expect(insertMessageMetadata).toHaveBeenCalledWith({
      client: 'sms',
      artist_address: '0xArtist123',
    });

    expect(tasks.trigger).toHaveBeenCalledWith('process-message-moment', {
      messageId: 'message-456',
    });

    expect(sendSms).toHaveBeenCalledWith(
      '+1234567890',
      'Moment created! https://inprocess.world/sms/base:0xContract123/1'
    );
  });

  it('should not trigger task if logMessage returns null', async () => {
    vi.mocked(insertMessageMetadata).mockResolvedValue({
      data: null,
      error: { message: 'Error' },
    } as any);

    await processMomentMessage(
      '0xContract123',
      '1',
      '+1234567890',
      '0xArtist123'
    );

    expect(tasks.trigger).not.toHaveBeenCalled();
    expect(sendSms).toHaveBeenCalled();
  });
});
