import wayfinderClient from './wayfinderClient';

const readFromArweave = async (
  arUri: string,
  init?: RequestInit
): Promise<Response> => {
  try {
    const response = await wayfinderClient.request(arUri, init);
    if (response.ok) return response;
    throw new Error(`Gateway returned ${response.status}`);
  } catch {
    const txId = arUri.replace(/^ar:\/\//, '');
    return fetch(`https://gateway.irys.xyz/mutable/${txId}`, init);
  }
};

export default readFromArweave;
