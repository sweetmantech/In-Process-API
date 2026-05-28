import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import createMomentBatch from '../createMomentBatch';

vi.mock('@/lib/coinbase/getWalletLinkedSmartAccount', () => ({
  getWalletLinkedSmartAccount: vi.fn(),
}));
vi.mock('../createBatchSetupActions', () => ({ default: vi.fn() }));
vi.mock('@/lib/viem/createMomentBatchCall', () => ({ default: vi.fn() }));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));
vi.mock('@/lib/protocolSdk/create/1155-create-helper', () => ({
  getContractAddressFromReceipt: vi.fn(),
}));
vi.mock('../getCreatedTokenIds', () => ({ default: vi.fn() }));
vi.mock('../migrateAndIndexMoment', () => ({ default: vi.fn() }));
vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
}));

import { getWalletLinkedSmartAccount } from '@/lib/coinbase/getWalletLinkedSmartAccount';
import createBatchSetupActions from '../createBatchSetupActions';
import createMomentBatchCall from '@/lib/viem/createMomentBatchCall';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getContractAddressFromReceipt } from '@/lib/protocolSdk/create/1155-create-helper';
import getCreatedTokenIds from '../getCreatedTokenIds';
import migrateAndIndexMoment from '../migrateAndIndexMoment';

const ARTIST =
  '0x0000000000000000000000000000000000000123'.toLowerCase() as Address;
const REF =
  '0x1111111111111111111111111111111111111111'.toLowerCase() as Address;
const USDC =
  '0x2222222222222222222222222222222222222222'.toLowerCase() as Address;
const CONTRACT =
  '0x0000000000000000000000000000000000000456'.toLowerCase() as Address;
const CALL_TO =
  '0x0000000000000000000000000000000000000999'.toLowerCase() as Address;
const TX_HASH =
  '0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd' as const;

const baseToken = {
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
};

const makeBatchInput = () =>
  createMomentBatchSchema.parse({
    contract: { name: 'My Album', uri: 'ar://collection-meta' },
    tokens: [baseToken],
    account: ARTIST,
    channel: 'web',
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getWalletLinkedSmartAccount).mockResolvedValue({
    address: '0x0000000000000000000000000000000000000bee',
  } as never);
  vi.mocked(createBatchSetupActions).mockResolvedValue({
    tokenSetupActions: ['0x'],
    fundsRecipient: ARTIST,
  });
  vi.mocked(createMomentBatchCall).mockReturnValue({
    to: CALL_TO,
    data: '0x',
  });
  vi.mocked(sendUserOperation).mockResolvedValue({
    logs: [],
    transactionHash: TX_HASH,
  } as never);
  vi.mocked(getContractAddressFromReceipt).mockReturnValue(CONTRACT);
  vi.mocked(getCreatedTokenIds).mockReturnValue(['1']);
  vi.mocked(migrateAndIndexMoment).mockResolvedValue(undefined);
});

describe('createMomentBatch', () => {
  it('returns contractAddress, tokenIds, hash, and chainId', async () => {
    const result = await createMomentBatch(makeBatchInput());
    expect(result).toEqual({
      contractAddress: CONTRACT,
      tokenIds: ['1'],
      hash: TX_HASH,
      chainId: 8453,
    });
  });

  it('calls migrateAndIndexMoment once per minted token', async () => {
    vi.mocked(getCreatedTokenIds).mockReturnValue(['10', '11']);
    const input = createMomentBatchSchema.parse({
      contract: { name: 'My Album', uri: 'ar://collection-meta' },
      tokens: [baseToken, { ...baseToken, tokenMetadataURI: 'ar://token-2' }],
      account: ARTIST,
      channel: 'web',
    });

    await createMomentBatch(input);

    expect(migrateAndIndexMoment).toHaveBeenCalledTimes(2);
    expect(migrateAndIndexMoment).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        contractAddress: CONTRACT,
        tokenId: '10',
        artistAddress: ARTIST,
        channel: 'web',
        token: input.tokens[0],
      })
    );
    expect(migrateAndIndexMoment).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        tokenId: '11',
        token: input.tokens[1],
      })
    );
  });

  it('gets or creates a smart wallet for the artist', async () => {
    await createMomentBatch(makeBatchInput());
    expect(getWalletLinkedSmartAccount).toHaveBeenCalledWith({
      address: ARTIST,
    });
  });
});
