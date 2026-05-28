type LinkedAccount = {
  wallet_client_type?: string;
  address?: string;
};

const getPrivyWalletFromLinkedAccounts = (
  linkedAccounts: LinkedAccount[] | undefined
): string | undefined => {
  const account = linkedAccounts?.find(
    (a) => a.wallet_client_type === 'privy' && a.address
  );
  return account?.address?.toLowerCase();
};

export default getPrivyWalletFromLinkedAccounts;
