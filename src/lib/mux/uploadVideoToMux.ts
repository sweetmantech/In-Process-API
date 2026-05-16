import createMuxUpload from './createMuxUpload';
import getMuxAssetId from './getMuxAssetId';
import pollMuxStaticRenditions from './pollMuxStaticRenditions';

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
  return pollMuxStaticRenditions(assetId);
};

export default uploadVideoToMux;
