import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMomentSchema } from '@/lib/schema/createMomentSchema';

vi.mock('../createMomentBatch', () => ({
  default: vi.fn(),
}));

import createMomentBatch from '../createMomentBatch';
import createMomentHandler from '../createMomentHandler';

const ARTIST = '0x0000000000000000000000000000000000000123'.toLowerCase();
const CONTRACT = '0x0000000000000000000000000000000000000456'.toLowerCase();
const TX_HASH =
  '0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd';

const parsedInput = createMomentSchema.parse({
  contract: { name: 'T', uri: 'ar://c' },
  token: {
    tokenMetadataURI: 'ar://t',
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
  channel: 'web',
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createMomentBatch).mockResolvedValue({
    contractAddress: CONTRACT,
    tokenIds: ['7'],
    hash: TX_HASH,
    chainId: 8453,
  });
});

describe('createMomentHandler', () => {
  it('calls createMomentBatch with a single-token batch derived from input', async () => {
    await createMomentHandler(parsedInput);

    expect(createMomentBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        contract: parsedInput.contract,
        tokens: [parsedInput.token],
        account: parsedInput.account,
        channel: 'web',
      })
    );
  });

  it('returns JSON with tokenId from the first minted id', async () => {
    const res = await createMomentHandler(parsedInput);
    const json = await res.json();

    expect(json).toEqual({
      contractAddress: CONTRACT,
      tokenId: '7',
      hash: TX_HASH,
      chainId: 8453,
    });
  });

  it('propagates createMomentBatch rejection', async () => {
    vi.mocked(createMomentBatch).mockRejectedValue(new Error('batch failed'));

    await expect(createMomentHandler(parsedInput)).rejects.toThrow(
      'batch failed'
    );
  });
});
