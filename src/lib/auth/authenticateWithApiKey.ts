import { getArtistAddressByApiKey } from '@/lib/api-keys/getArtistAddressByApiKey';
import { AuthMethod } from '@/types/auth';

const authenticateWithApiKey = async (apiKey: string) => {
  const artistAddress = await getArtistAddressByApiKey(apiKey);
  return { artistAddress, authMethod: AuthMethod.ApiKey };
};

export default authenticateWithApiKey;
