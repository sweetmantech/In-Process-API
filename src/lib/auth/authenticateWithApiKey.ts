import { getWalletsByApiKey } from '@/lib/wallets/getWalletsByApiKey';
import { AuthMethod } from '@/types/auth';

const authenticateWithApiKey = async (apiKey: string) => {
  const wallets = await getWalletsByApiKey(apiKey);
  return { ...wallets, authMethod: AuthMethod.ApiKey };
};

export default authenticateWithApiKey;
