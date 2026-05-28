import type { Address } from 'viem';
import type { WalletType } from '@/types/wallets';

export interface ArtistWallet {
  address: Address;
  type: WalletType;
}

export interface ArtistContext {
  artistId: string;
  primaryWallet: Address;
  wallets: ArtistWallet[];
}
