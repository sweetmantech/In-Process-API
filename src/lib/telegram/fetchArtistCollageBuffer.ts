import { SITE_ORIGINAL_URL } from '@/lib/consts';

const fetchArtistCollageBuffer = async (
  artistAddress: string
): Promise<Buffer | null> => {
  try {
    const url = `${SITE_ORIGINAL_URL}/api/og/artist/collage?artistAddress=${encodeURIComponent(artistAddress)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
};

export default fetchArtistCollageBuffer;
