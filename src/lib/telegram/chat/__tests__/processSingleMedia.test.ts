import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAddress, type Address } from 'viem';
import processSingleMedia from '../processSingleMedia';

vi.mock('../uploadAndLogAttachment', () => ({ default: vi.fn() }));
vi.mock('@/lib/moment/createMoment', () => ({ createMoment: vi.fn() }));
vi.mock('../replyAfterSuccess', () => ({ default: vi.fn() }));
vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
  REFERRAL_RECIPIENT: '0xReferral',
  USDC_ADDRESS: { 8453: '0xUsdc' },
  IS_TESTNET: false,
}));

import uploadAndLogAttachment from '../uploadAndLogAttachment';
import { createMoment } from '@/lib/moment/createMoment';
import replyAfterSuccess from '../replyAfterSuccess';

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

const CHANNEL_ID = 'chat-abc';
const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  startTyping: vi.fn().mockResolvedValue(undefined),
  channelId: CHANNEL_ID,
  _stateAdapter: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
});
const makeAttachment = () => ({ type: 'image', size: 500 });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(uploadAndLogAttachment).mockResolvedValue(UPLOAD_RESULT as never);
  vi.mocked(createMoment).mockResolvedValue(MOMENT_RESULT as never);
  vi.mocked(replyAfterSuccess).mockResolvedValue(undefined);
});

describe('processSingleMedia', () => {
  it('posts the in-progress message', async () => {
    const thread = makeThread();

    await processSingleMedia(
      thread as never,
      makeAttachment() as never,
      'file-id',
      'My Title',
      ARTIST_ADDRESS
    );

    expect(thread.post).toHaveBeenCalledWith(
      '⏳ In Process will post your moment. Please wait a few seconds...'
    );
  });

  it('uploads the attachment with fileId, name, and thumbFileId', async () => {
    const attachment = makeAttachment();

    await processSingleMedia(
      makeThread() as never,
      attachment as never,
      'file-id',
      'My Title',
      ARTIST_ADDRESS,
      'thumb-id'
    );

    expect(uploadAndLogAttachment).toHaveBeenCalledWith(
      attachment,
      'file-id',
      'My Title',
      ARTIST_ADDRESS,
      CHANNEL_ID,
      'thumb-id'
    );
  });

  it('creates a moment from the uploaded URI', async () => {
    await processSingleMedia(
      makeThread() as never,
      makeAttachment() as never,
      'file-id',
      'My Title',
      ARTIST_ADDRESS
    );

    const call = vi.mocked(createMoment).mock.calls[0][0];
    expect(call.contract.uri).toBe(UPLOAD_RESULT.uri);
    expect(call.token.tokenMetadataURI).toBe(UPLOAD_RESULT.uri);
    expect(call.contract.name).toBe('My Title');
    expect(call.account).toBe(ARTIST_ADDRESS);
    expect(call.channel).toBe('telegram');
  });

  it('calls replyAfterSuccess with the new moment details', async () => {
    const thread = makeThread();

    await processSingleMedia(
      thread as never,
      makeAttachment() as never,
      'file-id',
      'My Title',
      ARTIST_ADDRESS
    );

    expect(replyAfterSuccess).toHaveBeenCalledWith(
      thread,
      MOMENT_RESULT.contractAddress.toString(),
      MOMENT_RESULT.tokenId,
      ARTIST_ADDRESS
    );
  });

  it('mints to a stored collection and clears the selection on success', async () => {
    const existing = '0x0000000000000000000000000000000000000abc' as const;
    const thread = makeThread();
    thread._stateAdapter.get = vi.fn().mockResolvedValue(existing);

    await processSingleMedia(
      thread as never,
      makeAttachment() as never,
      'file-id',
      'My Title',
      ARTIST_ADDRESS
    );

    const call = vi.mocked(createMoment).mock.calls[0][0];
    expect(call.contract).toEqual({ address: getAddress(existing) });
    expect(thread._stateAdapter.delete).toHaveBeenCalledWith(
      'selected_collection_address'
    );
  });
});
