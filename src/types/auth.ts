import { Address } from 'viem';

export enum AuthMethod {
  Farcaster = 'farcaster',
  Privy = 'privy',
  ApiKey = 'apiKey',
}
export interface AuthResult {
  primaryWallet: Address;
  wallets: Address[];
  artistId: string;
  authMethod: AuthMethod;
  isWebRequest?: boolean;
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
