import mux from './index';

export const findMuxAssetIdFromPlaybackUrl = async (
  playbackUrl: string
): Promise<string | null> => {
  try {
    const match = playbackUrl.match(/stream\.mux\.com\/([^/]+)\.m3u8/);
    if (!match) return null;
    const playbackId = match[1];
    const playbackInfo = await mux.video.playbackIds.retrieve(playbackId);
    return playbackInfo.object?.id ?? null;
  } catch (error: any) {
    console.error(
      'findMuxAssetIdFromPlaybackUrl error:',
      error?.message ?? error
    );
    return null;
  }
};
