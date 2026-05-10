import type { Asset } from '@mux/mux-node/resources/video/assets';

export function h264UrlFromAsset(asset: Asset): string | null {
  const playbackId = asset.playback_ids?.[0]?.id;
  const files = asset.static_renditions?.files?.filter(
    (f) => f.ext === 'mp4' && f.bitrate
  );
  if (
    !playbackId ||
    !files?.length ||
    asset.static_renditions?.status !== 'ready'
  ) {
    return null;
  }
  const best = [...files].sort(
    (a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0)
  )[0];
  return `https://stream.mux.com/${playbackId}/${best.name}`;
}

export function getMuxH264Url(playbackUrl: string): string | null {
  const match = playbackUrl.match(/stream\.mux\.com\/([^/]+)\.m3u8/);
  if (!match) return null;
  return `https://stream.mux.com/${match[1]}/highest.mp4`;
}
