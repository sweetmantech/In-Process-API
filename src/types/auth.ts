import { Address } from 'viem';
import { WalletType } from '@/types/wallets';

export enum AuthMethod {
  Farcaster = 'farcaster',
  Privy = 'privy',
  ApiKey = 'apiKey',
}

export interface AuthWallet {
  address: Address;
  type: WalletType;
}

export interface AuthResult {
  primaryWallet: Address;
  wallets: AuthWallet[];
  artistId: string;
  authMethod: AuthMethod;
}

export type PrivyPasswordlessAuthenticateResult = {
  token: string;
  refresh_token?: string;
  user?: {
    id: string;
    linked_accounts?: Array<{
      wallet_client_type?: string;
      address?: string;
    }>;
  };
  is_new_user?: boolean;
  message?: string;
  error?: string;
};
