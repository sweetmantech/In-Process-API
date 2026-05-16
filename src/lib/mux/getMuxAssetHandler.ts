import { NextResponse } from 'next/server';
import mux from '@/lib/mux';

const getMuxAssetHandler = async (uploadId: string): Promise<NextResponse> => {
  const upload = await mux.video.uploads.retrieve(uploadId);

  if (!upload.asset_id) {
    return NextResponse.json({
      status: 'processing',
      message: 'Asset creation in progress',
    });
  }

  const asset = await mux.video.assets.retrieve(upload.asset_id);

  if (asset?.status !== 'ready') {
    return NextResponse.json({
      status: asset.status ?? 'preparing',
      message: 'Video processing in progress',
      assetId: upload.asset_id,
    });
  }

  const playbackId = asset.playback_ids?.[0]?.id ?? null;

  return NextResponse.json({
    playbackUrl: playbackId
      ? `https://stream.mux.com/${playbackId}.m3u8`
      : null,
    assetId: upload.asset_id,
    downloadUrl: playbackId
      ? `https://stream.mux.com/${playbackId}/highest.mp4`
      : null,
    status: asset.status,
  });
};

export default getMuxAssetHandler;
