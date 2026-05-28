import type { ArtistContext } from '@/types/artist';
import { Address, Hash } from 'viem';
import { z } from 'zod';
import { CHAIN_ID, IS_TESTNET } from '@/lib/consts';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getOperationalSmartWallet } from '@/lib/smartwallets/getOperationalSmartWallet';
import { permissionSchema } from '../schema/permissionSchema';
import getRemovePermissionCall from '../viem/getRemovePermissionCall';

export type RemovePermissionInput = z.infer<typeof permissionSchema> & {
  artist: ArtistContext;
};

export interface RemovePermissionResult {
  hash: Hash;
  chainId: number;
}

export async function removePermission({
  moment,
  adminAddress,
  artist,
}: RemovePermissionInput): Promise<RemovePermissionResult> {
  const smartAccount = await getOperationalSmartWallet({ artist, moment });

  const transaction = await sendUserOperation({
    smartAccount,
    network: IS_TESTNET ? 'base-sepolia' : 'base',
    calls: [getRemovePermissionCall(moment, adminAddress)],
  });

  return {
    hash: transaction.transactionHash as Hash,
    chainId: CHAIN_ID,
  };
}
