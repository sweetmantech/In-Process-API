import privyClient from '@/lib/privy/client';
import getPrivyWalletFromLinkedAccounts from './getPrivyWalletFromLinkedAccounts';
import getExternalWalletsFromLinkedAccount from './getExternalWalletsFromLinkedAccount';

const getPrivyWalletAddressesByEmail = async (
  email: string
): Promise<string[]> => {
  try {
    const user = await privyClient
      .users()
      .getByEmailAddress({ address: email });
    // Narrow to wallet-typed accounts only: Privy's LinkedAccount union also
    // includes phone/email/OAuth entries with no address field at all.
    const walletAccounts = user.linked_accounts.filter(
      (account): account is Extract<typeof account, { type: 'wallet' }> =>
        account.type === 'wallet'
    );
    const privyWallet = getPrivyWalletFromLinkedAccounts(walletAccounts);
    const externalWallets = getExternalWalletsFromLinkedAccount(walletAccounts);
    return privyWallet ? [privyWallet, ...externalWallets] : externalWallets;
  } catch {
    return [];
  }
};

export default getPrivyWalletAddressesByEmail;
