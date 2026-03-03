import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));

vi.mock('@/lib/splits/resolveSplitAddresses', () => ({
  resolveSplitAddresses: vi.fn(),
}));

vi.mock('@/lib/splits/processSplits', () => ({
  processSplits: vi.fn(),
}));

vi.mock('@/lib/splits/getSplitAdminAddresses', () => ({
  getSplitAdminAddresses: vi.fn(),
}));

vi.mock('@/lib/zora/create1155', () => ({
  create1155: vi.fn(),
}));

vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));

vi.mock('@/lib/moment/parseMomentTransaction', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/moment/getMomentMime', () => ({
  default: vi.fn(),
}));

vi.mock('@trigger.dev/sdk', () => ({
  tasks: { trigger: vi.fn() },
}));

vi.mock('@/lib/protocolSdk/create/factory-addresses', () => ({
  getFactoryAddress: vi.fn(),
}));

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>();
  return {
    ...actual,
    encodeFunctionData: vi.fn().mockReturnValue('0xencoded'),
  };
});

import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { resolveSplitAddresses } from '@/lib/splits/resolveSplitAddresses';
import { create1155 } from '@/lib/zora/create1155';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import parseMomentTransaction from '@/lib/moment/parseMomentTransaction';
import getMomentMime from '@/lib/moment/getMomentMime';
import { tasks } from '@trigger.dev/sdk';
import { getFactoryAddress } from '@/lib/protocolSdk/create/factory-addresses';
import {
  createMoment,
  type CreateMomentContractInput,
} from '@/lib/moment/createMoment';

const EXISTING_CONTRACT = '0x1111111111111111111111111111111111111111' as const;
const FACTORY = '0x2222222222222222222222222222222222222222' as const;
const ARTIST = '0x3333333333333333333333333333333333333333' as const;
const RESULT_CONTRACT = '0x4444444444444444444444444444444444444444' as const;
const TX_HASH =
  '0xaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd' as const;

const baseInput: CreateMomentContractInput = {
  contract: { address: EXISTING_CONTRACT },
  token: {
    tokenMetadataURI: 'ar://metadata-hash',
    createReferral: '0x0000000000000000000000000000000000000000',
    salesConfig: {
      type: 'fixedPrice',
      pricePerToken: '0',
      saleStart: 0n,
      saleEnd: 9999999999n,
    },
    mintToCreatorCount: 0,
  },
  account: ARTIST,
};

describe('createMoment', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
      address: ARTIST,
    } as any);

    vi.mocked(resolveSplitAddresses).mockResolvedValue([]);

    vi.mocked(getFactoryAddress).mockReturnValue(FACTORY);

    vi.mocked(create1155).mockResolvedValue({
      parameters: {
        address: EXISTING_CONTRACT,
        abi: [],
        functionName: 'multicall',
        args: [[]],
      },
    } as any);

    vi.mocked(sendUserOperation).mockResolvedValue({
      logs: [],
      transactionHash: TX_HASH,
    } as any);

    vi.mocked(parseMomentTransaction).mockReturnValue({
      contractAddress: RESULT_CONTRACT,
      tokenId: '7',
    } as any);

    vi.mocked(getMomentMime).mockResolvedValue(null);
  });

  it('returns contractAddress, tokenId, hash, and chainId', async () => {
    const result = await createMoment(baseInput);

    expect(result.contractAddress).toBe(RESULT_CONTRACT);
    expect(result.tokenId).toBe('7');
    expect(result.hash).toBe(TX_HASH);
    expect(result.chainId).toBe(8453);
  });

  it('triggers migration when mime type is a video', async () => {
    vi.mocked(getMomentMime).mockResolvedValue('video/mp4');

    await createMoment(baseInput);

    expect(tasks.trigger).toHaveBeenCalledWith('migrate-mux-to-arweave', {
      collectionAddress: RESULT_CONTRACT,
      tokenId: '7',
      chainId: 8453,
      artistAddress: ARTIST,
    });
  });

  it('does not trigger migration for image mime type', async () => {
    vi.mocked(getMomentMime).mockResolvedValue('image/jpeg');

    await createMoment(baseInput);

    expect(tasks.trigger).not.toHaveBeenCalled();
  });

  it('does not trigger migration when getMomentMime returns null', async () => {
    vi.mocked(getMomentMime).mockResolvedValue(null);

    await createMoment(baseInput);

    expect(tasks.trigger).not.toHaveBeenCalled();
  });

  it('calls getMomentMime with the token metadata URI', async () => {
    await createMoment(baseInput);

    expect(getMomentMime).toHaveBeenCalledWith('ar://metadata-hash');
  });

  it('passes transaction logs to parseMomentTransaction', async () => {
    const logs = [{ address: EXISTING_CONTRACT }] as any;
    vi.mocked(sendUserOperation).mockResolvedValue({
      logs,
      transactionHash: TX_HASH,
    } as any);

    await createMoment(baseInput);

    expect(parseMomentTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ logs })
    );
  });

  it('propagates errors from sendUserOperation', async () => {
    vi.mocked(sendUserOperation).mockRejectedValue(
      new Error('Paymaster failed')
    );

    await expect(createMoment(baseInput)).rejects.toThrow('Paymaster failed');
  });

  it('propagates errors from tasks.trigger', async () => {
    vi.mocked(getMomentMime).mockResolvedValue('video/mp4');
    vi.mocked(tasks.trigger).mockRejectedValue(
      new Error('Trigger.dev unavailable')
    );

    await expect(createMoment(baseInput)).rejects.toThrow(
      'Trigger.dev unavailable'
    );
  });
});
