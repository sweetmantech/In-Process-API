import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logMessage } from '@/lib/messages/logMessage';

vi.mock(
  '@/lib/supabase/in_process_message_metadata/insertMessageMetadata',
  () => ({
    default: vi.fn(),
  })
);

vi.mock('@/lib/supabase/in_process_messages/insertMessage', () => ({
  default: vi.fn(),
}));

import insertMessageMetadata from '@/lib/supabase/in_process_message_metadata/insertMessageMetadata';
import insertMessage from '@/lib/supabase/in_process_messages/insertMessage';

describe('logMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should insert metadata and message, returning message id', async () => {
    vi.mocked(insertMessageMetadata).mockResolvedValue({
      data: { id: 'metadata-123' },
      error: null,
    } as any);
    vi.mocked(insertMessage).mockResolvedValue({
      data: { id: 'message-456' },
      error: null,
    } as any);

    const result = await logMessage(
      [{ type: 'text', text: 'Hello' }],
      'user',
      '0x123'
    );

    expect(insertMessageMetadata).toHaveBeenCalledWith({
      client: 'sms',
      artist_address: '0x123',
    });
    expect(insertMessage).toHaveBeenCalledWith({
      metadata: 'metadata-123',
      parts: [{ type: 'text', text: 'Hello' }],
      role: 'user',
    });
    expect(result).toBe('message-456');
  });

  it('should return null if metadata insertion fails', async () => {
    vi.mocked(insertMessageMetadata).mockResolvedValue({
      data: null,
      error: { message: 'Error' },
    } as any);

    const result = await logMessage([{ type: 'text', text: 'Hello' }], 'user');

    expect(result).toBeNull();
    expect(insertMessage).not.toHaveBeenCalled();
  });

  it('should work without artistAddress', async () => {
    vi.mocked(insertMessageMetadata).mockResolvedValue({
      data: { id: 'metadata-123' },
      error: null,
    } as any);
    vi.mocked(insertMessage).mockResolvedValue({
      data: { id: 'message-456' },
      error: null,
    } as any);

    await logMessage([{ type: 'text', text: 'Hello' }], 'assistant');

    expect(insertMessageMetadata).toHaveBeenCalledWith({
      client: 'sms',
      artist_address: undefined,
    });
  });
});
