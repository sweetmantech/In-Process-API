import { retriesGeneric } from '@/lib/protocolSdk/retries';
import createMuxUpload from './createMuxUpload';
import getMuxAssetId from './getMuxAssetId';
import getMuxStaticRenditions from './getMuxStaticRenditions';

export interface MuxUploadResult {
  playbackUrl: string;
  downloadUrl: string;
}

const uploadVideoToMux = async (
  buffer: Buffer,
  mimeType: string
): Promise<MuxUploadResult> => {
  const { uploadUrl, uploadId } = await createMuxUpload();

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType },
    body: new Uint8Array(buffer),
  });
  if (!res.ok)
    throw new Error(`Failed to upload video to Mux: ${res.statusText}`);

  const assetId = await getMuxAssetId(uploadId);

  return retriesGeneric({
    tryFn: async () => {
      const result = await getMuxStaticRenditions(assetId);
      if (!result) throw new Error('Mux static renditions not ready');
      return result;
    },
    maxTries: 60,
    linearBackoffMS: 20_000,
  });
};

export default uploadVideoToMux;
