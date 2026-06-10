import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/artists/getOrCreateArtist', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/coinbase/getCanonicalSmartAccount', () => ({
  getCanonicalSmartAccount: vi.fn(),
}));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));
vi.mock('@/lib/collection/prepareCreateCollectionCall', () => ({
  default: vi.fn(),
}));
vi.mock('@zoralabs/protocol-deployments', () => ({
  zoraCreator1155FactoryImplABI: [],
}));
vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>();
  return { ...actual, parseEventLogs: vi.fn() };
});

import getOrCreateArtist from '@/lib/artists/getOrCreateArtist';
import { getCanonicalSmartAccount } from '@/lib/coinbase/getCanonicalSmartAccount';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import prepareCreateCollectionCall from '@/lib/collection/prepareCreateCollectionCall';
import { parseEventLogs } from 'viem';
import { createCollection } from '@/lib/collection/createCollection';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`;
const SMART_WALLET = { address: '0xcccccccccccccccccccccccccccccccccccccccc' };
const CONTRACT_A =
  '0xaaaa000000000000000000000000000000000001' as `0x${string}`;
const TX_HASH = '0xdeadbeef' as `0x${string}`;

const baseInput = {
  account: ACCOUNT,
  chainId: 8453,
  collection: { uri: 'ipfs://test1', name: 'Collection 1' },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOrCreateArtist).mockResolvedValue({
    artistId: 'artist-uuid-1',
  } as any);
  vi.mocked(getCanonicalSmartAccount).mockResolvedValue(SMART_WALLET as any);
  vi.mocked(prepareCreateCollectionCall).mockResolvedValue({
    to: '0xfactory' as `0x${string}`,
    data: '0xencoded' as `0x${string}`,
  });
  vi.mocked(sendUserOperation).mockResolvedValue({
    transactionHash: TX_HASH,
    logs: [],
  } as any);
  vi.mocked(parseEventLogs).mockReturnValue([
    { args: { newContract: CONTRACT_A } },
  ] as any);
});

describe('createCollection', () => {
  it('returns the contract address from SetupNewContract event', async () => {
    const result = await createCollection(baseInput);
    expect(result.contractAddress).toBe(CONTRACT_A);
  });

  it('includes hash and chainId from input in result', async () => {
    const result = await createCollection(baseInput);
    expect(result.hash).toBe(TX_HASH);
    expect(result.chainId).toBe(8453);
  });

  it('uses base-sepolia network when chainId is 84532', async () => {
    await createCollection({ ...baseInput, chainId: 84532 });
    expect(sendUserOperation).toHaveBeenCalledWith(
      expect.objectContaining({ network: 'base-sepolia' })
    );
  });

  it('uses base network when chainId is 8453', async () => {
    await createCollection({ ...baseInput, chainId: 8453 });
    expect(sendUserOperation).toHaveBeenCalledWith(
      expect.objectContaining({ network: 'base' })
    );
  });

  it('calls getOrCreateArtist with the top-level account', async () => {
    await createCollection(baseInput);
    expect(getOrCreateArtist).toHaveBeenCalledWith({ address: ACCOUNT });
  });

  it('calls getCanonicalSmartAccount with the resolved artistId', async () => {
    await createCollection(baseInput);
    expect(getCanonicalSmartAccount).toHaveBeenCalledWith({
      artistId: 'artist-uuid-1',
    });
  });

  it('calls prepareCreateCollectionCall once for the single collection', async () => {
    await createCollection(baseInput);
    expect(prepareCreateCollectionCall).toHaveBeenCalledTimes(1);
  });

  it('calls sendUserOperation exactly once with a single call', async () => {
    await createCollection(baseInput);
    expect(sendUserOperation).toHaveBeenCalledTimes(1);
    const { calls } = vi.mocked(sendUserOperation).mock.calls[0][0];
    expect(calls).toHaveLength(1);
  });

  it('throws when no SetupNewContract event is found', async () => {
    vi.mocked(parseEventLogs).mockReturnValue([]);
    await expect(createCollection(baseInput)).rejects.toThrow(
      'Failed to find SetupNewContract event in transaction logs'
    );
  });
});
