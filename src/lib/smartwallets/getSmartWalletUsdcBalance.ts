import { erc20Abi, type Address } from 'viem';
import { getPublicClient } from '@/lib/viem/publicClient';
import { CHAIN_ID, USDC_ADDRESS } from '@/lib/consts';

const getSmartWalletUsdcBalance = (
  smartWalletAddress: Address
): Promise<bigint> =>
  getPublicClient(CHAIN_ID).readContract({
    address: USDC_ADDRESS[CHAIN_ID],
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [smartWalletAddress],
  });

export default getSmartWalletUsdcBalance;
