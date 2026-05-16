import mux from '@/lib/mux';

const getMuxAssetId = async (uploadId: string): Promise<string> => {
  const upload = await mux.video.uploads.retrieve(uploadId);
  if (upload.asset_id) return upload.asset_id;
  throw new Error('Mux asset ID did not appear in time');
};

export default getMuxAssetId;
