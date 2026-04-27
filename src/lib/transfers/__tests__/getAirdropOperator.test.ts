import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAddress } from 'viem';
import { getPublicClient } from '@/lib/viem/publicClient';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import getCoinbaseAddressOwner from '@/lib/smartwallets/getCoinbaseAddressOwner';
import isCoinbaseSmartWallet from '@/lib/smartwallets/isCoinbaseSmartWallet';
import getAirdropOperator from '../getAirdropOperator';

const TRANSFER_SINGLE_TOPIC =
  '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62';
const hash =
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as const;

const operatorTopic =
  '0x0000000000000000000000004444444444444444444444444444444444444444' as const;
const operatorAddress = getAddress(
  `0x${operatorTopic.slice(-40)}` as `0x${string}`
);

const receiptWithTransferSingle = (topics: (string | undefined)[]) => ({
  logs: [
    {
      topics,
    },
  ],
});

vi.mock('@/lib/viem/publicClient', () => ({
  getPublicClient: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/smartwallets/getCoinbaseAddressOwner', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/smartwallets/isCoinbaseSmartWallet', () => ({
  default: vi.fn(),
}));

const mockGetPublicClient = vi.mocked(getPublicClient);
const mockSelectArtists = vi.mocked(selectArtists);
const mockGetOwner = vi.mocked(getCoinbaseAddressOwner);
const mockIsCb = vi.mocked(isCoinbaseSmartWallet);

describe('getAirdropOperator', () => {
  const chainId = 8453;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPublicClient.mockReturnValue({
      getTransactionReceipt: vi
        .fn()
        .mockImplementation(async () =>
          receiptWithTransferSingle([
            TRANSFER_SINGLE_TOPIC,
            operatorTopic,
            '0x',
            '0x',
          ])
        ),
    } as never);
  });

  it('throws when no TransferSingle log is present', async () => {
    mockGetPublicClient.mockReturnValue({
      getTransactionReceipt: vi.fn().mockResolvedValue({ logs: [] }),
    } as never);

    await expect(getAirdropOperator(hash, chainId)).rejects.toThrow(
      'Transfer single topic not found'
    );
  });

  it('throws when topics[0] does not match TransferSingle (wrong log picked)', async () => {
    mockGetPublicClient.mockReturnValue({
      getTransactionReceipt: vi
        .fn()
        .mockResolvedValue(
          receiptWithTransferSingle(['0x' + '11'.repeat(32), operatorTopic])
        ),
    } as never);

    await expect(getAirdropOperator(hash, chainId)).rejects.toThrow(
      'Transfer single topic not found'
    );
  });

  it('returns artist from DB by smart_wallet when address is a Coinbase smart wallet', async () => {
    mockIsCb.mockResolvedValue(true);
    mockSelectArtists.mockResolvedValue({
      data: [
        { address: '0xARTIST0000000000000000000000000000', username: 'bob' },
      ],
    } as never);

    const result = await getAirdropOperator(hash, chainId);

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

    const result = await getAirdropOperator(hash, chainId);

    expect(mockSelectArtists).toHaveBeenCalledWith({
      smart_wallet: undefined,
      address: operatorAddress,
    });
    expect(result).toEqual({
      address: '0x5555555555555555555555555555555555555555',
      username: 'ann',
    });
  });

  it('returns empty address and null username when no artist and no Coinbase owner', async () => {
    mockIsCb.mockResolvedValue(false);
    mockSelectArtists.mockResolvedValue({ data: null } as never);
    mockGetOwner.mockResolvedValue(null);

    const result = await getAirdropOperator(hash, chainId);

    expect(result).toEqual({ address: '', username: null });
  });

  it('returns Coinbase EOA owner when artist is not in DB', async () => {
    mockIsCb.mockResolvedValue(true);
    mockSelectArtists.mockResolvedValue({ data: null } as never);
    mockGetOwner.mockResolvedValue(
      '0x6666666666666666666666666666666666666666'
    );

    const result = await getAirdropOperator(hash, chainId);

    expect(result).toEqual({
      address: '0x6666666666666666666666666666666666666666',
      username: null,
    });
  });
});
