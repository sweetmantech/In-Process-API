import { Address, encodeFunctionData } from 'viem';
import { MomentType, Moment } from '@/types/moment';
import { SaleConfig } from '@/types/sale';
import {
  erc20MinterAddresses,
  zoraCreatorFixedPriceSaleStrategyAddress,
} from '@/lib/protocolSdk/constants';
import {
  erc20MinterABI,
  zoraCreator1155ImplABI,
  zoraCreatorFixedPriceSaleStrategyABI,
} from '@zoralabs/protocol-deployments';

const getUpdateSaleCall = (
  moment: Moment,
  type: MomentType,
  newSale: SaleConfig
) => {
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

  return {
    to: moment.collectionAddress,
    data: encodeFunctionData({
      abi: zoraCreator1155ImplABI,
      functionName: 'callSale',
      args: [
        BigInt(moment.tokenId),
        strategyAddress as Address,
        setSaleCalldata,
      ],
    }),
  };
};

export default getUpdateSaleCall;
