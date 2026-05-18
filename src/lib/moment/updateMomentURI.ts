import { Address, Hash } from 'viem';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import getUpdateTokenURICall from '@/lib/viem/getUpdateTokenURICall';
import { UpdateMomentURIInput, UpdateMomentURIResult } from '@/types/moment';
import getUpdateCollectionCall from './getUpdateCollectionCall';
import { baseSepolia } from 'viem/chains';

export async function updateMomentURI({
  moment,
  newUri,
  newCollectionAddress,
  artistAddress,
}: UpdateMomentURIInput): Promise<UpdateMomentURIResult> {
  const smartAccount = await getOrCreateSmartWallet({ address: artistAddress });

  const network = moment.chainId === baseSepolia.id ? 'base-sepolia' : 'base';

  let resetUri = newUri;
  let contractAddress: Address = moment.collectionAddress as Address;
  let tokenId = moment.tokenId;
  const extraCalls: { to: Address; data: `0x${string}` }[] = [];

  if (newCollectionAddress) {
    const result = await getUpdateCollectionCall({
      moment,
      contract: { uri: newUri, address: newCollectionAddress },
      artistAddress,
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
