import { Address, getAddress } from 'viem';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { sendUserOperation } from '../coinbase/sendUserOperation';
import getAddPermissionCall from '../viem/getAddPermissionCall';
import { CHAIN_ID, IS_TESTNET } from '../consts';
import selectCollections from '../supabase/in_process_collections/selectCollections';
import selectAdmins from '../supabase/in_process_admins/selectAdmins';

const migrateMoments = async ({
  socialWallet,
  artistWallet,
}: {
  socialWallet: {
    address: Address;
    smartAccount: EvmSmartAccount;
  };
  artistWallet: {
    address: Address;
    smartWalletAddress: Address;
  };
}) => {
  try {
    const collections = await selectCollections({
      artist: socialWallet.address,
      chainId: CHAIN_ID,
    });
    if (!collections?.length) return;

    const admins = await selectAdmins({
      collectionIds: collections.map((collection) => collection.id),
    });
    const adminsByCollection = admins.reduce<
      Map<string, Array<{ artist_address: string }>>
    >((map, admin) => {
      const list = map.get(admin.collection) ?? [];
      list.push({ artist_address: admin.artist_address });
      map.set(admin.collection, list);
      return map;
    }, new Map());

    const network = IS_TESTNET ? 'base-sepolia' : 'base';
    const smartAccount = socialWallet.smartAccount;

    const calls: Array<{ to: Address; data: `0x${string}` }> = [];

    const filtered = collections.filter((collection) => {
      const collectionAdmins = adminsByCollection.get(collection.id) ?? [];
      return (
        collectionAdmins.some(
          (admin) =>
            admin.artist_address.toLowerCase() ===
            smartAccount.address.toLowerCase()
        ) &&
        !collectionAdmins.some(
          (admin) =>
            admin.artist_address.toLowerCase() ===
            artistWallet.smartWalletAddress.toLowerCase()
        ) &&
        !collectionAdmins.some(
          (admin) =>
            admin.artist_address.toLowerCase() ===
            artistWallet.address.toLowerCase()
        )
      );
    });

    if (!filtered.length) return;

    for (const collection of filtered) {
      const collectionAddress = getAddress(collection.address);
      const addPermissionCall = getAddPermissionCall(
        { collectionAddress, tokenId: '0', chainId: CHAIN_ID },
        artistWallet.address
      );
      const addSmartAccountPermissionCall = getAddPermissionCall(
        { collectionAddress, tokenId: '0', chainId: CHAIN_ID },
        artistWallet.smartWalletAddress
      );
      calls.push(addPermissionCall, addSmartAccountPermissionCall);
    }

    const transaction = await sendUserOperation({
      smartAccount,
      network,
      calls,
    });

    console.log(
      `✅ migrated moments from social wallet to artist wallet: ${transaction.transactionHash}`
    );
  } catch (error) {
    console.error(`❌ migrateMoments: ${error}`);
    throw new Error(`❌ migrateMoments: ${error}`);
  }
};

export default migrateMoments;
