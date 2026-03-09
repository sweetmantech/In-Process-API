import {
  Address,
  erc20Abi,
  encodeFunctionData,
  formatUnits,
  zeroAddress,
  type Hash,
  type OneOf,
} from 'viem';
import { NextResponse } from 'next/server';
import { Call } from '@coinbase/coinbase-sdk/dist/types/calls';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import {
  CATALOG_MINT_CONTROLLER,
  CHAIN_ID,
  IS_TESTNET,
  USDC_ADDRESS,
} from '@/lib/consts';
import getAllowance from '@/lib/viem/getAllowance';
import getCatalogTokenPrice from '@/lib/viem/getCatalogTokenPrice';
import getUsdcBalance from '@/lib/balance/getUsdcBalance';
import { z } from 'zod';
import { catalogCollectSchema } from '@/lib/schema/catalogCollectSchema';
import cr1155Abi from '@/lib/abi/cr1155Abi';

type CatalogCollectInput = z.infer<typeof catalogCollectSchema> & {
  artistAddress: string;
};

const collectCatalogMomentHandler = async ({
  artistAddress,
  moment,
  amount,
  recipient,
  ref0,
  ref1,
}: CatalogCollectInput): Promise<NextResponse> => {
  const { collectionAddress, tokenId } = moment;
  const to = (recipient ?? artistAddress) as Address;

  const smartAccount = await getOrCreateSmartWallet({
    address: artistAddress as Address,
  });

  const pricePerToken = await getCatalogTokenPrice(collectionAddress, tokenId);

  const totalPrice = pricePerToken * BigInt(amount);
  const totalPriceFormatted = Number(formatUnits(totalPrice, 6));

  const balance = await getUsdcBalance(smartAccount.address as Address);
  if (totalPriceFormatted > Number(balance)) {
    throw new Error('Insufficient USDC balance');
  }

  const calls: object[] = [];

  const allowance = await getAllowance(
    smartAccount.address as Address,
    CATALOG_MINT_CONTROLLER
  );
  if (Number(allowance) < totalPriceFormatted) {
    calls.push({
      to: USDC_ADDRESS[CHAIN_ID],
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [CATALOG_MINT_CONTROLLER, totalPrice],
      }),
    });
  }

  calls.push({
    to: collectionAddress,
    data: encodeFunctionData({
      abi: cr1155Abi,
      functionName: 'purchaseTokenWithValue',
      args: [
        to as Address,
        BigInt(tokenId),
        BigInt(amount),
        totalPrice,
        ref0 ?? zeroAddress,
        ref1 ?? zeroAddress,
      ],
    }),
  });

  const transaction = await sendUserOperation({
    smartAccount,
    network: IS_TESTNET ? 'base-sepolia' : 'base',
    calls: calls as OneOf<Call<unknown, { [key: string]: unknown }>>[],
  });

  return NextResponse.json({
    hash: transaction.transactionHash as Hash,
    chainId: CHAIN_ID,
  });
};

export default collectCatalogMomentHandler;
