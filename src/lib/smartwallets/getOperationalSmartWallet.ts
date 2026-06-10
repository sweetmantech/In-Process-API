import { Address } from 'viem';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { getWalletSmartAccount } from '@/lib/coinbase/getWalletSmartAccount';
import getPermission from '@/lib/zora/getPermission';
import { PERMISSION_BIT_ADMIN } from '@/lib/consts';
import type { ArtistContext } from '@/types/artist';

// Returns the smart account authorized to write to the given collection.
// Iterates all linked wallets (primary first) and returns the smart account
// whose on-chain admin permission matches the collection.
export const getOperationalSmartWallet = async ({
  artist,
  moment,
}: {
  artist: ArtistContext;
  moment: {
    collectionAddress: Address | undefined;
    tokenId: string;
    chainId: number;
  };
}): Promise<EvmSmartAccount> => {
  const { primaryWallet, wallets } = artist;
  const { chainId, collectionAddress } = moment;

  const orderedWallets = [
    primaryWallet,
    ...wallets
      .filter((w) => w.address.toLowerCase() !== primaryWallet.toLowerCase())
      .map((w) => w.address),
  ];

  for (const walletAddress of orderedWallets) {
    const smartAccount = await getWalletSmartAccount({
      address: walletAddress,
    });
    if (!collectionAddress) return smartAccount;

    const permission = await getPermission(
      collectionAddress,
      smartAccount.address as Address,
      chainId
    );
    if (
      (BigInt(permission || 0) & BigInt(PERMISSION_BIT_ADMIN)) !==
      BigInt(0)
    ) {
      return smartAccount;
    }
  }

  throw new Error(
    `No authorized smart wallet found for collection ${collectionAddress}`
  );
};
