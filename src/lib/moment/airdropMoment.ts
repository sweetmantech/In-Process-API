import { Address, encodeFunctionData, Hash } from 'viem';
import { z } from 'zod';
import { CHAIN_ID, IS_TESTNET, PERMISSION_BIT_ADMIN } from '@/lib/consts';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { zoraCreator1155ImplABI } from '@zoralabs/protocol-deployments';
import { getOrCreateSmartWallet } from '../coinbase/getOrCreateSmartWallet';
import { airdropMomentSchema } from '../schema/airdropMomentSchema';
import getPermission from '../zora/getPermission';

export type AirdropMomentInput = z.infer<typeof airdropMomentSchema> & {
  artistAddress: Address;
};

export interface AirdropResult {
  hash: Hash;
  chainId: number;
}

export async function airdropMoment({
  recipients,
  moment,
  artistAddress,
}: AirdropMomentInput): Promise<AirdropResult> {
  const smartAccount = await getOrCreateSmartWallet({
    address: artistAddress,
  });

  const smartWalletPermissionBit = await getPermission(
    moment.collectionAddress,
    smartAccount.address
  );

  if (smartWalletPermissionBit !== BigInt(PERMISSION_BIT_ADMIN)) {
    const accountPermissionBit = await getPermission(
      moment.collectionAddress,
      artistAddress
    );
    if (accountPermissionBit !== BigInt(PERMISSION_BIT_ADMIN))
      throw Error(
        'The account does not have admin permission for this collection.'
      );
    else throw Error('Admin permission are not yet granted to smart wallet.');
  }

  const calls = recipients.map((recipient) =>
    encodeFunctionData({
      abi: zoraCreator1155ImplABI,
      functionName: 'adminMint',
      args: [recipient, BigInt(moment.tokenId), BigInt(1), '0x'],
    })
  );

  const airdropCall = encodeFunctionData({
    abi: zoraCreator1155ImplABI,
    functionName: 'multicall',
    args: [calls],
  });

  const transaction = await sendUserOperation({
    smartAccount,
    network: IS_TESTNET ? 'base-sepolia' : 'base',
    calls: [
      {
        to: moment.collectionAddress as Address,
        data: airdropCall,
      },
    ],
  });
  return {
    hash: transaction.transactionHash as Hash,
    chainId: CHAIN_ID,
  };
}
