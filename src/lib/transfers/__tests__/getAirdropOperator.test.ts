import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAddress } from 'viem';
import { getPublicClient } from '@/lib/viem/publicClient';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import isCoinbaseSmartWallet from '@/lib/smartwallets/isCoinbaseSmartWallet';
import getAirdropOperator from '../getAirdropOperator';

const TRANSFER_SINGLE_TOPIC =
  '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62';
const hash =
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as const;

const collectionAddress = getAddress(
  '0x16af6f4491a4aa8cabd4f0f959dbe0ec24cb88ec'
);

const ZERO_FROM_TOPIC =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const;
const toTopic =
  '0x000000000000000000000000af1452d289e22fbd0dea9d5097353c72a90fac33' as const;

const operatorTopic =
  '0x0000000000000000000000004444444444444444444444444444444444444444' as const;
const operatorAddress = getAddress(
  `0x${operatorTopic.slice(-40)}` as `0x${string}`
);

const mintTransferTopics = [
  TRANSFER_SINGLE_TOPIC,
  operatorTopic,
  ZERO_FROM_TOPIC,
  toTopic,
] as const;

const receiptWithTransferSingle = (
  topics: readonly (string | undefined)[],
  logAddress: string = collectionAddress
) => ({
  logs: [
    {
      address: logAddress,
      topics: [...topics],
    },
  ],
});

vi.mock('@/lib/viem/publicClient', () => ({
  getPublicClient: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/smartwallets/isCoinbaseSmartWallet', () => ({
  default: vi.fn(),
}));

const mockGetPublicClient = vi.mocked(getPublicClient);
const mockSelectArtists = vi.mocked(selectArtists);
const mockIsCb = vi.mocked(isCoinbaseSmartWallet);

describe('getAirdropOperator', () => {
  const chainId = 8453;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPublicClient.mockReturnValue({
      getTransactionReceipt: vi
        .fn()
        .mockImplementation(async () =>
          receiptWithTransferSingle(mintTransferTopics)
        ),
    } as never);
  });

  it('throws when no TransferSingle log is present', async () => {
    mockGetPublicClient.mockReturnValue({
      getTransactionReceipt: vi.fn().mockResolvedValue({ logs: [] }),
    } as never);

    await expect(
      getAirdropOperator(hash, chainId, collectionAddress)
    ).rejects.toThrow('Airdrop mint TransferSingle log not found');
  });

  it('throws when topics[0] does not match TransferSingle (wrong log picked)', async () => {
    mockGetPublicClient.mockReturnValue({
      getTransactionReceipt: vi
        .fn()
        .mockResolvedValue(
          receiptWithTransferSingle(['0x' + '11'.repeat(32), operatorTopic])
        ),
    } as never);

    await expect(
      getAirdropOperator(hash, chainId, collectionAddress)
    ).rejects.toThrow('Airdrop mint TransferSingle log not found');
  });

  it('throws when TransferSingle is from another contract (not collection)', async () => {
    mockGetPublicClient.mockReturnValue({
      getTransactionReceipt: vi
        .fn()
        .mockResolvedValue(
          receiptWithTransferSingle(mintTransferTopics, operatorAddress)
        ),
    } as never);

    await expect(
      getAirdropOperator(hash, chainId, collectionAddress)
    ).rejects.toThrow('Airdrop mint TransferSingle log not found');
  });

  it('throws when from is not zero (not a mint)', async () => {
    const nonMintTopics = [
      TRANSFER_SINGLE_TOPIC,
      operatorTopic,
      toTopic,
      ZERO_FROM_TOPIC,
    ] as const;
    mockGetPublicClient.mockReturnValue({
      getTransactionReceipt: vi
        .fn()
        .mockResolvedValue(receiptWithTransferSingle(nonMintTopics)),
    } as never);

    await expect(
      getAirdropOperator(hash, chainId, collectionAddress)
    ).rejects.toThrow('Airdrop mint TransferSingle log not found');
  });

  it('returns artist from DB by smart_wallet when address is a Coinbase smart wallet', async () => {
    mockIsCb.mockResolvedValue(true);
    mockSelectArtists.mockResolvedValue({
      data: [
        { address: '0xARTIST0000000000000000000000000000', username: 'bob' },
      ],
    } as never);

    const result = await getAirdropOperator(hash, chainId, collectionAddress);

    expect(mockSelectArtists).toHaveBeenCalledWith({
      smart_wallet: operatorAddress,
      address: undefined,
    });
    expect(result).toEqual({
      address: '0xARTIST0000000000000000000000000000',
      username: 'bob',
    });
  });

  it('returns artist from DB by address when not a Coinbase smart wallet', async () => {
    mockIsCb.mockResolvedValue(false);
    mockSelectArtists.mockResolvedValue({
      data: [
        {
          address: '0x5555555555555555555555555555555555555555',
          username: 'ann',
        },
      ],
    } as never);

    const result = await getAirdropOperator(hash, chainId, collectionAddress);

    expect(mockSelectArtists).toHaveBeenCalledWith({
      smart_wallet: undefined,
      address: operatorAddress,
    });
    expect(result).toEqual({
      address: '0x5555555555555555555555555555555555555555',
      username: 'ann',
    });
  });

  it('throws when artist is not in DB (not a Coinbase smart wallet path)', async () => {
    mockIsCb.mockResolvedValue(false);
    mockSelectArtists.mockResolvedValue({ data: null } as never);

    await expect(
      getAirdropOperator(hash, chainId, collectionAddress)
    ).rejects.toThrow('Airdrop operator not found');
  });

  it('throws when artist is not in DB (Coinbase smart wallet path)', async () => {
    mockIsCb.mockResolvedValue(true);
    mockSelectArtists.mockResolvedValue({ data: null } as never);

    await expect(
      getAirdropOperator(hash, chainId, collectionAddress)
    ).rejects.toThrow('Airdrop operator not found');
  });

  it('throws when selectArtists returns an empty list', async () => {
    mockIsCb.mockResolvedValue(false);
    mockSelectArtists.mockResolvedValue({ data: [] } as never);

    await expect(
      getAirdropOperator(hash, chainId, collectionAddress)
    ).rejects.toThrow('Airdrop operator not found');
  });
});
