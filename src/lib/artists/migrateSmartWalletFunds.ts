import { Address } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CHAIN_ID } from '@/lib/consts';
import { getWalletSmartAccount } from '@/lib/coinbase/getWalletSmartAccount';
import getWalletBalance from '@/lib/viem/getWalletBalance';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getWithdrawalCall } from '@/lib/smartwallets/getWithdrawalCall';

const migrateSmartWalletFunds = async ({
  legacyWalletAddress,
  primarySmartAccountAddress,
  chainId = CHAIN_ID,
}: {
  legacyWalletAddress: Address;
  primarySmartAccountAddress: Address;
  chainId?: number;
}) => {
  const network = chainId === baseSepolia.id ? 'base-sepolia' : 'base';
  try {
    const legacySmartAccount = await getWalletSmartAccount({
      address: legacyWalletAddress,
    });
    const legacySmartAccountAddress =
      legacySmartAccount.address.toLowerCase() as Address;
    if (
      legacySmartAccountAddress === primarySmartAccountAddress.toLowerCase()
    ) {
      return;
    }

    const { ethBalance, usdcBalance } = await getWalletBalance(
      legacySmartAccountAddress,
      chainId
    );

    const calls = [];

    if (ethBalance > BigInt(0)) {
      calls.push(
        getWithdrawalCall(
          'eth',
          ethBalance,
          primarySmartAccountAddress,
          chainId
        )
      );
    }

    if (usdcBalance > BigInt(0)) {
      calls.push(
        getWithdrawalCall(
          'usdc',
          usdcBalance,
          primarySmartAccountAddress,
          chainId
        )
      );
    }

    if (calls.length === 0) return;

    const transaction = await sendUserOperation({
      smartAccount: legacySmartAccount,
      network,
      calls,
    });
    console.log(
      `✅ migrated ETH and USDC from legacy smart wallet to primary: ${transaction.transactionHash}`
    );
  } catch {
    return;
  }
};

export default migrateSmartWalletFunds;
