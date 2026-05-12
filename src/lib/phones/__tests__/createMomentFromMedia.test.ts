import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { InboundMessagePayload } from 'telnyx/resources/shared';
import { maxUint64, parseUnits } from 'viem';
import { CHAIN_ID, REFERRAL_RECIPIENT, USDC_ADDRESS } from '@/lib/consts';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import { MomentType } from '@/types/moment';

vi.mock('../uploadMetadata', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/moment/createMomentBatch', () => ({
  default: vi.fn(),
}));

import uploadMetadata from '../uploadMetadata';
import createMomentBatch from '@/lib/moment/createMomentBatch';
import createMomentFromMedia from '../createMomentFromMedia';

const ARTIST = '0x0000000000000000000000000000000000000123'.toLowerCase();
const CONTRACT = '0x0000000000000000000000000000000000000456'.toLowerCase();

const makeMedia = (): NonNullable<InboundMessagePayload['media']>[number] => ({
  content_type: 'image/jpeg',
  url: 'https://example.com/file',
  hash: null,
  size: null,
});

const payload: InboundMessagePayload = {
  subject: 'subj',
  text: 'hello',
} as InboundMessagePayload;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
  vi.mocked(uploadMetadata).mockResolvedValue({
    uri: 'ar://metadata',
    name: 'From MMS',
  });
  vi.mocked(createMomentBatch).mockResolvedValue({
    contractAddress: CONTRACT,
    tokenIds: ['88'],
    hash: '0x' + 'ab'.repeat(32),
    chainId: CHAIN_ID,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createMomentFromMedia', () => {
  it('uploads metadata then mints an SMS batch with fixed sales template', async () => {
    const media = makeMedia();

    await createMomentFromMedia(media, payload, ARTIST);

    expect(uploadMetadata).toHaveBeenCalledWith(media, payload, ARTIST);

    const expectedBatch = createMomentBatchSchema.parse({
      contract: { name: 'From MMS', uri: 'ar://metadata' },
      tokens: [
        {
          tokenMetadataURI: 'ar://metadata',
          createReferral: REFERRAL_RECIPIENT,
          salesConfig: {
            type: MomentType.Erc20Mint,
            pricePerToken: parseUnits('1', 6).toString(),
            saleStart: 1_700_000_000,
            saleEnd: maxUint64.toString(),
            currency: USDC_ADDRESS[CHAIN_ID],
          },
          mintToCreatorCount: 1,
          payoutRecipient: ARTIST,
        },
      ],
      account: ARTIST,
      channel: 'sms',
    });

    expect(createMomentBatch).toHaveBeenCalledWith(expectedBatch);
  });

  it('returns contractAddress and first tokenId', async () => {
    const result = await createMomentFromMedia(makeMedia(), undefined, ARTIST);

    expect(result).toEqual({
      contractAddress: CONTRACT,
      tokenId: '88',
    });
  });

  it('propagates uploadMetadata rejection', async () => {
    vi.mocked(uploadMetadata).mockRejectedValue(new Error('arweave down'));

    await expect(
      createMomentFromMedia(makeMedia(), undefined, ARTIST)
    ).rejects.toThrow('arweave down');
    expect(createMomentBatch).not.toHaveBeenCalled();
  });

  it('propagates createMomentBatch rejection', async () => {
    vi.mocked(createMomentBatch).mockRejectedValue(new Error('uo failed'));

    await expect(
      createMomentFromMedia(makeMedia(), undefined, ARTIST)
    ).rejects.toThrow('uo failed');
  });
});
