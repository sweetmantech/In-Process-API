import { type Address, encodeFunctionData } from 'viem';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { IS_TESTNET } from '@/lib/consts';
import { coinbaseSmartWalletAbi } from '@/lib/abi/coinbaseSmartWalletAbi';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import isSmartWalletOwnerAddress from './isSmartWalletOwnerAddress';

const ensureSmartWalletOwnerAddress = async (
  smartAccount: EvmSmartAccount,
  ownerAddress: Address
): Promise<void> => {
  const isOwner = await isSmartWalletOwnerAddress(
    smartAccount.address as Address,
    ownerAddress
  );
  if (isOwner) return;

  const network = IS_TESTNET ? 'base-sepolia' : 'base';
  await sendUserOperation({
    smartAccount,
    network,
    calls: [
      {
        to: smartAccount.address as Address,
        data: encodeFunctionData({
          abi: coinbaseSmartWalletAbi,
          functionName: 'addOwnerAddress',
          args: [ownerAddress],
        }),
      },
    ],
  });
};

export default ensureSmartWalletOwnerAddress;
