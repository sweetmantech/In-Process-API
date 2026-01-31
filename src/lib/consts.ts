import { baseSepolia, base } from 'viem/chains';
import { Address } from 'viem';

export const INPROCESS_GROUP_CHAT_ID = '-1002592953370';

export const IS_TESTNET =
  process.env.VERCEL_ENV === 'preview' ||
  process.env.VERCEL_ENV === 'development'
    ? true
    : false;

export const PRIVY_PROJECT_SECRET = process.env.PRIVY_PROJECT_SECRET as string;
// Coinbase
export const CDP_PAYMASTER_URL = `https://api.developer.coinbase.com/rpc/v1/base${IS_TESTNET ? '-sepolia' : ''}/${process.env.CDP_PAYMASTER_KEY}`;

// Wagmi
export const CHAIN = IS_TESTNET ? baseSepolia : base;
export const CHAIN_ID = CHAIN.id;
// Zora
export const REFERRAL_RECIPIENT = '0x749B7b7A6944d72266Be9500FC8C221B6A7554Ce';
export const ROYALTY_BPS_DEFAULT = 1000; // Default royalty bps (10%)

export const PERMISSION_BIT_ADMIN = 2;

export const USDC_ADDRESS: Record<number, Address> = {
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  [baseSepolia.id]: '0x14196F08a4Fa0B66B7331bC40dd6bCd8A1dEeA9F',
} as const;

export const SITE_ORIGINAL_URL = IS_TESTNET
  ? 'https://in-process-git-test-sweetmantechs-projects.vercel.app'
  : 'https://inprocess.world';

export const TELNYX_SECONDARY_PHONE_NUMBER = '+15135971101';
export const TELNYX_TOLL_FREE_PHONE_NUMBER = '+18885993909';
export const TELNYX_MESSAGING_PROFILE_ID =
  '40019b4c-b5af-4052-966b-3f7546c2e7c0';

export const ARWEAVE_KEY = JSON.parse(
  Buffer.from(process.env.ARWEAVE_KEY as string, 'base64').toString()
);

export const MOMENT_URL_REGEX =
  /https:\/\/inprocess\.world\/sms\/base:0x[a-fA-F0-9]+\/\d+/;
