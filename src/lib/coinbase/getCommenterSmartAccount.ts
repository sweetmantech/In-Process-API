import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import cdp from '@/lib/coinbase/client';
import { IN_PROCESS_COMMENTER_ACCOUNT_NAME } from '@/lib/consts';

/** Shared CDP smart account used to call `delegateComment` on behalf of artists. */
export async function getCommenterSmartAccount(): Promise<EvmSmartAccount> {
  const evmAccount = await cdp.evm.getOrCreateAccount({
    name: IN_PROCESS_COMMENTER_ACCOUNT_NAME,
  });
  return cdp.evm.getOrCreateSmartAccount({
    name: evmAccount.name as string,
    owner: evmAccount,
  });
}
