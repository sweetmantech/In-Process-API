import createMuxUpload from './createMuxUpload';
import pollMuxAsset from './pollMuxAsset';

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

  return pollMuxAsset(uploadId);
};

export default uploadVideoToMux;
