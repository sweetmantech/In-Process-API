import wayfinderClient from './wayfinderClient';

const readFromArweave = async (txId: string): Promise<Response> => {
  return wayfinderClient.request(`ar://${txId}`);
};

export default readFromArweave;
