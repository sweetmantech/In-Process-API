import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import createMomentsFromGroup from '../createMomentsFromGroup';

vi.mock('../fetchTelegramFile', () => ({ default: vi.fn() }));
vi.mock('../uploadAndLogAttachment', () => ({ default: vi.fn() }));
vi.mock('@/lib/moment/createMoments', () => ({ default: vi.fn() }));
vi.mock('../replyAfterSuccess', () => ({ default: vi.fn() }));

import fetchTelegramFile from '../fetchTelegramFile';
import uploadAndLogAttachment from '../uploadAndLogAttachment';
import createMoments from '@/lib/moment/createMoments';
import replyAfterSuccess from '../replyAfterSuccess';

const ARTIST_ADDRESS = '0x1234' as Address;

const PENDING_IMAGE = {
  fileId: 'file-1',
  name: 'Photo 1',
  mimeType: 'image/jpeg',
  attachmentType: 'image' as const,
};

const PENDING_VIDEO = {
  fileId: 'file-2',
  thumbFileId: 'thumb-2',
  name: 'Video 1',
  mimeType: 'video/mp4',
  attachmentType: 'video' as const,
};

const UPLOAD_RESULT_1 = {
  uri: 'ar://meta-1',
  mimeType: 'image/jpeg',
  mediaUri: 'ar://img-1',
};
const UPLOAD_RESULT_2 = {
  uri: 'ar://meta-2',
  mimeType: 'video/mp4',
  mediaUri: 'ar://vid-2',
};
const MOMENT_1 = { contractAddress: '0xC1' as Address, tokenId: '1' };
const MOMENT_2 = { contractAddress: '0xC2' as Address, tokenId: '2' };

const makeStateAdapter = (assets: unknown[] = []) => ({
  getList: vi.fn().mockResolvedValue(assets),
});

const CHANNEL_ID = 'chat-xyz';
const makeThread = (stateAdapter = makeStateAdapter()) => ({
  startTyping: vi.fn().mockResolvedValue(undefined),
  _stateAdapter: stateAdapter,
  channelId: CHANNEL_ID,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchTelegramFile).mockResolvedValue({
    buffer: Buffer.from(''),
    mimeType: 'image/jpeg',
  });
  vi.mocked(uploadAndLogAttachment).mockResolvedValue(UPLOAD_RESULT_1 as never);
  vi.mocked(createMoments).mockResolvedValue([MOMENT_1]);
  vi.mocked(replyAfterSuccess).mockResolvedValue(undefined);
});

describe('createMomentsFromGroup', () => {
  it('returns early without uploading when list is empty', async () => {
    const thread = makeThread(makeStateAdapter([]));

    await createMomentsFromGroup(thread as never, 'grp-1', ARTIST_ADDRESS);

    expect(uploadAndLogAttachment).not.toHaveBeenCalled();
    expect(createMoments).not.toHaveBeenCalled();
  });

  it('uploads each pending asset in parallel', async () => {
    vi.mocked(uploadAndLogAttachment)
      .mockResolvedValueOnce(UPLOAD_RESULT_1 as never)
      .mockResolvedValueOnce(UPLOAD_RESULT_2 as never);
    vi.mocked(createMoments).mockResolvedValue([MOMENT_1, MOMENT_2]);
    vi.mocked(replyAfterSuccess).mockResolvedValue(undefined);

    const thread = makeThread(makeStateAdapter([PENDING_IMAGE, PENDING_VIDEO]));

    await createMomentsFromGroup(thread as never, 'grp-1', ARTIST_ADDRESS);

    expect(uploadAndLogAttachment).toHaveBeenCalledTimes(2);
  });

  it('builds a fetchData that calls fetchTelegramFile with the correct fileId', async () => {
    const thread = makeThread(makeStateAdapter([PENDING_IMAGE]));

    await createMomentsFromGroup(thread as never, 'grp-1', ARTIST_ADDRESS);

    const attachment = vi.mocked(uploadAndLogAttachment).mock.calls[0][0];
    await attachment.fetchData!();
    expect(fetchTelegramFile).toHaveBeenCalledWith(PENDING_IMAGE.fileId);
  });

  it('passes thumbFileId to uploadAndLogAttachment', async () => {
    const thread = makeThread(makeStateAdapter([PENDING_VIDEO]));

    await createMomentsFromGroup(thread as never, 'grp-1', ARTIST_ADDRESS);

    expect(uploadAndLogAttachment).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'video', mimeType: 'video/mp4' }),
      PENDING_VIDEO.fileId,
      PENDING_VIDEO.name,
      ARTIST_ADDRESS,
      CHANNEL_ID,
      PENDING_VIDEO.thumbFileId
    );
  });

  it('calls createMoments with uri and name from uploaded results', async () => {
    const thread = makeThread(makeStateAdapter([PENDING_IMAGE]));

    await createMomentsFromGroup(thread as never, 'grp-1', ARTIST_ADDRESS);

    expect(createMoments).toHaveBeenCalledWith(
      [{ uri: UPLOAD_RESULT_1.uri, name: PENDING_IMAGE.name }],
      ARTIST_ADDRESS,
      'telegram',
      { roomId: CHANNEL_ID }
    );
  });

  it('calls replyAfterSuccess for each minted moment', async () => {
    vi.mocked(uploadAndLogAttachment)
      .mockResolvedValueOnce(UPLOAD_RESULT_1 as never)
      .mockResolvedValueOnce(UPLOAD_RESULT_2 as never);
    vi.mocked(createMoments).mockResolvedValue([MOMENT_1, MOMENT_2]);

    const thread = makeThread(makeStateAdapter([PENDING_IMAGE, PENDING_VIDEO]));

    await createMomentsFromGroup(thread as never, 'grp-1', ARTIST_ADDRESS);

    expect(replyAfterSuccess).toHaveBeenCalledTimes(2);
    expect(replyAfterSuccess).toHaveBeenCalledWith(
      thread,
      MOMENT_1.contractAddress.toString(),
      MOMENT_1.tokenId,
      ARTIST_ADDRESS,
      false
    );
    expect(replyAfterSuccess).toHaveBeenCalledWith(
      thread,
      MOMENT_2.contractAddress.toString(),
      MOMENT_2.tokenId,
      ARTIST_ADDRESS,
      true
    );
  });
});
