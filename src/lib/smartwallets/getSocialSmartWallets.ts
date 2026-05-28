import { Address } from 'viem';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import sleep from '@/lib/sleep';

export interface SmartWallet {
  address: Address;
  smartWallet: EvmSmartAccount;
}

export async function getSocialSmartWallets(
  artistAddress: Address
): Promise<SmartWallet[]> {
  const { data: wallets } = await selectWallets({ addresses: [artistAddress] });
  const artistId = wallets?.[0]?.artist_id;

  const privyAddresses: Address[] = [];
  if (artistId) {
    const { data: privyRows } = await selectWallets({
      artistIds: [artistId],
      type: 'privy',
    });
    for (const row of privyRows ?? []) {
      privyAddresses.push(row.address as Address);
    }
  }

  const socialSmartWallets: SmartWallet[] = [];
  if (privyAddresses.length) {
    for (let i = 0; i < privyAddresses.length; i++) {
      const address = privyAddresses[i];
      const smartWallet = await getOrCreateSmartWallet({ address });
      socialSmartWallets.push({ address, smartWallet });
      if (i < privyAddresses.length - 1) await sleep(200);
    }
  } else {
    const artistSmartWallet = await getOrCreateSmartWallet({
      address: artistAddress,
    });
    socialSmartWallets.push({
      address: artistAddress,
      smartWallet: artistSmartWallet,
    });
  }

  return socialSmartWallets;
}
