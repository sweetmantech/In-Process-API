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
  console.log('[updateMomentURI] input', { moment, newUri, newCollectionAddress, artistAddress });

  const smartAccount = await getOrCreateSmartWallet({ address: artistAddress });
  console.log('[updateMomentURI] smartAccount', smartAccount.address);

  const network = moment.chainId === baseSepolia.id ? 'base-sepolia' : 'base';

  let updateUri = newUri;
  let contractAddress: Address = moment.collectionAddress as Address;
  let tokenId = moment.tokenId;
  const extraCalls: { to: Address; data: `0x${string}` }[] = [];

  if (newCollectionAddress) {
    const result = await getUpdateCollectionCall({
      moment,
      contract: { uri: newUri, address: newCollectionAddress },
      artistAddress,
    });
    console.log('[updateMomentURI] getUpdateCollectionCall result', result);

    extraCalls.push(result.call);
    updateUri = result.redirectUri;
    contractAddress = result.contractAddress;
    tokenId = result.tokenId;
  }

  console.log('[updateMomentURI] calls', [...extraCalls, { to: moment.collectionAddress, data: '...' }]);

  const { to: updateTo, data: updateData } = getUpdateTokenURICall(moment, updateUri);
  const transaction = await sendUserOperation({
    smartAccount,
    network,
    calls: [...extraCalls, { to: updateTo, data: updateData }],
  });
  console.log('[updateMomentURI] transaction', transaction.transactionHash);

  return {
    hash: transaction.transactionHash as Hash,
    contractAddress,
    tokenId,
    chainId: moment.chainId,
  };
}
