import { getPublicClient } from '@/lib/viem/publicClient';
import { Moment } from '@/types/moment';
import soundAbi from '@/lib/abi/soundAbi';
import soundMetadataAbi from '@/lib/abi/soundMetadataAbi';
import { SOUND_METADATA_ADDRESS } from '@/lib/consts';

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
        address: SOUND_METADATA_ADDRESS,
        abi: soundMetadataAbi,
        functionName: 'baseURI',
        args: [collectionAddress, tokenId],
      },
      {
        address: collectionAddress,
        abi: soundAbi,
        functionName: 'baseURI',
      },
    ],
  });

  const owner = results[0]?.result as string | undefined;
  const tierBaseUri = results[1]?.result as string | undefined;
  const editionBaseUri = results[2]?.result as string | undefined;

  const baseUri = tierBaseUri || editionBaseUri;
  const tokenUri = baseUri ? `${baseUri}${tokenId}` : null;

  return {
    owner: owner ?? null,
    tokenUri,
  };
};

export default getSoundInfo;
