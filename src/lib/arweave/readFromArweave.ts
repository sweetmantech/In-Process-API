import wayfinderClient from './wayfinderClient';

const readFromArweave = async (
  arUri: string,
  init?: RequestInit
): Promise<Response> => {
  const txId = arUri.replace(/^ar:\/\//, '');
  // Irys mutable gateway returns 416 for Range; stream full resource instead.
  const headers = new Headers(init?.headers);
  headers.delete('Range');
  const nextInit: RequestInit = { ...init, headers };
  try {
    const response = await wayfinderClient.request(arUri, init);
    if (response.ok) return response;
    throw new Error(`Gateway returned ${response.status}`);
  } catch {
    return fetch(`https://gateway.irys.xyz/mutable/${txId}`, nextInit);
  }
};

export default readFromArweave;
