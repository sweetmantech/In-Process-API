import { Readable } from 'stream';
import turboClient from './turboClient';
import patchFetch from './patchFetch';

export type ArweaveUploadResult = {
  arweave_uri: string;
  winc_cost: string;
};

const uploadToArweave = async (file: File): Promise<ArweaveUploadResult> => {
  const uint8Array = new Uint8Array(await file.arrayBuffer());
  const restoreFetch = patchFetch();

  try {
    const { id, winc } = await turboClient.uploadFile({
      fileStreamFactory: () => Readable.from(Buffer.from(uint8Array)),
      fileSizeFactory: () => file.size,
      dataItemOpts: {
        tags: [{ name: 'Content-Type', value: file.type }],
      },
    });

    const arweave_uri = `ar://${id}`;
    console.log('✅ Arweave URI received:', arweave_uri);

    return { arweave_uri, winc_cost: winc };
  } finally {
    restoreFetch();
  }
};

export default uploadToArweave;
