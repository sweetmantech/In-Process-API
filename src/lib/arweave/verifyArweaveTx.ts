import turboClient from '@/lib/arweave/turboClient';

const IRYS_GRAPHQL = 'https://uploader.irys.xyz/graphql';

const verifyArweaveTx = async (arweave_uri: string): Promise<boolean> => {
  const txId = arweave_uri.replace(/^ar:\/\//, '');

  const ourAddress = await turboClient.signer.getNativeAddress();

  const query = `{
    transactions(ids: ["${txId}"]) {
      edges {
        node {
          id
          address
        }
      }
    }
  }`;

  const res = await fetch(IRYS_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  console.log('[verifyArweaveTx] txId:', txId, '| ourAddress:', ourAddress);

  if (!res.ok) {
    const body = await Promise.resolve()
      .then(() => res.text())
      .catch(() => '(unreadable)');
    console.log('[verifyArweaveTx] HTTP error', res.status, body);
    throw new Error(`Irys graphql returned ${res.status}`);
  }

  const json = await res.json();
  const node = json.data?.transactions?.edges?.[0]?.node;

  if (!node) {
    console.log(
      '[verifyArweaveTx] no node found — raw response:',
      JSON.stringify(json)
    );
    return false;
  }

  const match = node.address.toLowerCase() === ourAddress.toLowerCase();
  console.log(
    '[verifyArweaveTx] node.address:',
    node.address,
    '| match:',
    match
  );
  return match;
};

export default verifyArweaveTx;
