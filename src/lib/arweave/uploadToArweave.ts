import { Readable } from 'stream';
import turboClient from './turboClient';
import patchFetch from './patchFetch';

export const uploadToArweave = async (file: File): Promise<string> => {
  const uint8Array = new Uint8Array(await file.arrayBuffer());
  const restoreFetch = patchFetch();

  try {
    const { id } = await turboClient.uploadFile({
      fileStreamFactory: () => Readable.from(Buffer.from(uint8Array)),
      fileSizeFactory: () => file.size,
      dataItemOpts: {
        tags: [
          { name: 'Content-Type', value: file.type },
          { name: 'File-Name', value: file.name },
        ],
      },
    });

    const arweaveURI = `ar://${id}`;
    console.log('✅ Arweave URI received:', arweaveURI);
    return arweaveURI;
  } finally {
    restoreFetch();
  }
};

export default uploadToArweave;
