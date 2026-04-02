import { Hash } from 'viem';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import {
  UpdateCollectionURIInput,
  UpdateCollectionURIResult,
} from '@/types/collections';
import getUpdateCollectionURICall from '../viem/getUpdateCollectionURICall';
import triggerMuxMigration from '@/lib/trigger.dev/triggerMuxMigration';
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

  // Send the transaction and wait for receipt using the helper
  const network = collection.chainId === 84532 ? 'base-sepolia' : 'base';

  const transaction = await sendUserOperation({
    smartAccount,
    network,
    calls: [updateCollectionURICall],
  });

  await triggerMuxMigration({
    uri: newUri,
    collectionAddress: collection.address,
    artistAddress,
  });

  return {
    hash: transaction.transactionHash as Hash,
    chainId: collection.chainId,
  };
}
