import wayfinderClient from './wayfinderClient';

const readFromArweave = async (arUri: string): Promise<Response> => {
  return wayfinderClient.request(arUri);
};

export default readFromArweave;
