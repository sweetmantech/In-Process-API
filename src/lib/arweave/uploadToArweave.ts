import { Readable } from 'stream';
import turboClient from './turboClient';
import patchFetch from './patchFetch';
import { retriesGeneric } from '@/lib/protocolSdk/retries';

export type ArweaveUploadResult = {
  arweave_uri: string;
  winc_cost: string;
};

const uploadToArweave = async (file: File): Promise<ArweaveUploadResult> => {
  const uint8Array = new Uint8Array(await file.arrayBuffer());
  const restoreFetch = patchFetch();

  try {
    return await retriesGeneric({
      maxTries: 3,
      linearBackoffMS: 2_000,
      tryFn: async () => {
        const { id, winc } = await turboClient.uploadFile({
          fileStreamFactory: () => Readable.from(Buffer.from(uint8Array)),
          fileSizeFactory: () => file.size,
          dataItemOpts: {
            tags: [
              { name: 'Content-Type', value: file.type },
              { name: 'File-Name', value: file.name },
            ],
          },
          chunkingMode: 'disabled',
        });

        if (!id) throw new Error('Failed to upload to Arweave (missing id)');

        const arweave_uri = `ar://${id}`;
        console.log('Arweave upload complete', { arweave_uri });
        return { arweave_uri, winc_cost: winc };
      },
    });
  } finally {
    restoreFetch();
  }
};

export default uploadToArweave;
