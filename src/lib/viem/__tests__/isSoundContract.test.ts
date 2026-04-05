import { describe, it, expect, vi } from 'vitest';
import { Address } from 'viem';

vi.mock('@/lib/viem/getContractBytecode', () => ({
  default: vi.fn(),
}));

import getContractBytecode from '@/lib/viem/getContractBytecode';
import isSoundContract from '@/lib/viem/isSoundContract';

const ADDRESS = '0x0000000000000000000000000000000000000001' as Address;
const CHAIN_ID = 8453;
const SOUND_BYTECODE =
  '0x363d3d373d3d3d363d73000000000053c8b49473bda4b8d1dc47cab411cc5af43d82803e903d91602b57fd5bf3';

describe('isSoundContract', () => {
  it('returns true when bytecode matches Sound bytecode', async () => {
    vi.mocked(getContractBytecode).mockResolvedValue(SOUND_BYTECODE as any);

    const result = await isSoundContract(ADDRESS, CHAIN_ID);

    expect(result).toBe(true);
  });

  it('returns false when bytecode does not match', async () => {
    vi.mocked(getContractBytecode).mockResolvedValue('0xdeadbeef' as any);

    const result = await isSoundContract(ADDRESS, CHAIN_ID);

    expect(result).toBe(false);
  });

  it('returns false when bytecode is undefined', async () => {
    vi.mocked(getContractBytecode).mockResolvedValue(undefined);

    const result = await isSoundContract(ADDRESS, CHAIN_ID);

    expect(result).toBe(false);
  });

  it('calls getContractBytecode with address and chainId', async () => {
    vi.mocked(getContractBytecode).mockResolvedValue(undefined);

    await isSoundContract(ADDRESS, CHAIN_ID);

    expect(getContractBytecode).toHaveBeenCalledWith(ADDRESS, CHAIN_ID);
  });
});
