import wayfinderClient from './wayfinderClient';

const readFromArweave = async (
  arUri: string,
  init?: RequestInit
): Promise<Response> => {
  return wayfinderClient.request(arUri, init);
};

export default readFromArweave;
