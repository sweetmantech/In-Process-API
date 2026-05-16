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

  while (true) {
    const result = await getMuxStaticRenditions(assetId);
    if (result) return result;
    await new Promise((resolve) => setTimeout(resolve, 20_000));
  }
};

export default uploadVideoToMux;
