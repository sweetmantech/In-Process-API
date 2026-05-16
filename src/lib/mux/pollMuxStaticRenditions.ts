import mux from '@/lib/mux';

const POLL_INTERVAL_MS = 10_000;

export interface MuxRenditionsResult {
  playbackUrl: string;
  downloadUrl: string;
}

const pollMuxStaticRenditions = async (
  assetId: string
): Promise<MuxRenditionsResult> => {
  while (true) {
    const asset = await mux.video.assets.retrieve(assetId);
    const files = asset.static_renditions?.files ?? [];
    const renditionsReady =
      asset.static_renditions?.status === 'ready' ||
      files.some((f) => f.name === 'highest.mp4' && f.status === 'ready');

    if (renditionsReady) {
      const playbackId = asset.playback_ids?.[0]?.id;
      if (!playbackId) throw new Error('No playback ID found for Mux asset');

      return {
        playbackUrl: `https://stream.mux.com/${playbackId}.m3u8`,
        downloadUrl: `https://stream.mux.com/${playbackId}/highest.mp4`,
      };
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
};

export default pollMuxStaticRenditions;
