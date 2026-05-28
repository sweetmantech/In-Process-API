import { Address, Hash } from 'viem';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getOperationalSmartWallet } from '@/lib/smartwallets/getOperationalSmartWallet';
import getUpdateTokenURICall from '@/lib/viem/getUpdateTokenURICall';
import { UpdateMomentURIInput, UpdateMomentURIResult } from '@/types/moment';
import getUpdateCollectionCall from './getUpdateCollectionCall';
import { baseSepolia } from 'viem/chains';

export async function updateMomentURI({
  moment,
  newUri,
  newCollectionAddress,
  artist,
}: UpdateMomentURIInput): Promise<UpdateMomentURIResult> {
  const smartAccount = await getOperationalSmartWallet({ artist, moment });

  const network = moment.chainId === baseSepolia.id ? 'base-sepolia' : 'base';

  let resetUri = newUri;
  let contractAddress: Address = moment.collectionAddress as Address;
  let tokenId = moment.tokenId;
  const extraCalls: { to: Address; data: `0x${string}` }[] = [];

  if (newCollectionAddress) {
    const result = await getUpdateCollectionCall({
      moment,
      contract: { uri: newUri, address: newCollectionAddress },
      artistAddress: artist.primaryWallet,
    });

    extraCalls.push(result.call);
    resetUri = result.resetUri;
    contractAddress = result.contractAddress;
    tokenId = result.tokenId;
  }

  const { to: updateTo, data: updateData } = getUpdateTokenURICall(
    moment,
    resetUri
  );
  const transaction = await sendUserOperation({
    smartAccount,
    network,
    calls: [...extraCalls, { to: updateTo, data: updateData }],
  });

  return {
    hash: transaction.transactionHash as Hash,
    contractAddress,
    tokenId,
    chainId: moment.chainId,
  };
}
