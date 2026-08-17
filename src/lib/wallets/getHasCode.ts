import type { Address } from 'viem';
import { getPublicClient } from '@/lib/viem/publicClient';

const getHasCode = async (chainId: number, address: Address) => {
  try {
    const bytecode = await getPublicClient(chainId).getCode({ address });
    return Boolean(bytecode && bytecode !== '0x');
  } catch {
    return null;
  }
};

export default getHasCode;
