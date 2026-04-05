import { Address } from 'viem';
import getContractBytecode from './getContractBytecode';

const CATALOG_BYTECODE =
  '0x60806040527f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc54600090819081906001600160a01b0316368280378136915af43d82803e15604b573d90f35b3d90fdfea2646970667358221220ab69d2f60c92b7b69f5e8359dd00719c2e3a6035b1a1067f0d4acf31b9b8acc364736f6c63430008190033';

const isCatalogContract = async (
  address: Address,
  chainId: number
): Promise<boolean> => {
  const bytecode = await getContractBytecode(address, chainId);
  return bytecode === CATALOG_BYTECODE;
};

export default isCatalogContract;
