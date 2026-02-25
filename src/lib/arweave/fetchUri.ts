import { isArweaveURL } from '../protocolSdk/ipfs/arweave';
import readFromArweave from './readFromArweave';
import { getFetchableUrl } from '../protocolSdk/ipfs/gateway';

const fetchUri = async (uri: string, init?: RequestInit): Promise<Response> => {
  if (isArweaveURL(uri)) return readFromArweave(uri, init);
  const fetchableUrl = getFetchableUrl(uri);
  if (!fetchableUrl) throw new Error(`No fetchable URL for: ${uri}`);
  return fetch(fetchableUrl, init);
};

export default fetchUri;
