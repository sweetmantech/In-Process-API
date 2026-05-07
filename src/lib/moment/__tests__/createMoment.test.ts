import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));
vi.mock('@/lib/splits/resolveSplitAddresses', () => ({
  resolveSplitAddresses: vi.fn(),
}));
vi.mock('../resolvePayoutRecipient', () => ({ default: vi.fn() }));
vi.mock('../buildAdditionalSetupActions', () => ({ default: vi.fn() }));
vi.mock('@/lib/zora/create1155', () => ({ create1155: vi.fn() }));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));
vi.mock('../parseMomentTransaction', () => ({ default: vi.fn() }));
vi.mock('@/lib/trigger.dev/triggerMuxMigration', () => ({ default: vi.fn() }));
vi.mock('../indexMoment', () => ({ default: vi.fn() }));
vi.mock('@/lib/protocolSdk/create/factory-addresses', () => ({
  getFactoryAddress: vi.fn().mockReturnValue('0xFactory'),
}));
vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
  IS_TESTNET: false,
}));

import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { resolveSplitAddresses } from '@/lib/splits/resolveSplitAddresses';
import resolvePayoutRecipient from '../resolvePayoutRecipient';
import buildAdditionalSetupActions from '../buildAdditionalSetupActions';
import { create1155 } from '@/lib/zora/create1155';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import parseMomentTransaction from '../parseMomentTransaction';
import triggerMuxMigration from '@/lib/trigger.dev/triggerMuxMigration';
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
  address: '0xOtherContract' as Address,
  abi: [],
  args: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOrCreateSmartWallet).mockResolvedValue(SMART_ACCOUNT as never);
  vi.mocked(resolveSplitAddresses).mockResolvedValue([]);
  vi.mocked(resolvePayoutRecipient).mockResolvedValue(ARTIST);
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
  vi.mocked(triggerMuxMigration).mockResolvedValue(undefined);
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

  it('triggers mux migration with token URI and moment location', async () => {
    await createMoment(makeInput());

    expect(triggerMuxMigration).toHaveBeenCalledWith(
      expect.objectContaining({
        uri: 'ar://token-meta',
        collectionAddress: CONTRACT_ADDRESS,
        tokenId: TOKEN_ID,
        artistAddress: ARTIST,
      })
    );
  });

  it('gets or creates a smart wallet for the artist', async () => {
    await createMoment(makeInput());

    expect(getOrCreateSmartWallet).toHaveBeenCalledWith({ address: ARTIST });
  });
});
