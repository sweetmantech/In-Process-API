import { Address, OneOf } from 'viem';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { getCanonicalSmartAccount } from '@/lib/coinbase/getCanonicalSmartAccount';
import { getLegacySmartAccount } from '@/lib/coinbase/getLegacySmartAccount';
import getPermission from '@/lib/zora/getPermission';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { addPermissionCall } from '@/lib/zora/addPermissionCall';
import { IS_TESTNET, PERMISSION_BIT_ADMIN } from '@/lib/consts';
import { Call } from '@coinbase/coinbase-sdk/dist/types/calls';
import type { ArtistContext } from '@/types/artist';
import { Moment } from '@/types/moment';

// Returns the smart account authorized to write to the given collection.
//
// Fast path: canonical (artistId-based) account already has collection-level admin.
//
// Legacy path: finds the old wallet-based CDP account that has on-chain admin,
// grants the canonical account admin synchronously via that legacy account,
// then returns canonical so all future calls take the fast path.
export const getOperationalSmartWallet = async ({
  artist,
  moment,
}: {
  artist: ArtistContext;
  moment: Moment;
}): Promise<EvmSmartAccount> => {
  const { artistId, primaryWallet, wallets } = artist;
  const { chainId, collectionAddress } = moment;
  const orderedWallets = [
    primaryWallet,
    ...wallets.filter((w) => w.toLowerCase() !== primaryWallet.toLowerCase()),
  ];
  const network: 'base' | 'base-sepolia' = IS_TESTNET ? 'base-sepolia' : 'base';

  // 1. Canonical smart account — fast path
  const canonicalAccount = await getCanonicalSmartAccount({ artistId });
  const canonicalPermission = await getPermission(
    collectionAddress,
    canonicalAccount.address as Address,
    chainId
  );
  if (BigInt(canonicalPermission || 0) === BigInt(PERMISSION_BIT_ADMIN)) {
    return canonicalAccount;
  }

  // 2. Legacy path: find the wallet-based account that still has on-chain admin
  for (const walletAddress of orderedWallets) {
    const legacySmartAccount = await getLegacySmartAccount({
      address: walletAddress,
    });
    const permission = await getPermission(
      collectionAddress,
      legacySmartAccount.address as Address,
      chainId
    );
    if (BigInt(permission || 0) === BigInt(PERMISSION_BIT_ADMIN)) {
      // Grant canonical admin now so all future calls take the fast path
      await sendUserOperation({
        smartAccount: legacySmartAccount,
        network,
        calls: [
          {
            to: collectionAddress,
            data: addPermissionCall(
              canonicalAccount.address as Address,
              BigInt(0)
            ),
          },
        ] as unknown as readonly OneOf<
          Call<unknown, { [key: string]: unknown }>
        >[],
      });
      return canonicalAccount;
    }
  }

  throw new Error(
    `No authorized smart wallet found for collection ${collectionAddress}`
  );
};
