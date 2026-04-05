import { describe, it, expect, vi } from 'vitest';
import { Address } from 'viem';

vi.mock('@/lib/viem/getContractBytecode', () => ({
  default: vi.fn(),
}));

import getContractBytecode from '@/lib/viem/getContractBytecode';
import isCatalogContract from '@/lib/viem/isCatalogContract';

const ADDRESS = '0x0000000000000000000000000000000000000001' as Address;
const CHAIN_ID = 8453;
const CATALOG_BYTECODE =
  '0x60806040527f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc54600090819081906001600160a01b0316368280378136915af43d82803e15604b573d90f35b3d90fdfea2646970667358221220ab69d2f60c92b7b69f5e8359dd00719c2e3a6035b1a1067f0d4acf31b9b8acc364736f6c63430008190033';

describe('isCatalogContract', () => {
  it('returns true when bytecode matches Catalog bytecode', async () => {
    vi.mocked(getContractBytecode).mockResolvedValue(CATALOG_BYTECODE as any);

    const result = await isCatalogContract(ADDRESS, CHAIN_ID);

    expect(result).toBe(true);
  });

  it('returns false when bytecode does not match', async () => {
    vi.mocked(getContractBytecode).mockResolvedValue('0xdeadbeef' as any);

    const result = await isCatalogContract(ADDRESS, CHAIN_ID);

    expect(result).toBe(false);
  });

  it('returns false when bytecode is undefined', async () => {
    vi.mocked(getContractBytecode).mockResolvedValue(undefined);

    const result = await isCatalogContract(ADDRESS, CHAIN_ID);

    expect(result).toBe(false);
  });

  it('calls getContractBytecode with address and chainId', async () => {
    vi.mocked(getContractBytecode).mockResolvedValue(undefined);

    await isCatalogContract(ADDRESS, CHAIN_ID);

    expect(getContractBytecode).toHaveBeenCalledWith(ADDRESS, CHAIN_ID);
  });
});
