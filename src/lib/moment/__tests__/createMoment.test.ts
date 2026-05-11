import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>();
  return {
    ...actual,
    encodeFunctionData: vi.fn().mockReturnValue('0xencoded'),
  };
});
vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));
vi.mock('@/lib/splits/normalizeSplitRecipients', () => ({
  normalizeSplitRecipients: vi.fn(),
}));
vi.mock('@/lib/splits/processSplits', () => ({
  processSplits: vi.fn(),
}));
vi.mock('../buildAdditionalSetupActions', () => ({ default: vi.fn() }));
vi.mock('@/lib/zora/create1155', () => ({ create1155: vi.fn() }));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));
vi.mock('../parseMomentTransaction', () => ({ default: vi.fn() }));
vi.mock('@/workflows/migrateMuxToArweave', () => ({
  default: vi.fn(),
}));
vi.mock('../indexMoment', () => ({ default: vi.fn() }));
vi.mock('@/lib/protocolSdk/create/factory-addresses', () => ({
  getFactoryAddress: vi
    .fn()
    .mockReturnValue('0x0000000000000000000000000000000000000002'),
}));
vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
  IS_TESTNET: false,
}));

import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { normalizeSplitRecipients } from '@/lib/splits/normalizeSplitRecipients';
import { processSplits } from '@/lib/splits/processSplits';
import buildAdditionalSetupActions from '../buildAdditionalSetupActions';
import { create1155 } from '@/lib/zora/create1155';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import parseMomentTransaction from '../parseMomentTransaction';
import migrateMuxToArweave from '@/workflows/migrateMuxToArweave';
import indexMoment from '../indexMoment';
import { createMoment } from '../createMoment';

const ARTIST = '0xArtist' as Address;
const CONTRACT_ADDRESS = '0xContract' as Address;
const TOKEN_ID = '1';
const SMART_ACCOUNT = { address: '0xSmartWallet' as Address };
const TX_HASH = '0xhash';

const makeInput = () => ({
  contract: { name: 'My Album', uri: 'ar://collection-meta' },
  token: {
    tokenMetadataURI: 'ar://token-meta',
    createReferral: '0xReferral' as Address,
    salesConfig: {
      type: 'ERC20Mint' as never,
      pricePerToken: BigInt(0),
      saleStart: BigInt(0),
      saleEnd: BigInt(0),
      currency: '0xUsdc' as Address,
    },
    mintToCreatorCount: 1,
    payoutRecipient: ARTIST,
  },
  account: ARTIST,
  channel: 'web' as const,
  splits: [],
});

const PARAMETERS = {
  address: '0x0000000000000000000000000000000000000001' as Address,
  abi: [],
  args: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOrCreateSmartWallet).mockResolvedValue(SMART_ACCOUNT as never);
  vi.mocked(normalizeSplitRecipients).mockResolvedValue([]);
  vi.mocked(processSplits).mockResolvedValue({ splitAddress: null });
  vi.mocked(buildAdditionalSetupActions).mockResolvedValue(undefined);
  vi.mocked(create1155).mockResolvedValue({ parameters: PARAMETERS } as never);
  vi.mocked(sendUserOperation).mockResolvedValue({
    logs: [],
    transactionHash: TX_HASH,
  } as never);
  vi.mocked(parseMomentTransaction).mockReturnValue({
    contractAddress: CONTRACT_ADDRESS,
    tokenId: TOKEN_ID,
  });
  vi.mocked(migrateMuxToArweave).mockResolvedValue(undefined as never);
  vi.mocked(indexMoment).mockResolvedValue(undefined);
});

describe('createMoment', () => {
  it('returns contractAddress, tokenId, hash, and chainId', async () => {
    const result = await createMoment(makeInput());

    expect(result).toEqual({
      contractAddress: CONTRACT_ADDRESS,
      tokenId: TOKEN_ID,
      hash: TX_HASH,
      chainId: 8453,
    });
  });

  it('calls indexMoment with contractAddress, tokenId, artistAddress, and channel', async () => {
    await createMoment(makeInput());

    expect(indexMoment).toHaveBeenCalledWith(
      expect.objectContaining({
        contractAddress: CONTRACT_ADDRESS,
        tokenId: TOKEN_ID,
        artistAddress: ARTIST,
        channel: 'web',
      })
    );
  });

  it('starts migrate workflow with moment location', async () => {
    await createMoment(makeInput());

    expect(migrateMuxToArweave).toHaveBeenCalledWith(
      expect.objectContaining({
        moment: expect.objectContaining({
          collectionAddress: CONTRACT_ADDRESS,
          tokenId: TOKEN_ID,
        }),
        artistAddress: ARTIST,
      })
    );
  });

  it('gets or creates a smart wallet for the artist', async () => {
    await createMoment(makeInput());

    expect(getOrCreateSmartWallet).toHaveBeenCalledWith({ address: ARTIST });
  });
});
