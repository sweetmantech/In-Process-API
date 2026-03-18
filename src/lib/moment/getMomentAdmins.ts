import { Address } from 'viem';
import selectAdmins from '@/lib/supabase/in_process_admins/selectAdmins';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import getPermission from '@/lib/zora/getPermission';

const getMomentAdmins = async ({
  collection,
  owner,
  moment,
}: {
  collection: { id: string } | null;
  owner: string;
  moment: { collectionAddress: Address; tokenId: string; chainId: number };
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
  } else {
    const smartAccount = await getOrCreateSmartWallet({
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
