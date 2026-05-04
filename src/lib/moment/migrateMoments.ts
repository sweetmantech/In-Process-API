import { Address, getAddress } from 'viem';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { sendUserOperation } from '../coinbase/sendUserOperation';
import getAddPermissionCall from '../viem/getAddPermissionCall';
import { CHAIN_ID, IS_TESTNET } from '../consts';
import selectCollections from '../supabase/in_process_collections/selectCollections';

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
    const { data: collections, error: collectionsError } =
      await selectCollections({
        artists: [socialWallet.address],
        chainId: CHAIN_ID,
      });
    if (!collections || collectionsError) return;

    const network = IS_TESTNET ? 'base-sepolia' : 'base';
    const smartAccount = socialWallet.smartAccount;

    const calls: Array<{ to: Address; data: `0x${string}` }> = [];

    const filtered = collections.filter(
      (collection) =>
        collection.admins.some(
          (admin) =>
            admin.artist_address.toLowerCase() ===
            smartAccount.address.toLowerCase()
        ) &&
        !collection.admins.some(
          (admin) =>
            admin.artist_address.toLowerCase() ===
            artistWallet.smartWalletAddress.toLowerCase()
        ) &&
        !collection.admins.some(
          (admin) =>
            admin.artist_address.toLowerCase() ===
            artistWallet.address.toLowerCase()
        )
    );

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
