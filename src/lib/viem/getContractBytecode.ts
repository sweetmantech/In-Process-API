import { getPublicClient } from './publicClient';
import { Address } from 'viem';

const getContractBytecode = async (address: Address, chainId: number) => {
  const publicClient = getPublicClient(chainId);
  return publicClient.getCode({ address });
};

export default getContractBytecode;
