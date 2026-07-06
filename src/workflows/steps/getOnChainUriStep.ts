import { Address } from 'viem';
import getInProcessMomentInfo from '@/lib/viem/getInProcessMomentInfo';

export default async function getOnChainUriStep(moment: {
  collectionAddress: Address;
  tokenId: string;
  chainId: number;
}): Promise<string> {
  'use step';
  const { tokenUri } = await getInProcessMomentInfo(moment);
  return tokenUri;
}
