import { findMuxAssetIdFromPlaybackUrl } from '@/lib/mux/findMuxAssetIdFromPlaybackUrl';
import pollMuxStaticRenditions from '@/lib/mux/pollMuxStaticRenditions';

export default async function waitMuxMp4ReadyStep(
  playbackUrl: string
): Promise<void> {
  'use step';

  const assetId = await findMuxAssetIdFromPlaybackUrl(playbackUrl);
  if (!assetId)
    throw new Error('Could not resolve Mux asset ID from playback URL');

  await pollMuxStaticRenditions(assetId);
}
