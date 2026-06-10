import { Address } from 'viem';
import { base, baseSepolia, mainnet, sepolia } from 'viem/chains';

export const FACTORY_ADDRESSES: Record<number, Address> = {
  [base.id]: '0x540C18B7f99b3b599c6FeB99964498931c211858',
  [baseSepolia.id]: '0x6832A997D8616707C7b68721D6E9332E77da7F6C',
  [mainnet.id]: '0x2bf5EBEEb028D5F9E02F0F432Ebb1a192F5528F1',
  [sepolia.id]: '0xe0d3febE1c17DDA1086e89B638Ab54955FE2eF8a',
} as const;

export function getFactoryAddress(chainId: number): Address {
  const address = FACTORY_ADDRESSES[chainId];
  if (!address) {
    throw new Error(`No factory address configured for chain ${chainId}`);
  }
  return address;
}
