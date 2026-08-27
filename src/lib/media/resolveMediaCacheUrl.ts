import getMediaCachePublicUrl from '@/lib/media/getMediaCachePublicUrl';

const resolveMediaCacheUrl = async (path: string): Promise<string | null> => {
  const publicUrl = getMediaCachePublicUrl(path);
  try {
    const response = await fetch(publicUrl, { method: 'HEAD' });
    return response.ok ? publicUrl : null;
  } catch {
    return null;
  }
};

export default resolveMediaCacheUrl;
