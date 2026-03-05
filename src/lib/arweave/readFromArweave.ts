import wayfinderClient from './wayfinderClient';

const readFromArweave = async (
  arUri: string,
  init?: RequestInit
): Promise<Response> => {
  try {
    return await wayfinderClient.request(arUri, init);
  } catch {
    const txId = arUri.replace(/^ar:\/\//, '');
    return fetch(`https://gateway.irys.xyz/mutable/${txId}`, init);
  }
};

export default readFromArweave;
