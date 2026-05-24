import { getAuthorizedAddressByApiKey } from '@/lib/api-keys/getAuthorizedAddressByApiKey';
import { AuthMethod } from '@/types/auth';

const authenticateWithApiKey = async (apiKey: string) => {
  const artistAddress = await getAuthorizedAddressByApiKey(apiKey);
  return { artistAddress, authMethod: AuthMethod.ApiKey };
};

export default authenticateWithApiKey;
