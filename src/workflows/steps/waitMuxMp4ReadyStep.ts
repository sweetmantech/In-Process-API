import { findMuxAssetIdFromPlaybackUrl } from '@/lib/mux/findMuxAssetIdFromPlaybackUrl';
import getMuxStaticRenditions, {
  MuxRenditionsResult,
} from '@/lib/mux/getMuxStaticRenditions';

export default async function waitMuxMp4ReadyStep(
  playbackUrl: string
): Promise<MuxRenditionsResult | null> {
  'use step';

  const assetId = await findMuxAssetIdFromPlaybackUrl(playbackUrl);
  if (!assetId)
    throw new Error('Could not resolve Mux asset ID from playback URL');

  const result = await getMuxStaticRenditions(assetId);
  return result;
}
