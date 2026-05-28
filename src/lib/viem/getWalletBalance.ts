import { Address, createPublicClient, erc20Abi, http } from 'viem';
import getAlchemyRpcUrl from '@/lib/alchemy/getAlchemyRpcUrl';
import { USDC_ADDRESS } from '@/lib/consts';
import getViemNetwork from '@/lib/viem/getViemNetwork';
import { getPublicClient } from '@/lib/viem/publicClient';

const getWalletBalance = async (
  address: Address,
  chainId: number
): Promise<{ ethBalance: bigint; usdcBalance: bigint }> => {
  const batchedClient = createPublicClient({
    chain: getViemNetwork(chainId) as any,
    transport: http(getAlchemyRpcUrl(chainId), {
      batch: {
        wait: 0,
      },
    }),
  });

  const publicClient = getPublicClient(chainId);

  const [ethBalance, erc20BalanceResults] = await Promise.all([
    batchedClient.getBalance({ address }),
    publicClient.multicall({
      contracts: [
        {
          address: USDC_ADDRESS[chainId],
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address],
        },
      ],
    }),
  ]);

  return {
    ethBalance,
    usdcBalance: (erc20BalanceResults[0]?.result as bigint) || BigInt(0),
  };
};

export default getWalletBalance;
