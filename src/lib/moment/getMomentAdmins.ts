import { Address } from 'viem';
import selectAdmins from '@/lib/supabase/in_process_admins/selectAdmins';
import { getWalletSmartAccount } from '@/lib/coinbase/getWalletSmartAccount';
import getPermission from '@/lib/zora/getPermission';

const getMomentAdmins = async ({
  collection,
  owner,
  moment,
  protocol,
}: {
  collection: { id: string } | null;
  owner: string | null;
  moment: { collectionAddress: Address; tokenId: string; chainId: number };
  protocol: string | null;
}): Promise<Address[]> => {
  let adminAddresses: Address[] = [];

  if (collection) {
    const admins = await selectAdmins({
      moments: [
        {
          collectionId: collection.id,
          token_id: Number(moment.tokenId),
        },
      ],
    });
    adminAddresses = admins.map((admin) => admin.artist_address as Address);
  } else if (owner && protocol === 'in_process') {
    const smartAccount = await getWalletSmartAccount({
      address: owner as Address,
    });
    const permission = await getPermission(
      moment.collectionAddress,
      smartAccount.address,
      moment.chainId
    );
    if (permission) {
      adminAddresses.push(smartAccount.address.toLowerCase() as Address);
    }
    adminAddresses.push(owner.toLowerCase() as Address);
  }

  return Array.from(new Set(adminAddresses)).sort((b, a) => b.localeCompare(a));
};

export default getMomentAdmins;
