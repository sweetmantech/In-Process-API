import wayfinderClient from './wayfinderClient';

/** Match `mediaStreamHandler`: ranged media often returns 206, not only 200. */
const upstreamOk = (r: Response) => r.ok || r.status === 206;

const readFromArweave = async (
  arUri: string,
  init?: RequestInit
): Promise<Response> => {
  const txId = arUri.replace(/^ar:\/\//, '');
  const irysUrl = `https://gateway.irys.xyz/mutable/${txId}`;

  try {
    const wfResponse = await wayfinderClient.request(arUri, init);
    if (upstreamOk(wfResponse)) return wfResponse;
  } catch {
    // Wayfinder failed (network, etc.) — fall back to Irys below
  }

  return fetch(irysUrl, init);
};

export default readFromArweave;
