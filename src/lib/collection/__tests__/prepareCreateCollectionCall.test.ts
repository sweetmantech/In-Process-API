import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/splits/normalizeSplitRecipients', () => ({
  normalizeSplitRecipients: vi.fn(),
}));
vi.mock('@/lib/splits/processSplits', () => ({
  processSplits: vi.fn(),
}));
vi.mock('@/lib/protocolSdk/utils', () => ({
  makeContractParameters: vi.fn(),
}));
vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>();
  return { ...actual, encodeFunctionData: vi.fn() };
});
vi.mock('@/lib/protocolSdk/create/factory-addresses', () => ({
  getFactoryAddress: vi.fn().mockReturnValue('0xfactory'),
}));
vi.mock('../zora/addPermissionCall', () => ({
  addPermissionCall: vi.fn().mockReturnValue('0xpermission'),
}));

import { normalizeSplitRecipients } from '@/lib/splits/normalizeSplitRecipients';
import { processSplits } from '@/lib/splits/processSplits';
import { makeContractParameters } from '@/lib/protocolSdk/utils';
import { encodeFunctionData } from 'viem';
import prepareCreateCollectionCall from '@/lib/collection/prepareCreateCollectionCall';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`;
const SMART_WALLET_ADDRESS =
  '0xcccccccccccccccccccccccccccccccccccccccc' as `0x${string}`;
const FACTORY_ADDRESS = '0xfactory' as `0x${string}`;

const smartAccount = { address: SMART_WALLET_ADDRESS };
const validItem = { uri: 'ipfs://test', name: 'Test Collection' };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(normalizeSplitRecipients).mockResolvedValue([]);
  vi.mocked(makeContractParameters).mockReturnValue({
    abi: [],
    functionName: 'createContract',
    args: [],
    address: FACTORY_ADDRESS,
    account: SMART_WALLET_ADDRESS,
  } as any);
  vi.mocked(encodeFunctionData).mockReturnValue('0xencoded' as `0x${string}`);
});

describe('prepareCreateCollectionCall', () => {
  it('returns to and data', async () => {
    const result = await prepareCreateCollectionCall(
      validItem,
      smartAccount,
      ACCOUNT
    );
    expect(result).toEqual({ to: FACTORY_ADDRESS, data: '0xencoded' });
  });

  it('uses account address as royaltyRecipient when no splits', async () => {
    await prepareCreateCollectionCall(validItem, smartAccount, ACCOUNT);

    const args = vi.mocked(makeContractParameters).mock.calls[0][0]
      .args as any[];
    const royaltyConfig = args[2];
    expect(royaltyConfig.royaltyRecipient).toBe(ACCOUNT);
  });

  it('uses split address as royaltyRecipient when splits are provided', async () => {
    const SPLIT_ADDRESS =
      '0xdddddddddddddddddddddddddddddddddddddddd' as `0x${string}`;
    vi.mocked(normalizeSplitRecipients).mockResolvedValue([
      { address: ACCOUNT, percentAllocation: 60 },
      {
        address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        percentAllocation: 40,
      },
    ] as any);
    vi.mocked(processSplits).mockResolvedValue({
      splitAddress: SPLIT_ADDRESS,
    } as any);

    await prepareCreateCollectionCall(
      {
        ...validItem,
        splits: [
          { address: ACCOUNT, percentAllocation: 60 },
          {
            address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            percentAllocation: 40,
          },
        ],
      },
      smartAccount,
      ACCOUNT
    );

    const args = vi.mocked(makeContractParameters).mock.calls[0][0]
      .args as any[];
    expect(args[2].royaltyRecipient.toLowerCase()).toBe(
      SPLIT_ADDRESS.toLowerCase()
    );
  });

  it('does not call processSplits when splits has fewer than 2 recipients', async () => {
    vi.mocked(normalizeSplitRecipients).mockResolvedValue([
      { address: ACCOUNT, percentAllocation: 100 },
    ] as any);

    await prepareCreateCollectionCall(validItem, smartAccount, ACCOUNT);

    expect(processSplits).not.toHaveBeenCalled();
  });

  it('passes uri and name to makeContractParameters', async () => {
    await prepareCreateCollectionCall(
      { uri: 'ipfs://my-uri', name: 'My Collection' },
      smartAccount,
      ACCOUNT
    );

    const args = vi.mocked(makeContractParameters).mock.calls[0][0]
      .args as any[];
    expect(args[0]).toBe('ipfs://my-uri');
    expect(args[1]).toBe('My Collection');
  });
});
