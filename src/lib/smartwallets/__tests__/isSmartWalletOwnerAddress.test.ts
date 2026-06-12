import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAddress } from 'viem';
import { getPublicClient } from '@/lib/viem/publicClient';
import isSmartWalletOwnerAddress from '../isSmartWalletOwnerAddress';

vi.mock('@/lib/viem/publicClient', () => ({ getPublicClient: vi.fn() }));

const mockGetPublicClient = vi.mocked(getPublicClient);

const smartWalletAddress = getAddress(
  '0x1111111111111111111111111111111111111111'
);
const ownerAddress = getAddress('0x2222222222222222222222222222222222222222');

describe('isSmartWalletOwnerAddress', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns true when address is a registered owner', async () => {
    mockGetPublicClient.mockReturnValue({
      readContract: vi.fn().mockResolvedValue(true),
    } as never);
    await expect(
      isSmartWalletOwnerAddress(smartWalletAddress, ownerAddress)
    ).resolves.toBe(true);
  });

  it('returns false when address is not a registered owner', async () => {
    mockGetPublicClient.mockReturnValue({
      readContract: vi.fn().mockResolvedValue(false),
    } as never);
    await expect(
      isSmartWalletOwnerAddress(smartWalletAddress, ownerAddress)
    ).resolves.toBe(false);
  });
});
