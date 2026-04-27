import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPublicClient } from '@/lib/viem/publicClient';
import getCoinbaseAddressOwner from '../getCoinbaseAddressOwner';

const wallet = '0x1111111111111111111111111111111111111111' as const;
const ownerFromTopic =
  '0x0000000000000000000000002222222222222222222222222222222222222222' as const;

vi.mock('@/lib/viem/publicClient', () => ({
  getPublicClient: vi.fn(),
}));

const mockGetPublicClient = vi.mocked(getPublicClient);

describe('getCoinbaseAddressOwner', () => {
  const chainId = 8453;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when nextOwnerIndex is 0', async () => {
    mockGetPublicClient.mockReturnValue({
      readContract: vi.fn().mockResolvedValue(0n),
      multicall: vi.fn(),
    } as never);

    await expect(getCoinbaseAddressOwner(wallet, chainId)).resolves.toBeNull();
  });

  it('returns null when nextOwnerIndex is not a safe integer', async () => {
    mockGetPublicClient.mockReturnValue({
      readContract: vi
        .fn()
        .mockResolvedValue(BigInt(Number.MAX_SAFE_INTEGER) + 2n),
      multicall: vi.fn(),
    } as never);

    await expect(getCoinbaseAddressOwner(wallet, chainId)).resolves.toBeNull();
  });

  it('returns the first valid owner from ownerAtIndex results', async () => {
    mockGetPublicClient.mockReturnValue({
      readContract: vi.fn().mockResolvedValue(1n),
      multicall: vi
        .fn()
        .mockResolvedValue([{ result: ownerFromTopic, status: 'success' }]),
    } as never);

    const result = await getCoinbaseAddressOwner(wallet, chainId);

    expect(result).toBe('0x2222222222222222222222222222222222222222');
  });

  it('skips empty or too-short results and returns a later valid owner', async () => {
    const valid =
      '0x0000000000000000000000003333333333333333333333333333333333333333' as const;
    mockGetPublicClient.mockReturnValue({
      readContract: vi.fn().mockResolvedValue(2n),
      multicall: vi.fn().mockResolvedValue([
        { result: '0x', status: 'success' },
        { result: valid, status: 'success' },
      ]),
    } as never);

    const result = await getCoinbaseAddressOwner(wallet, chainId);

    expect(result).toBe('0x3333333333333333333333333333333333333333');
  });

  it('returns null when all owner slots are empty or invalid', async () => {
    mockGetPublicClient.mockReturnValue({
      readContract: vi.fn().mockResolvedValue(1n),
      multicall: vi
        .fn()
        .mockResolvedValue([
          { result: '0x' + 'ab'.repeat(5), status: 'success' },
        ]),
    } as never);

    await expect(getCoinbaseAddressOwner(wallet, chainId)).resolves.toBeNull();
  });
});
