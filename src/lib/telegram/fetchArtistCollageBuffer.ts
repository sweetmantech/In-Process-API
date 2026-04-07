import { CHAIN_ID } from '../consts';

const fetchArtistCollageBuffer = async (
  artistAddress: string
): Promise<Buffer | null> => {
  try {
    const url = `https://in-process-api.vercel.app/api/og/artist/collage?artistAddress=${encodeURIComponent(artistAddress)}&chainId=${CHAIN_ID}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch (e) {
    console.error('[fetchArtistCollageBuffer] failed to fetch collage:', e);
    return null;
  }
};

export default fetchArtistCollageBuffer;
