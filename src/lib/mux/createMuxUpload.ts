import mux from '@/lib/mux';

const createMuxUpload = async (): Promise<{
  uploadUrl: string;
  uploadId: string;
}> => {
  const upload = await mux.video.uploads.create({
    cors_origin: '*',
    new_asset_settings: {
      playback_policy: ['public'],
      video_quality: 'basic',
      static_renditions: [{ resolution: 'highest' }],
      master_access: 'temporary',
    },
  });

  return { uploadUrl: upload.url, uploadId: upload.id };
};

export default createMuxUpload;
