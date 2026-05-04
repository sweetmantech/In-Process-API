import { Address } from 'viem';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { CHAIN_ID, IS_TESTNET } from '@/lib/consts';
import getSmartWalletsBalances from '@/lib/smartwallets/getSmartWalletsBalances';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getWithdrawalCall } from '@/lib/smartwallets/getWithdrawalCall';

const migrateSmartWalletFunds = async ({
  socialSmartAccount,
  artistSmartWalletAddress,
}: {
  socialSmartAccount: EvmSmartAccount;
  artistSmartWalletAddress: Address;
}) => {
  const network = IS_TESTNET ? 'base-sepolia' : 'base';
  try {
    const { walletsBalances } = await getSmartWalletsBalances(
      [
        {
          address: socialSmartAccount.address as Address,
          smartWallet: socialSmartAccount,
        },
      ],
      CHAIN_ID
    );

    const balance = walletsBalances.get(socialSmartAccount.address as Address);
    if (!balance) return;

    const calls = [];

    if (balance.ethBalance > BigInt(0)) {
      calls.push(
        getWithdrawalCall(
          'eth',
          balance.ethBalance,
          artistSmartWalletAddress,
          CHAIN_ID
        )
      );
    }

    if (balance.usdcBalance > BigInt(0)) {
      calls.push(
        getWithdrawalCall(
          'usdc',
          balance.usdcBalance,
          artistSmartWalletAddress,
          CHAIN_ID
        )
      );
    }

    if (calls.length === 0) return;

    const transaction = await sendUserOperation({
      smartAccount: socialSmartAccount,
      network,
      calls,
    });
    console.log(
      `✅ migrated ETH and USDC from social wallet to artist wallet: ${transaction.transactionHash}`
    );
  } catch (error) {
    console.error(`❌ migrateSmartWalletFunds: ${error}`);
    throw new Error(`❌ migrateSmartWalletFunds: ${error}`);
  }
};

export default migrateSmartWalletFunds;
