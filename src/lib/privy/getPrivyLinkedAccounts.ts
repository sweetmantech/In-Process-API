import privyClient from './client';

export interface PrivyLinkedAccounts {
  socialWalletAddress: string | undefined;
  externalWalletAddress: string | undefined;
}

const getPrivyLinkedAccounts = async (
  authToken: string
): Promise<PrivyLinkedAccounts> => {
  const verified = await privyClient.utils().auth().verifyAuthToken(authToken);
  if (!verified) throw new Error('Invalid authentication token');

  const url = `https://api.privy.io/v1/users/${verified.user_id}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'privy-app-id': process.env.PRIVY_APP_ID!,
      Authorization: `Basic ${btoa(process.env.PRIVY_APP_ID! + ':' + process.env.PRIVY_API_KEY!)}`,
    },
  });
  const data = await response.json();

  const socialAccount = data.linked_accounts.find(
    (account: any) => account.wallet_client_type === 'privy'
  );
  const externalAccount = data.linked_accounts.find(
    (account: any) =>
      account.wallet_client_type !== 'privy' && account.type === 'wallet'
  );

  const socialWalletAddress = socialAccount?.address?.toLowerCase();
  const externalWalletAddress = externalAccount?.address?.toLowerCase();
  if (!socialWalletAddress && !externalWalletAddress)
    throw new Error('No social or artist wallet found');

  return { socialWalletAddress, externalWalletAddress };
};

export default getPrivyLinkedAccounts;
