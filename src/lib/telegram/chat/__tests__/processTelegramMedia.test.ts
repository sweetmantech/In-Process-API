import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import processTelegramMedia from '../processTelegramMedia';

vi.mock('../uploadTelegramAttachment', () => ({ default: vi.fn() }));
vi.mock('../createMomentFromTelegramAttachment', () => ({ default: vi.fn() }));
vi.mock('../handleMomentSuccess', () => ({ default: vi.fn() }));
vi.mock('@/lib/messages/logMessage', () => ({ logMessage: vi.fn() }));

import uploadTelegramAttachment from '../uploadTelegramAttachment';
import createMomentFromTelegramAttachment from '../createMomentFromTelegramAttachment';
import handleMomentSuccess from '../handleMomentSuccess';
import { logMessage } from '@/lib/messages/logMessage';

const ARTIST_ADDRESS = '0x1234' as Address;
const UPLOAD_RESULT = {
  uri: 'ar://meta',
  mimeType: 'image/jpeg',
  mediaUri: 'ar://image',
};
const MOMENT_RESULT = {
  contractAddress: '0xContract' as Address,
  tokenId: '1',
};

const makeThread = () => ({ post: vi.fn(), startTyping: vi.fn() });
const makeAttachment = () => ({ type: 'image', size: 500 });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(uploadTelegramAttachment).mockResolvedValue(UPLOAD_RESULT);
  vi.mocked(createMomentFromTelegramAttachment).mockResolvedValue(
    MOMENT_RESULT
  );
  vi.mocked(handleMomentSuccess).mockResolvedValue(undefined);
  vi.mocked(logMessage).mockResolvedValue('msg-id' as never);
});

describe('processTelegramMedia', () => {
  it('uploads the attachment with fileId, name, and thumbFileId', async () => {
    const attachment = makeAttachment();

    await processTelegramMedia(
      makeThread() as never,
      attachment as never,
      'file-id',
      'My Title',
      ARTIST_ADDRESS,
      'thumb-id'
    );

    expect(uploadTelegramAttachment).toHaveBeenCalledWith(
      attachment,
      'file-id',
      'My Title',
      'thumb-id'
    );
  });

  it('logs the user message with text and uploaded media info', async () => {
    await processTelegramMedia(
      makeThread() as never,
      makeAttachment() as never,
      'file-id',
      'My Title',
      ARTIST_ADDRESS
    );

    expect(logMessage).toHaveBeenCalledWith(
      [
        { type: 'text', text: 'My Title' },
        {
          type: 'file',
          url: UPLOAD_RESULT.mediaUri,
          mediaType: UPLOAD_RESULT.mimeType,
        },
      ],
      'user',
      ARTIST_ADDRESS,
      'telegram'
    );
  });

  it('creates a moment from the uploaded attachment URI', async () => {
    await processTelegramMedia(
      makeThread() as never,
      makeAttachment() as never,
      'file-id',
      'My Title',
      ARTIST_ADDRESS
    );

    expect(createMomentFromTelegramAttachment).toHaveBeenCalledWith({
      uri: UPLOAD_RESULT.uri,
      name: 'My Title',
      artistAddress: ARTIST_ADDRESS,
    });
  });

  it('calls handleMomentSuccess with the new moment details', async () => {
    const thread = makeThread();

    await processTelegramMedia(
      thread as never,
      makeAttachment() as never,
      'file-id',
      'My Title',
      ARTIST_ADDRESS
    );

    expect(handleMomentSuccess).toHaveBeenCalledWith(
      thread,
      MOMENT_RESULT.contractAddress.toString(),
      MOMENT_RESULT.tokenId,
      ARTIST_ADDRESS
    );
  });
});
