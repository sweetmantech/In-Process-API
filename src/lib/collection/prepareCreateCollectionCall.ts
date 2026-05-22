import { Address, encodeFunctionData, getAddress } from 'viem';
import { CHAIN_ID, ROYALTY_BPS_DEFAULT } from '@/lib/consts';
import { CollectionItem } from '@/lib/schema/createCollectionsSchema';
import { zoraCreator1155FactoryImplABI } from '@zoralabs/protocol-deployments';
import { getFactoryAddress } from '@/lib/protocolSdk/create/factory-addresses';
import { makeContractParameters } from '@/lib/protocolSdk/utils';
import { processSplits } from '@/lib/splits/processSplits';
import { normalizeSplitRecipients } from '@/lib/splits/normalizeSplitRecipients';
import { addPermissionCall } from '../zora/addPermissionCall';

const prepareCreateCollectionCall = async (
  item: CollectionItem,
  smartAccount: any,
  accountAddress: Address
) => {
  const resolvedSplits = await normalizeSplitRecipients(item.splits || []);

  let royaltyRecipient: Address = accountAddress;
  if (resolvedSplits && resolvedSplits.length >= 2) {
    const result = await processSplits(resolvedSplits, smartAccount);
    if (result.splitAddress) {
      royaltyRecipient = getAddress(result.splitAddress);
    }
  }

  const parameters = makeContractParameters({
    abi: zoraCreator1155FactoryImplABI,
    functionName: 'createContract',
    account: smartAccount.address,
    address: getFactoryAddress(CHAIN_ID),
    args: [
      item.uri,
      item.name,
      {
        royaltyMintSchedule: 0,
        royaltyBPS: ROYALTY_BPS_DEFAULT,
        royaltyRecipient,
      },
      accountAddress,
      [addPermissionCall(smartAccount.address, BigInt(0))],
    ],
  });

  const data = encodeFunctionData({
    abi: parameters.abi,
    functionName: 'createContract',
    args: parameters.args,
  });

  return { to: parameters.address, data };
};

export default prepareCreateCollectionCall;
