import { Address, Hex } from 'viem';
import { SplitRecipient } from '@0xsplits/splits-sdk';
import { addPermissionCall } from '@/lib/zora/addPermissionCall';
import { getSplitAdminAddresses } from '@/lib/splits/getSplitAdminAddresses';

const buildAdditionalSetupActions = async ({
  resolvedSplits,
  smartAccountAddress,
  hasExistingContract,
}: {
  resolvedSplits: SplitRecipient[];
  smartAccountAddress: Address;
  hasExistingContract: boolean;
}): Promise<((args: { tokenId: bigint }) => Hex[]) | undefined> => {
  if (resolvedSplits.length === 0 && hasExistingContract) return undefined;

  const otherAddresses: Address[] = [];
  if (resolvedSplits.length > 0) {
    const { addresses, smartWallets } =
      await getSplitAdminAddresses(resolvedSplits);
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

export default buildAdditionalSetupActions;
