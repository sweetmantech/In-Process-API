import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import createMomentBatch from '../createMomentBatch';

vi.mock('@/lib/smartwallets/getOperationalSmartWallet', () => ({
  getOperationalSmartWallet: vi.fn(),
}));
vi.mock('@/lib/artists/getOrCreateArtist', () => ({ default: vi.fn() }));
vi.mock('../createBatchSetupActions', () => ({ default: vi.fn() }));
vi.mock('@/lib/viem/createMomentBatchCall', () => ({ default: vi.fn() }));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));
vi.mock('@/lib/protocolSdk/create/1155-create-helper', () => ({
  getContractAddressFromReceipt: vi.fn(),
}));
vi.mock('../getCreatedTokenIds', () => ({ default: vi.fn() }));
vi.mock('../indexMoment', () => ({ default: vi.fn() }));
vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
}));

import { getOperationalSmartWallet } from '@/lib/smartwallets/getOperationalSmartWallet';
import getOrCreateArtist from '@/lib/artists/getOrCreateArtist';
import createBatchSetupActions from '../createBatchSetupActions';
import createMomentBatchCall from '@/lib/viem/createMomentBatchCall';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getContractAddressFromReceipt } from '@/lib/protocolSdk/create/1155-create-helper';
import getCreatedTokenIds from '../getCreatedTokenIds';
import indexMoment from '../indexMoment';

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

const SMART_ACCOUNT = { address: '0x0000000000000000000000000000000000000bee' };
const ARTIST_CONTEXT = {
  artistId: 'artist-uuid-123',
  primaryWallet: ARTIST,
  wallets: [{ address: ARTIST, type: 'external' as const }],
};

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
  vi.mocked(getOrCreateArtist).mockResolvedValue(ARTIST_CONTEXT as never);
  vi.mocked(getOperationalSmartWallet).mockResolvedValue(
    SMART_ACCOUNT as never
  );
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
  vi.mocked(getCreatedTokenIds).mockReturnValue(['1'] as never);
  vi.mocked(indexMoment).mockResolvedValue(undefined);
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

  it('calls indexMoment for each token with correct params', async () => {
    vi.mocked(getCreatedTokenIds).mockReturnValue(['10', '11'] as never);
    const input = createMomentBatchSchema.parse({
      contract: { name: 'My Album', uri: 'ar://collection-meta' },
      tokens: [baseToken, { ...baseToken, tokenMetadataURI: 'ar://token-2' }],
      account: ARTIST,
      channel: 'web',
    });

    await createMomentBatch(input);

    expect(indexMoment).toHaveBeenCalledTimes(2);
    expect(indexMoment).toHaveBeenCalledWith({
      artistAddress: ARTIST,
      contractAddress: CONTRACT,
      tokenId: '10',
      channel: 'web',
      uri: input.tokens[0].tokenMetadataURI,
      maxSupply: input.tokens[0].maxSupply,
      chainId: 8453,
    });
    expect(indexMoment).toHaveBeenCalledWith({
      artistAddress: ARTIST,
      contractAddress: CONTRACT,
      tokenId: '11',
      channel: 'web',
      uri: input.tokens[1].tokenMetadataURI,
      maxSupply: input.tokens[1].maxSupply,
      chainId: 8453,
    });
  });

  it('uses getOperationalSmartWallet with artist from account', async () => {
    await createMomentBatch(makeBatchInput());
    expect(getOrCreateArtist).toHaveBeenCalledWith({ address: ARTIST });
    expect(getOperationalSmartWallet).toHaveBeenCalledWith({
      artist: ARTIST_CONTEXT,
      moment: { collectionAddress: undefined, chainId: 8453, tokenId: '0' },
    });
  });

  it('passes contract.address to getOperationalSmartWallet when minting to existing collection', async () => {
    const input = createMomentBatchSchema.parse({
      contract: { address: CONTRACT },
      tokens: [baseToken],
      account: ARTIST,
      channel: 'telegram',
    });

    await createMomentBatch(input);

    expect(getOperationalSmartWallet).toHaveBeenCalledWith({
      artist: ARTIST_CONTEXT,
      moment: { collectionAddress: CONTRACT, chainId: 8453, tokenId: '0' },
    });
  });
});
