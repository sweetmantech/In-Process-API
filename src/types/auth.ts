export enum AuthMethod {
  Farcaster = 'farcaster',
  Privy = 'privy',
  ApiKey = 'apiKey',
}
export interface AuthResult {
  artistAddress: string;
  /** Privy embedded wallet from linked_accounts; only set for bearer-token auth */
  socialWallet?: string;
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
