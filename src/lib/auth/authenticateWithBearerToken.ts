import { getAddressesByPrivyToken } from '@/lib/privy/getAddressesByPrivyToken';
import { AuthErrorMessages } from '@/errors';
import { AuthMethod } from '@/types/auth';

const authenticateWithBearerToken = async (token: string) => {
  const { artistAddress, socialWallet } = await getAddressesByPrivyToken(token);
  const address = artistAddress || socialWallet;
  if (!address) throw new Error(AuthErrorMessages.NO_SOCIAL_OR_ARTIST_WALLET);
  return {
    artistAddress: address,
    socialWallet,
    authMethod: AuthMethod.Privy,
  };
};

export default authenticateWithBearerToken;
