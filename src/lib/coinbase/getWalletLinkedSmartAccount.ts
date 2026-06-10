import { type Address } from 'viem';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { getCanonicalSmartAccount } from './getCanonicalSmartAccount';
import { getWalletSmartAccount } from './getWalletSmartAccount';

// Use when only a wallet address is available (split recipients, distribute, legacy paths).
// For known artists, prefer getCanonicalSmartAccount({ artistId }) directly.
export async function getWalletLinkedSmartAccount({
  address,
}: {
  address: Address;
}): Promise<EvmSmartAccount> {
  const lowercased = address.toLowerCase() as Address;
  const { data: wallets } = await selectWallets({ addresses: [lowercased] });
  const artistId = wallets?.[0]?.artist_id ?? null;

  if (artistId) return getCanonicalSmartAccount({ artistId });

  return getWalletSmartAccount({ address: lowercased });
}
