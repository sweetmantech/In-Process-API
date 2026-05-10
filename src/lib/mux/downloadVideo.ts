import getBlob from '@/lib/getBlob';

export const downloadVideo = async (downloadUrl: string): Promise<File> => {
  const { blob } = await getBlob(downloadUrl);

  let filename = 'video.mp4';
  try {
    const pathname = new URL(downloadUrl).pathname;
    const last = pathname.split('/').filter(Boolean).pop();
    if (last) filename = decodeURIComponent(last);
  } catch {
    const last = downloadUrl.split('?')[0].split('/').filter(Boolean).pop();
    if (last) filename = last;
  }

  return new File([blob], filename, { type: blob.type || 'video/mp4' });
};
