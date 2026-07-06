import { zoraCreator1155ImplABI } from '@zoralabs/protocol-deployments';
import { getPublicClient } from '@/lib/viem/publicClient';
import { Moment } from '@/types/moment';

const getInProcessMomentUri = async (moment: Moment): Promise<string> => {
  const { collectionAddress, tokenId, chainId } = moment;
  const publicClient: any = getPublicClient(chainId);
  return publicClient.readContract({
    address: collectionAddress,
    abi: zoraCreator1155ImplABI,
    functionName: 'uri',
    args: [BigInt(tokenId)],
  });
};

export default getInProcessMomentUri;
