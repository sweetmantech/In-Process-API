import { Address } from 'viem';
import { mainnet } from 'viem/chains';
import { ZORA_MEDIA_ADDRESS } from '@/lib/consts';

const isZoraMediaContract = (address: Address, chainId: number): boolean => {
  if (chainId !== mainnet.id) return false;
  return address.toLowerCase() === ZORA_MEDIA_ADDRESS.toLowerCase();
};

export default isZoraMediaContract;
