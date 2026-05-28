import { EvmSmartAccount } from '@coinbase/cdp-sdk';

export type Currency = 'eth' | 'usdc';

export interface WalletBalance {
  usdcBalance: bigint;
  ethBalance: bigint;
  smartAccount: EvmSmartAccount;
  address: string;
}
