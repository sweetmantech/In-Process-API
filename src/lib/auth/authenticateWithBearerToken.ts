import { getAddressesByAuthToken } from '@/lib/privy/getAddressesByAuthToken';
import { AuthErrorMessages } from '@/errors';
import { AuthMethod } from '@/types/auth';

const authenticateWithBearerToken = async (token: string) => {
  const { artistAddress, socialWallet } = await getAddressesByAuthToken(token);
  const address = artistAddress || socialWallet;
  if (!address) throw new Error(AuthErrorMessages.NO_SOCIAL_OR_ARTIST_WALLET);
  return { artistAddress: address, authMethod: AuthMethod.Privy };
};

export default authenticateWithBearerToken;
