import selectWallets from '../supabase/in_process_wallets/selectWallets';
import getPrivyLinkedAccounts from './getPrivyLinkedAccounts';

export async function getAddressesByPrivyToken(authToken: string): Promise<{
  artistAddress: string | undefined;
  socialWallet: string | undefined;
}> {
  const { socialWalletAddress, externalWalletAddress } =
    await getPrivyLinkedAccounts(authToken);

  if (socialWalletAddress) {
    const { data: walletRows } = await selectWallets({
      addresses: [socialWalletAddress],
    });
    const artistId = walletRows?.[0]?.artist;
    if (artistId) {
      const { data: externalRows } = await selectWallets({
        artistIds: [artistId],
        type: 'external',
      });
      return {
        artistAddress: externalRows?.[0]?.address,
        socialWallet: socialWalletAddress,
      };
    }
    return { artistAddress: undefined, socialWallet: socialWalletAddress };
  }

  return { artistAddress: externalWalletAddress, socialWallet: undefined };
}
