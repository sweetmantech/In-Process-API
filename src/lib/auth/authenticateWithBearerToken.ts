import { getAddressesByAuthToken } from '@/lib/privy/getAddressesByAuthToken';
import { AuthMethod } from '@/types/auth';

const authenticateWithBearerToken = async (token: string) => {
  const { artistAddress, socialWallet } = await getAddressesByAuthToken(token);
  return {
    artistAddress: artistAddress || socialWallet || '',
    authMethod: AuthMethod.Privy,
  };
};

export default authenticateWithBearerToken;
