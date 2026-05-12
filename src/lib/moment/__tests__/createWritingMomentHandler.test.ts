import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWritingMomentSchema } from '@/lib/schema/createMomentSchema';

vi.mock('@/lib/writing/uploadWritingWithJson', () => ({
  uploadWritingWithJson: vi.fn(),
}));

vi.mock('@/lib/moment/createMomentBatch', () => ({
  default: vi.fn(),
}));

import { uploadWritingWithJson } from '@/lib/writing/uploadWritingWithJson';
import createMomentBatch from '@/lib/moment/createMomentBatch';
import createWritingMomentHandler from '../createWritingMomentHandler';

const ARTIST = '0x0000000000000000000000000000000000000123'.toLowerCase();
const CONTRACT = '0x0000000000000000000000000000000000000456'.toLowerCase();
const TX_HASH =
  '0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd';

const writingInput = createWritingMomentSchema.parse({
  title: 'Essay',
  contract: { name: 'Writings', uri: 'ar://coll-placeholder' },
  token: {
    tokenContent: 'body text',
    createReferral: '0x1111111111111111111111111111111111111111',
    salesConfig: {
      type: 'erc20Mint',
      pricePerToken: '1',
      saleStart: 1,
      saleEnd: '18446744073709551615',
      currency: '0x2222222222222222222222222222222222222222',
    },
    mintToCreatorCount: 1,
    payoutRecipient: ARTIST,
  },
  account: ARTIST,
});

const UPLOADED_URI = 'ar://uploaded-writing-json';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(uploadWritingWithJson).mockResolvedValue(UPLOADED_URI);
  vi.mocked(createMomentBatch).mockResolvedValue({
    contractAddress: CONTRACT,
    tokenIds: ['99'],
    hash: TX_HASH,
    chainId: 8453,
  });
});

describe('createWritingMomentHandler', () => {
  it('uploads writing JSON then mints via createMomentBatch', async () => {
    await createWritingMomentHandler(writingInput);

    expect(uploadWritingWithJson).toHaveBeenCalledWith(
      'Writings',
      'body text',
      ARTIST
    );
    expect(createMomentBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        contract: expect.objectContaining({
          name: 'Writings',
          uri: UPLOADED_URI,
        }),
        tokens: [
          expect.objectContaining({
            tokenMetadataURI: UPLOADED_URI,
            createReferral: writingInput.token.createReferral,
          }),
        ],
        account: ARTIST,
      })
    );
  });

  it('returns JSON shaped like single-moment create', async () => {
    const res = await createWritingMomentHandler(writingInput);
    const json = await res.json();

    expect(json).toEqual({
      contractAddress: CONTRACT,
      tokenId: '99',
      hash: TX_HASH,
      chainId: 8453,
    });
  });

  it('propagates createMomentBatch rejection', async () => {
    vi.mocked(createMomentBatch).mockRejectedValue(new Error('mint failed'));

    await expect(createWritingMomentHandler(writingInput)).rejects.toThrow(
      'mint failed'
    );
  });
});
