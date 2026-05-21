import privyClient from '@/lib/privy/client';

const isPrivyWalletAddress = async (address: string): Promise<boolean> => {
  try {
    const user = await privyClient.users().getByWalletAddress({ address });
    return user.linked_accounts.some(
      (account) =>
        account.type === 'wallet' &&
        'wallet_client_type' in account &&
        account.wallet_client_type === 'privy' &&
        account.address?.toLowerCase() === address.toLowerCase()
    );
  } catch {
    return false;
  }
};

export default isPrivyWalletAddress;
