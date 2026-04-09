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

export const ARWEAVE_KEY = process.env.ARWEAVE_KEY
  ? JSON.parse(Buffer.from(process.env.ARWEAVE_KEY, 'base64').toString())
  : null;

export const ADMIN_ADDRESSES = [
  '0xaf1452d289e22fbd0dea9d5097353c72a90fac33',
  '0xcfbf34d385ea2d5eb947063b67ea226dcda3dc38',
  '0x7b753919b953b1021a33f55671716dc13c1eae08',
  '0x6e786fcfcb98da9df87ab0b7a2d64067c90daba9',
];

export const ARWEAVE_GATEWAY = 'https://ar-io.net';

export const CATALOG_MINT_CONTROLLER: Address =
  '0xbcEaBFcC30a0e050367A6A5FaEa247A43C314709';

export const SOUND_METADATA_ADDRESS: Address =
  '0x0000000000f5A96Dc85959cAeb0Cfe680f108FB5';

const INDEXER_ID = '87ca119';
export const GRPC_ENDPOINT = `https://indexer.hyperindex.xyz/${INDEXER_ID}/v1/graphql`;

export const BATCH_SIZE = 100;
export const PAGE_LIMIT = 1000;

export const INDEX_INTERVAL_MS = 1000;
export const INDEX_INTERVAL_EMPTY_MS = 1500;
