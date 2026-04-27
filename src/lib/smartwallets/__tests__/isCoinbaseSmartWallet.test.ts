import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPublicClient } from '@/lib/viem/publicClient';
import isCoinbaseSmartWallet from '../isCoinbaseSmartWallet';

const CB_IMPL_V1 = '0x000100abaad02f1cfc8bbe32bd5a564817339e72' as const;

const paddedStorageForImpl = (implAddress: `0x${string}`) => {
  const h = implAddress.replace(/^0x/i, '');
  if (h.length !== 40) throw new Error('expected 20-byte address');
  return `0x${'0'.repeat(24)}${h}`.toLowerCase() as `0x${string}`;
};

vi.mock('@/lib/viem/publicClient', () => ({
  getPublicClient: vi.fn(),
}));

const mockGetPublicClient = vi.mocked(getPublicClient);

describe('isCoinbaseSmartWallet', () => {
  const address = '0x1234567890123456789012345678901234567890' as const;
  const chainId = 8453;
  const zeroSlot =
    '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns false when bytecode is empty', async () => {
    mockGetPublicClient.mockReturnValue({
      getCode: vi.fn().mockResolvedValue('0x'),
      getStorageAt: vi.fn(),
    } as never);

    await expect(isCoinbaseSmartWallet(address, chainId)).resolves.toBe(false);
  });

  it('returns false when there is no contract code at address', async () => {
    mockGetPublicClient.mockReturnValue({
      getCode: vi.fn().mockResolvedValue(undefined),
      getStorageAt: vi.fn(),
    } as never);

    await expect(isCoinbaseSmartWallet(address, chainId)).resolves.toBe(false);
  });

  it('returns false when EIP-1967 implementation slot is empty', async () => {
    mockGetPublicClient.mockReturnValue({
      getCode: vi.fn().mockResolvedValue('0x00'),
      getStorageAt: vi.fn().mockResolvedValue(zeroSlot),
    } as never);

    await expect(isCoinbaseSmartWallet(address, chainId)).resolves.toBe(false);
  });

  it('returns false when implementation is not a known Coinbase factory implementation', async () => {
    const other = '0xdead000000000000000000000000000000000001' as const;
    mockGetPublicClient.mockReturnValue({
      getCode: vi.fn().mockResolvedValue('0x00'),
      getStorageAt: vi.fn().mockResolvedValue(paddedStorageForImpl(other)),
    } as never);

    await expect(isCoinbaseSmartWallet(address, chainId)).resolves.toBe(false);
  });

  it('returns true when implementation slot matches a known Coinbase implementation', async () => {
    mockGetPublicClient.mockReturnValue({
      getCode: vi.fn().mockResolvedValue('0x00'),
      getStorageAt: vi.fn().mockResolvedValue(paddedStorageForImpl(CB_IMPL_V1)),
    } as never);

    await expect(isCoinbaseSmartWallet(address, chainId)).resolves.toBe(true);
  });
});
