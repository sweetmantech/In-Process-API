import type { ArtistContext } from '@/types/artist';
import { Hash } from 'viem';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getOperationalSmartWallet } from '@/lib/smartwallets/getOperationalSmartWallet';
import {
  UpdateCollectionURIInput,
  UpdateCollectionURIResult,
} from '@/types/collections';
import getUpdateCollectionURICall from '../viem/getUpdateCollectionURICall';
/**
 * Updates collection URI using a smart account via Coinbase CDP.
 * Handles the transaction on the backend side.
 */
export async function updateCollectionURI({
  collection,
  newUri,
  newCollectionName,
  artist,
}: UpdateCollectionURIInput): Promise<UpdateCollectionURIResult> {
  const smartAccount = await getOperationalSmartWallet({
    artist,
    moment: {
      collectionAddress: collection.address,
      chainId: collection.chainId,
      tokenId: '0',
    },
  });

  console.log('smartAccount', smartAccount);
  const updateCollectionURICall = getUpdateCollectionURICall(
    collection,
    newUri,
    newCollectionName
  );

  console.log('updateCollectionURICall', updateCollectionURICall);
  const network = collection.chainId === 84532 ? 'base-sepolia' : 'base';

  console.log('network', network);

  const transaction = await sendUserOperation({
    smartAccount,
    network,
    calls: [updateCollectionURICall],
  });

  return {
    hash: transaction.transactionHash as Hash,
    chainId: collection.chainId,
  };
}
