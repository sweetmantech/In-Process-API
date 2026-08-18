import type { ArtistContext } from '@/types/artist';
import { Address, encodeFunctionData, Hash } from 'viem';
import { z } from 'zod';
import { CHAIN_ID, IS_TESTNET } from '@/lib/consts';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { zoraCreator1155ImplABI } from '@zoralabs/protocol-deployments';
import { getOperationalSmartWallet } from '@/lib/smartwallets/getOperationalSmartWallet';
import { airdropMomentSchema } from '../schema/airdropMomentSchema';

export type AirdropMomentInput = Omit<
  z.infer<typeof airdropMomentSchema>,
  'recipients'
> & {
  artist: ArtistContext;
  recipients: Address[];
};

export interface AirdropResult {
  hash: Hash;
  chainId: number;
}

export async function airdropMoment({
  recipients,
  moment,
  artist,
}: AirdropMomentInput): Promise<AirdropResult> {
  const smartAccount = await getOperationalSmartWallet({ artist, moment });

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
