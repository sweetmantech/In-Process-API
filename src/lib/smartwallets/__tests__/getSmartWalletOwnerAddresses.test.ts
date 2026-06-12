import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAddress } from 'viem';
import { getPublicClient } from '@/lib/viem/publicClient';
import getSmartWalletOwnerAddresses from '../getSmartWalletOwnerAddresses';

vi.mock('@/lib/viem/publicClient', () => ({ getPublicClient: vi.fn() }));

const mockGetPublicClient = vi.mocked(getPublicClient);

const smartWalletAddress = getAddress(
  '0x1111111111111111111111111111111111111111'
);
const eoa = getAddress('0x2222222222222222222222222222222222222222');
const cdpKey = getAddress('0x3333333333333333333333333333333333333333');

const toOwnerBytes = (addr: `0x${string}`) =>
  `0x000000000000000000000000${addr.slice(2).toLowerCase()}` as `0x${string}`;

// 64-byte passkey owner (not an address)
const passkeyBytes = ('0x' + 'ab'.repeat(64)) as `0x${string}`;

const mockClient = (
  ownerCount: bigint,
  multicallResults: { status: 'success' | 'failure'; result?: `0x${string}` }[]
) =>
  ({
    readContract: vi.fn().mockResolvedValue(ownerCount),
    multicall: vi.fn().mockResolvedValue(multicallResults),
  }) as never;

describe('getSmartWalletOwnerAddresses', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array when ownerCount is 0', async () => {
    mockGetPublicClient.mockReturnValue(mockClient(BigInt(0), []));
    await expect(
      getSmartWalletOwnerAddresses(smartWalletAddress)
    ).resolves.toEqual([]);
  });

  it('returns address for a single 32-byte address owner', async () => {
    mockGetPublicClient.mockReturnValue(
      mockClient(BigInt(1), [{ status: 'success', result: toOwnerBytes(eoa) }])
    );
    await expect(
      getSmartWalletOwnerAddresses(smartWalletAddress)
    ).resolves.toEqual([eoa]);
  });

  it('returns multiple addresses when multiple address owners exist', async () => {
    mockGetPublicClient.mockReturnValue(
      mockClient(BigInt(2), [
        { status: 'success', result: toOwnerBytes(cdpKey) },
        { status: 'success', result: toOwnerBytes(eoa) },
      ])
    );
    await expect(
      getSmartWalletOwnerAddresses(smartWalletAddress)
    ).resolves.toEqual([cdpKey, eoa]);
  });

  it('ignores passkey owners (64-byte result)', async () => {
    mockGetPublicClient.mockReturnValue(
      mockClient(BigInt(2), [
        { status: 'success', result: passkeyBytes },
        { status: 'success', result: toOwnerBytes(eoa) },
      ])
    );
    await expect(
      getSmartWalletOwnerAddresses(smartWalletAddress)
    ).resolves.toEqual([eoa]);
  });

  it('ignores failed multicall results', async () => {
    mockGetPublicClient.mockReturnValue(
      mockClient(BigInt(2), [
        { status: 'failure' },
        { status: 'success', result: toOwnerBytes(eoa) },
      ])
    );
    await expect(
      getSmartWalletOwnerAddresses(smartWalletAddress)
    ).resolves.toEqual([eoa]);
  });
});
