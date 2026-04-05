import { Address } from 'viem';
import getContractBytecode from './getContractBytecode';

const SOUND_BYTECODE =
  '0x363d3d373d3d3d363d73000000000053c8b49473bda4b8d1dc47cab411cc5af43d82803e903d91602b57fd5bf3';

const isSoundContract = async (
  address: Address,
  chainId: number
): Promise<boolean> => {
  const bytecode = await getContractBytecode(address, chainId);
  return bytecode === SOUND_BYTECODE;
};

export default isSoundContract;
