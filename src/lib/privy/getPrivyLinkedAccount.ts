import privyClient from './client';
import { WalletType } from '@/types/wallets';
import getPrivyWalletFromLinkedAccounts from './getPrivyWalletFromLinkedAccounts';
import getExternalWalletsFromLinkedAccount from './getExternalWalletsFromLinkedAccount';

const getPrivyLinkedAccount = async (authToken: string) => {
  const verified = await privyClient
    .utils()
    .auth()
    .verifyAccessToken(authToken);
  if (!verified) throw new Error('Invalid authentication token');

  const url = `https://api.privy.io/v1/users/${verified.user_id}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'privy-app-id': process.env.PRIVY_APP_ID!,
      Authorization: `Basic ${btoa(process.env.PRIVY_APP_ID! + ':' + process.env.PRIVY_API_KEY!)}`,
    },
  });

  if (!response.ok) throw new Error('Failed to verify Privy access token.');
  const data = await response.json();

  const privyAddress = getPrivyWalletFromLinkedAccounts(data.linked_accounts);
  const externalWallets = getExternalWalletsFromLinkedAccount(
    data.linked_accounts
  );
  const externalAddress = externalWallets[0];
  if (!privyAddress && !externalAddress)
    throw new Error('No linked accounts found from Privy access token.');

  return {
    linkedAccount: privyAddress || externalAddress,
    type: privyAddress ? 'privy' : ('external' as WalletType),
  };
};

export default getPrivyLinkedAccount;
