import { Address } from 'viem';
import { NOUNS_GOVERNOR_ADDRESS } from '@/lib/consts';

export function getNounsGovernorAddress(chainId: number): Address {
  const address = NOUNS_GOVERNOR_ADDRESS[chainId];
  if (!address) {
    throw new Error(`Nouns governor not supported for chainId ${chainId}`);
  }
  return address;
}
