import mux from '@/lib/mux';
import { retriesGeneric } from '@/lib/protocolSdk/retries';
import type { MuxUploadResult } from './uploadVideoToMux';

const pollMuxAsset = async (uploadId: string): Promise<MuxUploadResult> => {
  return retriesGeneric({
    maxTries: 60,
    linearBackoffMS: 100,
    tryFn: async () => {
      const upload = await mux.video.uploads.retrieve(uploadId);
      if (upload.asset_id) {
        const asset = await mux.video.assets.retrieve(upload.asset_id);
        const playbackId = asset.playback_ids?.[0]?.id;
        const files = asset.static_renditions?.files ?? [];
        const renditionsReady =
          asset.static_renditions?.status === 'ready' ||
          files.some((f) => f.name === 'highest.mp4' && f.status === 'ready');

        if (asset.status === 'ready' && playbackId && renditionsReady) {
          return {
            playbackUrl: `https://stream.mux.com/${playbackId}.m3u8`,
            downloadUrl: `https://stream.mux.com/${playbackId}/highest.mp4`,
          };
        }
      }
      throw new Error('Asset not ready');
    },
  }).catch(() => {
    throw new Error('Mux asset processing timeout');
  });
};

export default pollMuxAsset;
