const getPrivyWalletFromLinkedAccounts = (
  linkedAccounts: ReadonlyArray<unknown> | undefined
): string | undefined => {
  const account = linkedAccounts?.find(
    (a): a is { wallet_client_type: string; address: string } =>
      typeof a === 'object' &&
      a !== null &&
      (a as { wallet_client_type?: string }).wallet_client_type === 'privy' &&
      typeof (a as { address?: unknown }).address === 'string'
  );
  return account?.address.toLowerCase();
};

export default getPrivyWalletFromLinkedAccounts;
