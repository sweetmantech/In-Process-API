import { Hash } from 'viem';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
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
  artistAddress,
}: UpdateCollectionURIInput): Promise<UpdateCollectionURIResult> {
  const smartAccount = await getOrCreateSmartWallet({
    address: artistAddress,
  });

  const updateCollectionURICall = getUpdateCollectionURICall(
    collection,
    newUri,
    newCollectionName
  );

  const network = collection.chainId === 84532 ? 'base-sepolia' : 'base';

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
