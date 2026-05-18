import { Address, keccak256 } from 'viem';
import { getPublicClient } from './publicClient';

const ZORA_1155_PROXY_CODEHASH =
  '0x92d803b0b727b7c6b76468b2ba093a986d03acede4ce3f77971429c0d6ea2a06';

const isZora1155Impl = async (
  address: Address,
  chainId: number
): Promise<boolean> => {
  const bytecode = await getPublicClient(chainId).getBytecode({ address });
  if (!bytecode) return false;
  return keccak256(bytecode) === ZORA_1155_PROXY_CODEHASH;
};

export default isZora1155Impl;
