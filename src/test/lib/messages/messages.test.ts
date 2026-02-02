import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logMessage } from '@/lib/messages/logMessage';
import { processMessageFromNewbie } from '@/lib/messages/processMessageFromNewbie';
import { processVerificationRequestMessage } from '@/lib/messages/processVerificationRequestMessage';
import processVerificationMessage from '@/lib/messages/processVerificationMessage';
import { processVideoMessage } from '@/lib/messages/processVideoMessage';
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

vi.mock('@/lib/supabase/in_process_artist_phones/updatePhoneVerified', () => ({
  updatePhoneVerified: vi.fn(),
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
import { updatePhoneVerified } from '@/lib/supabase/in_process_artist_phones/updatePhoneVerified';
import { tasks } from '@trigger.dev/sdk';

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
