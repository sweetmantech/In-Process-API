import selectSocialWallets from '../supabase/in_process_artist_social_wallets/selectSocialWallets';
import privyClient from './client';

export async function getAddressesByPrivyToken(authToken: string): Promise<{
  artistAddress: string | undefined;
  socialWallet: string | undefined;
}> {
  const verified = await privyClient.utils().auth().verifyAuthToken(authToken);
  if (!verified) throw new Error('Invalid authentication token');

  const url = `https://api.privy.io/v1/users/${verified.user_id}`;
  const options = {
    method: 'GET',
    headers: {
      'privy-app-id': process.env.PRIVY_APP_ID!,
      Authorization: `Basic ${btoa(process.env.PRIVY_APP_ID! + ':' + process.env.PRIVY_API_KEY!)}`,
    },
  };

  const response = await fetch(url, options);
  const data = await response.json();
  const socialAccount = data.linked_accounts.find(
    (account: any) => account.wallet_client_type === 'privy'
  );
  if (socialAccount?.address) {
    const socialWallet = socialAccount.address.toLowerCase();
    const { data: walletRows, error } = await selectSocialWallets({
      socialWallets: [socialWallet],
    });
    if (error) throw new Error(error.message);
    const artistAddress = walletRows?.[0]?.artist_address;
    if (artistAddress)
      return {
        artistAddress,
        socialWallet,
      };
    return {
      artistAddress: undefined,
      socialWallet,
    };
  }
  const externalAccount = data.linked_accounts.find(
    (account: any) =>
      account.wallet_client_type !== 'privy' && account.type === 'wallet'
  );
  if (externalAccount?.address) {
    return {
      artistAddress: externalAccount.address.toLowerCase(),
      socialWallet: undefined,
    };
  }
  throw new Error('No social or artist wallet found');
}
