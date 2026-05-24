import { AuthMethod } from '@/types/auth';
import getArtistWalletsByPrivyToken from './getArtistWalletsByPrivyToken';
import getArtistWalletsByFarcasterToken from './getArtistWalletsByFarcasterToken';
import getArtistWalletsByApiKey from './getArtistWalletsByApiKey';

const getArtistWalletsHandler = async ({
  method,
  token,
}: {
  method: AuthMethod;
  token: string;
}) => {
  if (method === AuthMethod.Privy) return getArtistWalletsByPrivyToken(token);
  if (method === AuthMethod.Farcaster)
    return getArtistWalletsByFarcasterToken(token);
  return getArtistWalletsByApiKey(token);
};

export default getArtistWalletsHandler;
