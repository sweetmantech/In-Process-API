import privyClient from '@/lib/privy/client';

const getEmailByWalletAddress = async (
  address: string
): Promise<string | null> => {
  try {
    const user = await privyClient.users().getByWalletAddress({ address });
    const emailAccount = user.linked_accounts.find(
      (account) => account.type === 'email'
    );
    if (!emailAccount || emailAccount.type !== 'email') return null;
    return emailAccount.address;
  } catch {
    return null;
  }
};

export default getEmailByWalletAddress;
