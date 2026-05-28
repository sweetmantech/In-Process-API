import { Address, Hash, formatEther, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { NextResponse } from 'next/server';
import { getCanonicalSmartAccount } from '@/lib/coinbase/getCanonicalSmartAccount';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import getWalletBalance from '@/lib/viem/getWalletBalance';
import { calculateTotalWithdrawAmount } from './calculateTotalWithdrawAmount';
import { getWithdrawalCall } from './getWithdrawalCall';
import type { WithdrawValidatedInput } from './validateWithdrawBody';

const withdrawHandler = async ({
  artistId,
  currency,
  amount,
  to,
  chainId,
}: WithdrawValidatedInput) => {
  const canonicalAccount = await getCanonicalSmartAccount({ artistId });
  const canonicalAddress = canonicalAccount.address.toLowerCase() as Address;

  const { ethBalance, usdcBalance } = await getWalletBalance(
    canonicalAddress,
    chainId
  );

  const withdrawAmount = calculateTotalWithdrawAmount(
    currency,
    amount,
    ethBalance,
    usdcBalance
  );

  const network = chainId === baseSepolia.id ? 'base-sepolia' : 'base';
  const transaction = await sendUserOperation({
    smartAccount: canonicalAccount,
    network,
    calls: [getWithdrawalCall(currency, withdrawAmount, to, chainId)],
  });

  const remainingEthBalance =
    currency === 'eth' ? ethBalance - withdrawAmount : ethBalance;
  const remainingUsdcBalance =
    currency === 'usdc' ? usdcBalance - withdrawAmount : usdcBalance;

  return NextResponse.json({
    hash: transaction.transactionHash as Hash,
    address: canonicalAddress,
    withdrawn_amount:
      currency === 'eth'
        ? formatEther(withdrawAmount)
        : formatUnits(withdrawAmount, 6),
    eth_balance: formatEther(remainingEthBalance),
    usdc_balance: formatUnits(remainingUsdcBalance, 6),
  });
};

export default withdrawHandler;
