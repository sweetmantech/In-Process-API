type LinkedAccount = {
  type?: string;
  wallet_client_type?: string;
  address?: string;
};

const getExternalWalletsFromLinkedAccount = (
  linkedAccounts: LinkedAccount[] | undefined
): string[] =>
  linkedAccounts
    ?.filter(
      (a) =>
        a.wallet_client_type !== 'privy' && a.type === 'wallet' && a.address
    )
    .map((a) => a.address!.toLowerCase()) ?? [];

export default getExternalWalletsFromLinkedAccount;
