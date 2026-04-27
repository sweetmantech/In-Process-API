import cdp from '@/lib/coinbase/client';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { type Address } from 'viem';
import { deterministicAccountName } from './deterministricAccountName';
import selectArtists from '../supabase/in_process_artists/selectArtists';
import { upsertArtists } from '../supabase/in_process_artists/upsertArtists';

export async function getOrCreateSmartWallet({
  address,
}: {
  address: Address;
}): Promise<EvmSmartAccount> {
  const evmAccount = await cdp.evm.getOrCreateAccount({
    name: deterministicAccountName(address),
  });
  const smartAccount = await cdp.evm.getOrCreateSmartAccount({
    name: evmAccount.name as string,
    owner: evmAccount,
  });
  const { data: artists } = await selectArtists({
    address,
  });
  if (artists?.[0]?.smart_wallet !== smartAccount.address.toLowerCase()) {
    await upsertArtists([
      {
        address,
        smart_wallet: smartAccount.address,
      },
    ]);
  }
  return smartAccount;
}
