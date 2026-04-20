import { getPublicClient } from '@/lib/viem/publicClient';
import { Moment } from '@/types/moment';
import zoraMediaAbi from '@/lib/abi/zoraMediaAbi';

const getZoraMediaInfo = async (moment: Moment) => {
  const { tokenId, chainId, collectionAddress } = moment;
  const publicClient: any = getPublicClient(chainId);

  const results = await publicClient.multicall({
    contracts: [
      {
        address: collectionAddress,
        abi: zoraMediaAbi,
        functionName: 'ownerOf',
        args: [tokenId],
      },
      {
        address: collectionAddress,
        abi: zoraMediaAbi,
        functionName: 'tokenMetadataURI',
        args: [tokenId],
      },
      {
        address: collectionAddress,
        abi: zoraMediaAbi,
        functionName: 'tokenURI',
        args: [tokenId],
      },
    ],
  });

  const owner = results[0]?.result as string | undefined;
  const metadataUri = results[1]?.result as string | undefined;
  const contentUri = results[2]?.result as string | undefined;

  return {
    owner: owner ?? null,
    tokenUri: metadataUri || null,
    contentUri: contentUri || null,
  };
};

export default getZoraMediaInfo;
