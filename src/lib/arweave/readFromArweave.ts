import wayfinderClient from './wayfinderClient';

const readFromArweave = async (
  arUri: string,
  init?: RequestInit
): Promise<Response> => {
  const txId = arUri.replace(/^ar:\/\//, '');
  try {
    return fetch(`https://gateway.irys.xyz/mutable/${txId}`, init);
    // const response = await wayfinderClient.request(arUri, init);
    // if (response.ok) return response;
    // throw new Error(`Gateway returned ${response.status}`);
  } catch {
    return fetch(`https://gateway.irys.xyz/mutable/${txId}`, init);
  }
};

export default readFromArweave;
