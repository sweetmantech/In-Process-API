import { Address, encodeFunctionData } from 'viem';
import { zoraCreator1155FactoryImplABI, zoraCreator1155ImplABI } from '@zoralabs/protocol-deployments';
import { OPEN_EDITION_MINT_SIZE } from '@/lib/protocolSdk/constants';
import { ROYALTY_BPS_DEFAULT } from '@/lib/consts';
import { getFactoryAddress } from '@/lib/protocolSdk/create/factory-addresses';

export function getInProcessFactoryCalldata({
  chainId,
  collectionUri,
  collectionName,
  tokenUri,
  maxSupply,
  account,
}: {
  chainId: number;
  collectionUri: string;
  collectionName: string;
  tokenUri: string;
  maxSupply: number;
  account: Address;
}): { to: Address; data: `0x${string}`; value: string } {
  const maxSupplyBigInt = maxSupply === 0 ? OPEN_EDITION_MINT_SIZE : BigInt(maxSupply);

  const setupNewToken = encodeFunctionData({
    abi: zoraCreator1155ImplABI,
    functionName: 'setupNewToken',
    args: [tokenUri, maxSupplyBigInt],
  });

  const data = encodeFunctionData({
    abi: zoraCreator1155FactoryImplABI,
    functionName: 'createContract',
    args: [
      collectionUri,
      collectionName,
      {
        royaltyMintSchedule: 0,
        royaltyBPS: ROYALTY_BPS_DEFAULT,
        royaltyRecipient: account,
      },
      account,
      [setupNewToken],
    ],
  });

  return {
    to: getFactoryAddress(chainId),
    data,
    value: '0',
  };
}
