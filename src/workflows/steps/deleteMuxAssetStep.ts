import { findMuxAssetIdFromPlaybackUrl } from '@/lib/mux/findMuxAssetIdFromPlaybackUrl';
import { deleteMuxAsset } from '@/lib/mux/deleteAsset';

export default async function deleteMuxAssetStep(
  playbackUrl: string
): Promise<{ assetId: string | null; deleted: boolean }> {
  'use step';
  const assetId = await findMuxAssetIdFromPlaybackUrl(playbackUrl);
  if (!assetId) return { assetId: null, deleted: false };
  await deleteMuxAsset(assetId);
  return { assetId, deleted: true };
}
