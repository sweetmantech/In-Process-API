import cdp from '@/lib/coinbase/client';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { type Address } from 'viem';
import { deterministicAccountName } from './deterministricAccountName';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';

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
  const { data: wallets } = await selectWallets({ addresses: [address] });
  if (
    wallets?.[0]?.smart_wallet_address !== smartAccount.address.toLowerCase()
  ) {
    await upsertWallets([
      {
        address: address.toLowerCase(),
        smart_wallet_address: smartAccount.address.toLowerCase(),
      },
    ]);
  }
  return smartAccount;
}
