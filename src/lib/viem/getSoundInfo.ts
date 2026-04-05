import { getPublicClient } from '@/lib/viem/publicClient';
import { Moment } from '@/types/moment';
import soundAbi from '@/lib/abi/soundAbi';

const getSoundInfo = async (moment: Moment) => {
  const { tokenId, chainId, collectionAddress } = moment;
  const publicClient: any = getPublicClient(chainId);

  const results = await publicClient.multicall({
    contracts: [
      {
        address: collectionAddress,
        abi: soundAbi,
        functionName: 'owner',
      },
      {
        address: collectionAddress,
        abi: soundAbi,
        functionName: 'tokenURI',
        args: [tokenId],
      },
    ],
  });

  const owner = results[0]?.result as string | undefined;
  const tokenUri = results[1]?.result as string | undefined;

  return {
    owner: (owner ?? collectionAddress) as string,
    tokenUri: tokenUri ?? null,
  };
};

export default getSoundInfo;
