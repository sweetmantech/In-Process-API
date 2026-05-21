import type { PrivyPasswordlessAuthenticateResult } from '@/types/auth';
import createPrivyEmbeddedWallet from '@/lib/privy/createPrivyEmbeddedWallet';
import getPrivySocialWalletFromLinkedAccounts from '@/lib/privy/getPrivySocialWalletFromLinkedAccounts';

const ensurePrivySocialWallet = async (
  data: PrivyPasswordlessAuthenticateResult
): Promise<string> => {
  const existing = getPrivySocialWalletFromLinkedAccounts(
    data.user?.linked_accounts
  );
  if (existing) return existing;

  const userId = data.user?.id;
  if (!userId) throw new Error('Privy user id missing');

  return createPrivyEmbeddedWallet(userId);
};

export default ensurePrivySocialWallet;
