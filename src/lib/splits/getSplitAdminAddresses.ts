import { Address, getAddress } from 'viem';
import { SplitRecipient } from '@0xsplits/splits-sdk';
import { getWalletSmartAccount } from '@/lib/coinbase/getWalletSmartAccount';
import sleep from '@/lib/sleep';

export interface SplitAdminAddresses {
  addresses: Address[];
  smartWallets: Address[];
}

/**
 * Gets all split addresses and their smart wallets for admin permission granting.
 * Assumes all split addresses are already resolved (no ENS names).
 */
export async function getSplitAdminAddresses(
  splits: SplitRecipient[] | undefined
): Promise<SplitAdminAddresses> {
  const addresses: Address[] = [];
  const smartWallets: Address[] = [];

  // Process each split recipient (addresses should already be resolved)
  if (splits && splits.length > 0) {
    const resolvedAddresses = splits.map((split) =>
      getAddress(split.address as Address)
    );

    // Add all resolved addresses
    addresses.push(...resolvedAddresses);

    // Get smart wallets for each split recipient address.
    // Throttle to avoid CDP rate limits when many recipients are present.
    for (let i = 0; i < resolvedAddresses.length; i++) {
      const address = resolvedAddresses[i];
      const smartAccount = await getWalletSmartAccount({ address });
      smartWallets.push(getAddress(smartAccount.address));
      if (i < resolvedAddresses.length - 1) await sleep(200);
    }
  }

  // Deduplicate addresses and smart wallets to avoid duplicate permission calls
  const uniqueAddresses = Array.from(
    new Set(addresses.map((a) => a.toLowerCase()))
  ).map((a) => getAddress(a as Address));
  const uniqueSmartWallets = Array.from(
    new Set(smartWallets.map((a) => a.toLowerCase()))
  ).map((a) => getAddress(a as Address));

  return { addresses: uniqueAddresses, smartWallets: uniqueSmartWallets };
}
