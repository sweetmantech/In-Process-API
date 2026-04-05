import { getPublicClient } from '@/lib/viem/publicClient';
import { Moment } from '@/types/moment';
import cr1155Abi from '@/lib/abi/cr1155Abi';

const getCatalogInfo = async (moment: Moment) => {
  const { tokenId, chainId, collectionAddress } = moment;
  const publicClient: any = getPublicClient(chainId);

  const results = await publicClient.multicall({
    contracts: [
      {
        address: collectionAddress,
        abi: cr1155Abi,
        functionName: 'tokenInfo',
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

  const tokenData = results[0]?.result as
    | {
        artist: string;
        contentHash: string;
        uri: { arweave: string; regular: string };
      }
    | undefined;
  const tokenUri = results[1]?.result as string | undefined;

  return {
    owner: tokenData?.artist ?? null,
    tokenUri: tokenUri ?? null,
  };
};

export default getCatalogInfo;
