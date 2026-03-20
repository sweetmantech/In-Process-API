import mux from '@/lib/mux';
import type { MuxUploadResult } from './uploadVideoToMux';

const pollMuxAsset = async (uploadId: string): Promise<MuxUploadResult> => {
  const maxRetries = 60;
  const delayMs = 3000;

  for (let i = 0; i < maxRetries; i++) {
    const upload = await mux.video.uploads.retrieve(uploadId);
    if (upload.asset_id) {
      const asset = await mux.video.assets.retrieve(upload.asset_id);
      if (asset.status === 'ready' && asset.playback_ids?.[0]) {
        return {
          playbackUrl: `https://stream.mux.com/${asset.playback_ids[0].id}.m3u8`,
          downloadUrl: asset.master?.url ?? '',
        };
      }
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error('Mux asset processing timeout');
};

export default pollMuxAsset;
