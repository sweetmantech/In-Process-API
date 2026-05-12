import { Address, Hex } from 'viem';
import { SplitRecipient } from '@0xsplits/splits-sdk';
import { addPermissionCall } from '@/lib/zora/addPermissionCall';
import { getSplitAdminAddresses } from '@/lib/splits/getSplitAdminAddresses';

const buildPermissionSetupActions = async ({
  splits,
  smartAccountAddress,
}: {
  splits: SplitRecipient[];
  smartAccountAddress: Address;
}): Promise<(args: { tokenId: bigint }) => Hex[]> => {
  const otherAddresses: Address[] = [];
  if (splits.length > 0) {
    const { addresses, smartWallets } = await getSplitAdminAddresses(splits);
    otherAddresses.push(...addresses, ...smartWallets);
  }

  return ({ tokenId }: { tokenId: bigint }) => {
    const actions: Hex[] = [];
    actions.push(addPermissionCall(smartAccountAddress, BigInt(0)));
    for (const address of otherAddresses) {
      actions.push(addPermissionCall(address, tokenId));
    }
    return actions;
  };
};

export default buildPermissionSetupActions;
