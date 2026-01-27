import Arweave from 'arweave';
import { ARWEAVE_KEY } from '@/lib/consts';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

export const uploadToArweave = async (file: File): Promise<string> => {
  const mimeType = file.type;
  const buffer = Buffer.from(await file.arrayBuffer());

  const transaction = await arweave.createTransaction({ data: buffer });
  transaction.addTag('Content-Type', mimeType);

  await arweave.transactions.sign(transaction, ARWEAVE_KEY);
  const response = await arweave.transactions.post(transaction);

  if (response.status !== 200) {
    throw new Error(
      `❌ Upload failed: ${response.status} ${response.statusText}`
    );
  }

  const arweaveURI = `ar://${transaction.id}`;
  console.log('✅ Arweave URI received:', arweaveURI);
  return arweaveURI;
};

export default uploadToArweave;
