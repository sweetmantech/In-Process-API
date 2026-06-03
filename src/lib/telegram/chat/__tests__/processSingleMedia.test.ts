import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAddress, type Address } from 'viem';
import processSingleMedia from '../processSingleMedia';

vi.mock('../processAttachmentUpload', () => ({ default: vi.fn() }));
vi.mock('@/lib/moment/createMomentBatch', () => ({ default: vi.fn() }));
vi.mock('../sendReadyMessage', () => ({ default: vi.fn() }));
vi.mock('../sendArtistCollage', () => ({ default: vi.fn() }));
vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
  REFERRAL_RECIPIENT: '0x1111111111111111111111111111111111111111',
  USDC_ADDRESS: {
    8453: '0x2222222222222222222222222222222222222222',
  },
  IS_TESTNET: false,
}));

import processAttachmentUpload from '../processAttachmentUpload';
import createMomentBatch from '@/lib/moment/createMomentBatch';
import sendReadyMessage from '../sendReadyMessage';
import sendArtistCollage from '../sendArtistCollage';

const ARTIST_ADDRESS = '0x0000000000000000000000000000000000000123' as Address;
const ARTIST_CONTEXT = {
  artistId: 'artist-uuid-123',
  primaryWallet: ARTIST_ADDRESS,
  wallets: [{ address: ARTIST_ADDRESS, type: 'external' as const }],
};
const UPLOAD_RESULT = {
  uri: 'ar://meta',
  mimeType: 'image/jpeg',
  mediaUri: 'ar://image',
};
const MOMENT_RESULT = {
  contractAddress: '0xContract' as Address,
  tokenId: '1',
};

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  startTyping: vi.fn().mockResolvedValue(undefined),
  channelId: 'telegram:chat-abc',
  _stateAdapter: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
});
const makeAttachment = () => ({ type: 'image', size: 500 });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(processAttachmentUpload).mockResolvedValue(UPLOAD_RESULT as never);
  vi.mocked(createMomentBatch).mockResolvedValue({
    contractAddress: MOMENT_RESULT.contractAddress,
    tokenIds: [MOMENT_RESULT.tokenId],
    hash: '0x3333333333333333333333333333333333333333333333333333333333333333' as const,
    chainId: 8453,
  } as never);
  vi.mocked(sendReadyMessage).mockResolvedValue(undefined);
  vi.mocked(sendArtistCollage).mockResolvedValue(undefined);
});

describe('processSingleMedia', () => {
  it('posts the in-progress message', async () => {
    const thread = makeThread();

    await processSingleMedia(
      thread as never,
      makeAttachment() as never,
      'file-id',
      'My Title',
      ARTIST_CONTEXT
    );

    expect(thread.post).toHaveBeenCalledWith(
      'Posting your moment to In Process, this may take a minute...'
    );
  });

  it('uploads the attachment with fileId, name, and thumbFileId', async () => {
    const attachment = makeAttachment();

    await processSingleMedia(
      makeThread() as never,
      attachment as never,
      'file-id',
      'My Title',
      ARTIST_CONTEXT,
      'thumb-id'
    );

    expect(processAttachmentUpload).toHaveBeenCalledWith(
      attachment,
      'file-id',
      'My Title',
      ARTIST_ADDRESS,
      'thumb-id'
    );
  });

  it('creates a moment from the uploaded URI', async () => {
    await processSingleMedia(
      makeThread() as never,
      makeAttachment() as never,
      'file-id',
      'My Title',
      ARTIST_CONTEXT
    );

    const [input] = vi.mocked(createMomentBatch).mock.calls[0];
    expect(input.contract.uri).toBe(UPLOAD_RESULT.uri);
    expect(input.tokens[0].tokenMetadataURI).toBe(UPLOAD_RESULT.uri);
    expect(input.contract.name).toBe('My Title');
    expect(input.account).toBe(getAddress(ARTIST_ADDRESS));
    expect(input.channel).toBe('telegram');
  });

  it('calls sendReadyMessage with the new moment details', async () => {
    const thread = makeThread();

    await processSingleMedia(
      thread as never,
      makeAttachment() as never,
      'file-id',
      'My Title',
      ARTIST_CONTEXT
    );

    expect(sendReadyMessage).toHaveBeenCalledWith(
      thread,
      MOMENT_RESULT.contractAddress.toString(),
      MOMENT_RESULT.tokenId
    );
    expect(sendArtistCollage).toHaveBeenCalledWith(thread, ARTIST_ADDRESS);
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
      ARTIST_CONTEXT
    );

    const [input] = vi.mocked(createMomentBatch).mock.calls[0];
    expect(input.contract).toEqual({
      address: getAddress(existing).toLowerCase() as Address,
    });
    expect(thread._stateAdapter.delete).toHaveBeenCalledWith(
      'selected_collection_address'
    );
  });
});
