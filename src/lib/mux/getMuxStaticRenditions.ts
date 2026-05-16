import mux from '@/lib/mux';

export interface MuxRenditionsResult {
  playbackUrl: string;
  downloadUrl: string;
}

const getMuxStaticRenditions = async (
  assetId: string
): Promise<MuxRenditionsResult | null> => {
  const asset = await mux.video.assets.retrieve(assetId);
  const files = asset.static_renditions?.files ?? [];
  const renditionsReady =
    asset.static_renditions?.status === 'ready' ||
    files.some((f) => f.name === 'highest.mp4' && f.status === 'ready');

  if (!renditionsReady) return null;

  const playbackId = asset.playback_ids?.[0]?.id;
  if (!playbackId) return null;

  return {
    playbackUrl: `https://stream.mux.com/${playbackId}.m3u8`,
    downloadUrl: `https://stream.mux.com/${playbackId}/highest.mp4`,
  };
};

export default getMuxStaticRenditions;
