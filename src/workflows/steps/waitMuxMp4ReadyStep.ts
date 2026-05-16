import { findMuxAssetIdFromPlaybackUrl } from '@/lib/mux/findMuxAssetIdFromPlaybackUrl';
import getMuxStaticRenditions from '@/lib/mux/getMuxStaticRenditions';
import { sleep } from 'workflow';

export default async function waitMuxMp4ReadyStep(
  playbackUrl: string
): Promise<void> {
  'use step';

  const assetId = await findMuxAssetIdFromPlaybackUrl(playbackUrl);
  if (!assetId)
    throw new Error('Could not resolve Mux asset ID from playback URL');

  while (true) {
    const result = await getMuxStaticRenditions(assetId);
    if (result) return;
    await sleep('20 seconds');
  }
}
