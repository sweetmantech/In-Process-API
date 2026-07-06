import { Address } from 'viem';
import getInProcessMomentUri from '@/lib/viem/getInProcessMomentUri';

export default async function getOnChainUriStep(moment: {
  collectionAddress: Address;
  tokenId: string;
  chainId: number;
}): Promise<string> {
  'use step';
  return getInProcessMomentUri(moment);
}
