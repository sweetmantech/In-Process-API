import { AuthMethod } from '@/types/auth';
import { getWalletsByFarcasterToken } from '@/lib/farcaster/getWalletsByFarcasterToken';

const authenticateWithFarcasterToken = async (token: string) => {
  const wallets = await getWalletsByFarcasterToken(token);
  return {
    ...wallets,
    authMethod: AuthMethod.Farcaster,
  };
};

export default authenticateWithFarcasterToken;
