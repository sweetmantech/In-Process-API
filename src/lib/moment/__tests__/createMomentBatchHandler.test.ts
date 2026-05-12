import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';

vi.mock('../createMomentBatch', () => ({
  default: vi.fn(),
}));

import createMomentBatch from '../createMomentBatch';
import createMomentBatchHandler from '../createMomentBatchHandler';

const ARTIST =
  '0x0000000000000000000000000000000000000123'.toLowerCase() as Address;
const REF =
  '0x1111111111111111111111111111111111111111'.toLowerCase() as Address;
const USDC =
  '0x2222222222222222222222222222222222222222'.toLowerCase() as Address;
const CONTRACT =
  '0x0000000000000000000000000000000000000456'.toLowerCase() as Address;
const TX_HASH =
  '0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd' as const;

const batchInput = createMomentBatchSchema.parse({
  contract: { name: 'My Album', uri: 'ar://collection-meta' },
  tokens: [
    {
      tokenMetadataURI: 'ar://token-meta',
      createReferral: REF,
      salesConfig: {
        type: 'erc20Mint',
        pricePerToken: '1000000',
        saleStart: 1,
        saleEnd: '18446744073709551615',
        currency: USDC,
      },
      mintToCreatorCount: 1,
      payoutRecipient: ARTIST,
    },
  ],
  account: ARTIST,
  channel: 'web',
});

const batchResult = {
  contractAddress: CONTRACT,
  tokenIds: ['1', '2'],
  hash: TX_HASH,
  chainId: 8453,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createMomentBatch).mockResolvedValue(batchResult);
});

describe('createMomentBatchHandler', () => {
  it('calls createMomentBatch with validated input', async () => {
    await createMomentBatchHandler(batchInput);

    expect(createMomentBatch).toHaveBeenCalledWith(batchInput);
  });

  it('returns JSON with the full batch result', async () => {
    const res = await createMomentBatchHandler(batchInput);

    expect(await res.json()).toEqual(batchResult);
  });

  it('propagates createMomentBatch rejection', async () => {
    vi.mocked(createMomentBatch).mockRejectedValue(new Error('uo failed'));

    await expect(createMomentBatchHandler(batchInput)).rejects.toThrow(
      'uo failed'
    );
  });
});
