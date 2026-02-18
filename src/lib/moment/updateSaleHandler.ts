import { NextResponse } from 'next/server';
import { Address, encodeFunctionData } from 'viem';
import { MomentType, Moment } from '@/types/moment';
import getMomentOnChainInfo from '@/lib/viem/getMomentOnChainInfo';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { IS_TESTNET } from '@/lib/consts';
import {
  erc20MinterAddresses,
  zoraCreatorFixedPriceSaleStrategyAddress,
} from '@/lib/protocolSdk/constants';
import {
  erc20MinterABI,
  zoraCreator1155ImplABI,
  zoraCreatorFixedPriceSaleStrategyABI,
} from '@zoralabs/protocol-deployments';
import { baseSepolia } from 'viem/chains';

const updateSaleHandler = async (
  moment: Moment,
  callerAddress: string,
  pricePerToken?: string,
  saleStart?: string
) => {
  const { saleConfig } = await getMomentOnChainInfo(moment);

  if (!saleConfig) {
    return NextResponse.json(
      { message: 'Sale config not found' },
      { status: 404 }
    );
  }

  const { type, ...rawSale } = saleConfig;

  const saleStartDate = saleStart ? new Date(saleStart) : null;

  const newSale = {
    ...rawSale,
    saleStart: saleStartDate
      ? BigInt(Number(saleStartDate.getTime() / 1000).toFixed(0))
      : rawSale.saleStart,
    saleEnd: BigInt(rawSale.saleEnd),
    pricePerToken: pricePerToken
      ? BigInt(pricePerToken)
      : BigInt(rawSale.pricePerToken),
    maxTokensPerAddress: BigInt(rawSale.maxTokensPerAddress),
  };

  const isErc20 = type === MomentType.Erc20Mint;
  const strategyAddress = isErc20
    ? erc20MinterAddresses[moment.chainId as keyof typeof erc20MinterAddresses]
    : zoraCreatorFixedPriceSaleStrategyAddress[
        moment.chainId as keyof typeof zoraCreatorFixedPriceSaleStrategyAddress
      ];
  const strategyAbi = isErc20
    ? erc20MinterABI
    : zoraCreatorFixedPriceSaleStrategyABI;

  const setSaleCalldata = encodeFunctionData({
    abi: strategyAbi,
    functionName: 'setSale',
    args: [BigInt(moment.tokenId), newSale],
  });

  const callSaleData = encodeFunctionData({
    abi: zoraCreator1155ImplABI,
    functionName: 'callSale',
    args: [BigInt(moment.tokenId), strategyAddress as Address, setSaleCalldata],
  });

  const smartAccount = await getOrCreateSmartWallet({
    address: callerAddress as Address,
  });

  const transaction = await sendUserOperation({
    smartAccount,
    network: moment.chainId === baseSepolia.id ? 'base-sepolia' : 'base',
    calls: [{ to: moment.collectionAddress, data: callSaleData }],
  });

  return NextResponse.json({
    hash: transaction.transactionHash,
    chainId: moment.chainId,
  });
};

export default updateSaleHandler;
