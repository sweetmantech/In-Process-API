import type { Address } from 'viem';

export interface ArtistContext {
  artistId: string;
  primaryWallet: Address;
  wallets: Address[];
}
