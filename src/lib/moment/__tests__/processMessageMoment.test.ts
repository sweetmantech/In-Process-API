import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/messages/logMessage', () => ({ logMessage: vi.fn() }));
vi.mock('@trigger.dev/sdk', () => ({ tasks: { trigger: vi.fn() } }));
vi.mock('@/lib/moment/getMomentSuccessMessage', () => ({
  default: vi
    .fn()
    .mockReturnValue(
      'Moment created, ready for editing at https://inprocess.world/sms/base:0x1111111111111111111111111111111111111111/7'
    ),
}));

import { logMessage } from '@/lib/messages/logMessage';
import { tasks } from '@trigger.dev/sdk';
import processMessageMoment from '@/lib/moment/processMessageMoment';

const CONTRACT = '0x1111111111111111111111111111111111111111' as const;
const ARTIST = '0x2222222222222222222222222222222222222222' as const;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(logMessage).mockResolvedValue('msg-id-123');
  vi.mocked(tasks.trigger).mockResolvedValue(undefined as never);
});

describe('processMessageMoment', () => {
  it('calls logMessage with the sms editing URL', async () => {
    await processMessageMoment({
      contractAddress: CONTRACT,
      tokenId: '7',
      artistAddress: ARTIST,
      channel: 'web',
    });

    expect(logMessage).toHaveBeenCalledWith(
      [
        {
          type: 'text',
          text: 'Moment created, ready for editing at https://inprocess.world/sms/base:0x1111111111111111111111111111111111111111/7',
        },
      ],
      'assistant',
      undefined,
      ARTIST,
      'web'
    );
  });

  it('passes the channel to logMessage', async () => {
    await processMessageMoment({
      contractAddress: CONTRACT,
      tokenId: '7',
      artistAddress: ARTIST,
      channel: 'sms',
    });

    expect(logMessage).toHaveBeenCalledWith(
      [
        {
          type: 'text',
          text: 'Moment created, ready for editing at https://inprocess.world/sms/base:0x1111111111111111111111111111111111111111/7',
        },
      ],
      'assistant',
      undefined,
      ARTIST,
      'sms'
    );
  });

  it('passes roomId to logMessage when provided', async () => {
    await processMessageMoment({
      contractAddress: CONTRACT,
      tokenId: '7',
      artistAddress: ARTIST,
      channel: 'telegram',
      roomId: 'chat-42',
    });

    expect(logMessage).toHaveBeenCalledWith(
      expect.any(Array),
      'assistant',
      'chat-42',
      ARTIST,
      'telegram'
    );
  });

  it('triggers process-message-moment when messageId is returned', async () => {
    await processMessageMoment({
      contractAddress: CONTRACT,
      tokenId: '7',
      artistAddress: ARTIST,
      channel: 'web',
    });

    expect(tasks.trigger).toHaveBeenCalledWith('process-message-moment', {
      messageId: 'msg-id-123',
    });
  });

  it('does not trigger when logMessage returns no messageId', async () => {
    vi.mocked(logMessage).mockResolvedValue(null);

    await processMessageMoment({
      contractAddress: CONTRACT,
      tokenId: '7',
      artistAddress: ARTIST,
      channel: 'web',
    });

    expect(tasks.trigger).not.toHaveBeenCalled();
  });

  it('does not throw when tasks.trigger fails', async () => {
    vi.mocked(tasks.trigger).mockRejectedValue(new Error('trigger failed'));

    await expect(
      processMessageMoment({
        contractAddress: CONTRACT,
        tokenId: '7',
        artistAddress: ARTIST,
        channel: 'web',
      })
    ).resolves.not.toThrow();
  });
});
