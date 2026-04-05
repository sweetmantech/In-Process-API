import { describe, it, expect, vi } from 'vitest';
import { Address } from 'viem';

vi.mock('@/lib/viem/publicClient', () => ({
  getPublicClient: vi.fn(),
}));

import { getPublicClient } from '@/lib/viem/publicClient';
import getContractBytecode from '@/lib/viem/getContractBytecode';

const ADDRESS = '0x0000000000000000000000000000000000000001' as Address;
const CHAIN_ID = 8453;
const BYTECODE = '0xdeadbeef';

describe('getContractBytecode', () => {
  it('calls getPublicClient with the given chainId', async () => {
    const mockGetCode = vi.fn().mockResolvedValue(BYTECODE);
    vi.mocked(getPublicClient).mockReturnValue({ getCode: mockGetCode } as any);

    await getContractBytecode(ADDRESS, CHAIN_ID);

    expect(getPublicClient).toHaveBeenCalledWith(CHAIN_ID);
  });

  it('returns the bytecode from publicClient.getCode', async () => {
    const mockGetCode = vi.fn().mockResolvedValue(BYTECODE);
    vi.mocked(getPublicClient).mockReturnValue({ getCode: mockGetCode } as any);

    const result = await getContractBytecode(ADDRESS, CHAIN_ID);

    expect(mockGetCode).toHaveBeenCalledWith({ address: ADDRESS });
    expect(result).toBe(BYTECODE);
  });

  it('returns undefined when contract has no bytecode', async () => {
    const mockGetCode = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getPublicClient).mockReturnValue({ getCode: mockGetCode } as any);

    const result = await getContractBytecode(ADDRESS, CHAIN_ID);

    expect(result).toBeUndefined();
  });
});
