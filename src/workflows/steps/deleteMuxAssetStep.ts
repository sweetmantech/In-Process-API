import { findMuxAssetIdFromPlaybackUrl } from '@/lib/mux/findMuxAssetIdFromPlaybackUrl';
import { deleteMuxAsset } from '@/lib/mux/deleteAsset';

export default async function deleteMuxAssetStep(
  playbackUrl: string
): Promise<void> {
  'use step';
  const assetId = await findMuxAssetIdFromPlaybackUrl(playbackUrl);
  if (assetId) await deleteMuxAsset(assetId);
}
