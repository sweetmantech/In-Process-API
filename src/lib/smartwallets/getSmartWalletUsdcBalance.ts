import { erc20Abi, type Address } from 'viem';
import { getPublicClient } from '@/lib/viem/publicClient';
import { USDC_ADDRESS } from '@/lib/consts';
import { base } from 'viem/chains';

const BASE_CHAIN_ID = base.id;

const getSmartWalletUsdcBalance = (
  smartWalletAddress: Address
): Promise<bigint> =>
  getPublicClient(BASE_CHAIN_ID).readContract({
    address: USDC_ADDRESS[BASE_CHAIN_ID],
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [smartWalletAddress],
  });

export default getSmartWalletUsdcBalance;
