import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processMessageFromNewbie } from '@/lib/messages/processMessageFromNewbie';

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

describe('processMessageFromNewbie', () => {
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

  it('should log user message, send welcome SMS, and log assistant message', async () => {
    await processMessageFromNewbie('Hello!', '+1234567890');

    expect(insertMessageMetadata).toHaveBeenCalledTimes(2);
    expect(insertMessage).toHaveBeenCalledTimes(2);

    expect(insertMessage).toHaveBeenNthCalledWith(1, {
      metadata: 'metadata-123',
      parts: [{ type: 'text', text: 'Hello!' }],
      role: 'user',
    });

    expect(sendSms).toHaveBeenCalledWith(
      '+1234567890',
      'Welcome to In Process! To get started please visit https://inprocess.world/manage and link your phone number.'
    );

    expect(insertMessage).toHaveBeenNthCalledWith(2, {
      metadata: 'metadata-123',
      parts: [
        {
          type: 'text',
          text: 'Welcome to In Process! To get started please visit https://inprocess.world/manage and link your phone number.',
        },
      ],
      role: 'assistant',
    });
  });
});
