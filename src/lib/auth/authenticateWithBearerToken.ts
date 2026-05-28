import { getWalletsByPrivyToken } from '@/lib/privy/getWalletsByPrivyToken';
import { AuthMethod } from '@/types/auth';

const authenticateWithBearerToken = async (token: string) => {
  const wallets = await getWalletsByPrivyToken(token);
  return {
    ...wallets,
    authMethod: AuthMethod.Privy,
  };
};

export default authenticateWithBearerToken;
