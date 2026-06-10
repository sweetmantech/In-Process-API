import { type Address } from 'viem';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import cdp from '@/lib/coinbase/client';
import { deterministicAccountName } from './deterministricAccountName';

export async function getWalletSmartAccount({
  address,
}: {
  address: Address;
}): Promise<EvmSmartAccount> {
  const lowercased = address.toLowerCase() as Address;
  const evmAccount = await cdp.evm.getOrCreateAccount({
    name: deterministicAccountName(lowercased),
  });
  return cdp.evm.getOrCreateSmartAccount({
    name: evmAccount.name as string,
    owner: evmAccount,
  });
}
