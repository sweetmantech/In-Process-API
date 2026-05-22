import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
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

import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import prepareCreateCollectionCall from '@/lib/collection/prepareCreateCollectionCall';
import { parseEventLogs } from 'viem';
import { createCollections } from '@/lib/collection/createCollections';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`;
const SMART_WALLET = { address: '0xcccccccccccccccccccccccccccccccccccccccc' };
const CONTRACT_A =
  '0xaaaa000000000000000000000000000000000001' as `0x${string}`;
const CONTRACT_B =
  '0xbbbb000000000000000000000000000000000002' as `0x${string}`;
const TX_HASH = '0xdeadbeef' as `0x${string}`;

const baseInput = {
  account: ACCOUNT,
  chainId: 8453,
  collections: [
    { uri: 'ipfs://test1', name: 'Collection 1' },
    { uri: 'ipfs://test2', name: 'Collection 2' },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOrCreateSmartWallet).mockResolvedValue(SMART_WALLET as any);
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
    { args: { newContract: CONTRACT_B } },
  ] as any);
});

describe('createCollections', () => {
  it('returns one result per SetupNewContract event', async () => {
    const results = await createCollections(baseInput);
    expect(results).toHaveLength(2);
    expect(results[0].contractAddress).toBe(CONTRACT_A);
    expect(results[1].contractAddress).toBe(CONTRACT_B);
  });

  it('includes hash and chainId from input in each result', async () => {
    const results = await createCollections(baseInput);
    expect(results[0].hash).toBe(TX_HASH);
    expect(results[0].chainId).toBe(8453);
  });

  it('uses base-sepolia network when chainId is 84532', async () => {
    await createCollections({ ...baseInput, chainId: 84532 });
    expect(sendUserOperation).toHaveBeenCalledWith(
      expect.objectContaining({ network: 'base-sepolia' })
    );
  });

  it('uses base network when chainId is 8453', async () => {
    await createCollections({ ...baseInput, chainId: 8453 });
    expect(sendUserOperation).toHaveBeenCalledWith(
      expect.objectContaining({ network: 'base' })
    );
  });

  it('calls getOrCreateSmartWallet with the top-level account', async () => {
    await createCollections(baseInput);
    expect(getOrCreateSmartWallet).toHaveBeenCalledWith({ address: ACCOUNT });
  });

  it('calls prepareCreateCollectionCall once per collection item', async () => {
    await createCollections(baseInput);
    expect(prepareCreateCollectionCall).toHaveBeenCalledTimes(2);
  });

  it('calls sendUserOperation exactly once with all prepared calls', async () => {
    await createCollections(baseInput);
    expect(sendUserOperation).toHaveBeenCalledTimes(1);
    const { calls } = vi.mocked(sendUserOperation).mock.calls[0][0];
    expect(calls).toHaveLength(2);
  });

  it('throws when no SetupNewContract event is found', async () => {
    vi.mocked(parseEventLogs).mockReturnValue([]);
    await expect(createCollections(baseInput)).rejects.toThrow(
      'Failed to find SetupNewContract event in transaction logs'
    );
  });
});
