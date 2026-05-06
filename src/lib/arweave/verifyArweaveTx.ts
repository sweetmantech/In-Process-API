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

  if (!res.ok) throw new Error(`Irys graphql returned ${res.status}`);

  const { data } = await res.json();
  const node = data?.transactions?.edges?.[0]?.node;

  if (!node) return false;
  return node.address.toLowerCase() === ourAddress.toLowerCase();
};

export default verifyArweaveTx;
