import { zoraCreator1155ImplABI } from '@zoralabs/protocol-deployments';
import { getPublicClient } from '@/lib/viem/publicClient';
import { Moment } from '@/types/moment';

const getInProcessSoldOut = async (moment: Moment): Promise<boolean> => {
  const { collectionAddress, tokenId, chainId } = moment;
  const publicClient: any = getPublicClient(chainId);
  try {
    const info = await publicClient.readContract({
      address: collectionAddress,
      abi: zoraCreator1155ImplABI,
      functionName: 'getTokenInfo',
      args: [BigInt(tokenId)],
    });
    return info.maxSupply > BigInt(0) && info.maxSupply === info.totalMinted;
  } catch {
    return false;
  }
};

export default getInProcessSoldOut;
