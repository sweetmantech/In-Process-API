import wayfinderClient from './wayfinderClient';
import buildArweaveGatewayUrls from './buildArweaveGatewayUrls';

const readFromArweave = async (
  arUri: string,
  init?: RequestInit
): Promise<Response> => {
  const txId = arUri.replace(/^ar:\/\//, '');
  const headers = new Headers(init?.headers);
  headers.delete('Range');
  const nextInit: RequestInit = { ...init, headers };

  try {
    const response = await wayfinderClient.request(arUri, nextInit);
    if (response.ok) return response;
  } catch {
    // Fall through to static gateway URLs.
  }

  let lastResponse: Response | undefined;
  for (const url of buildArweaveGatewayUrls(txId)) {
    try {
      const response = await fetch(url, nextInit);
      if (response.ok) return response;
      lastResponse = response;
    } catch {
      // Try the next gateway.
    }
  }

  if (lastResponse) return lastResponse;
  throw new Error(`Failed to fetch ${arUri}`);
};

export default readFromArweave;
