import { getPublicClient } from '@/lib/viem/publicClient';
import { MomentType, Moment, MomentSaleConfig } from '@/types/moment';
import { Address, maxUint256 } from 'viem';
import cr1155Abi from '@/lib/abi/cr1155Abi';

const getCatalogInfo = async (moment: Moment) => {
  const { tokenId, chainId, collectionAddress } = moment;
  const publicClient: any = getPublicClient(chainId);

  const results = await publicClient.multicall({
    contracts: [
      {
        address: collectionAddress,
        abi: cr1155Abi,
        functionName: 'tokenMintConfiguration',
        args: [tokenId],
      },
      {
        address: collectionAddress,
        abi: cr1155Abi,
        functionName: 'tokenPrice',
        args: [tokenId],
      },
      {
        address: collectionAddress,
        abi: cr1155Abi,
        functionName: 'uri',
        args: [tokenId],
      },
    ],
  });

  const mintConfig = results[0]?.result as
    | { pricePerToken: bigint; fundsRecipient: string }
    | undefined;
  const tokenPrice = results[1]?.result as bigint | undefined;
  const tokenUri = results[2]?.result as string | undefined;

  const pricePerToken = tokenPrice ?? mintConfig?.pricePerToken ?? BigInt(0);

  const saleConfig: MomentSaleConfig = {
    pricePerToken: pricePerToken.toString(),
    fundsRecipient: (mintConfig?.fundsRecipient ?? '0x0') as Address,
    saleStart: 0,
    saleEnd: Number(maxUint256.toString()),
    maxTokensPerAddress: Number(maxUint256.toString()),
    type: MomentType.Erc20Mint,
  };

  return {
    saleConfig,
    tokenUri: tokenUri ?? null,
  };
};

export default getCatalogInfo;
