import { Address } from 'viem';
import { getPublicClient } from './publicClient';
import { CHAIN_ID } from '../consts';
import cr1155Abi from '@/lib/abi/cr1155Abi';

const getCatalogTokenPrice = async (
  collectionAddress: Address,
  tokenId: string
): Promise<bigint> => {
  const publicClient = getPublicClient(CHAIN_ID);
  return publicClient.readContract({
    address: collectionAddress,
    abi: cr1155Abi,
    functionName: 'tokenPrice',
    args: [BigInt(tokenId)],
  });
};

export default getCatalogTokenPrice;
