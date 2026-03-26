import { NextRequest } from 'next/server';
import getArtistTimeline from '@/lib/supabase/in_process_moments/getArtistTimeline';
import getArtistProfile from '@/lib/getArtistProfile';
import truncateAddress from '@/lib/truncateAddress';
import { SITE_ORIGINAL_URL } from '@/lib/consts';
import getArchivoFont from '@/lib/og/getArchivoFont';
import getCollageImageData from '@/lib/og/getCollageImageData';
import CollageGrid from '@/components/Og/CollageGrid';
import artistCollageQuerySchema from '@/lib/schema/artistCollageQuerySchema';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const COLLAGE_SIZE = 500;
const MAX_IMAGES = 15;
const IMAGE_TIMEOUT_MS = 5000;

export async function GET(req: NextRequest) {
  const result = artistCollageQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  if (!result.success) {
    return Response.json(
      { message: 'Invalid query params', errors: result.error.issues },
      { status: 400 }
    );
  }
  const { artistAddress: normalizedAddress, chainId: chainIdNum } = result.data;

  const [{ data: timelineData }, { username }] = await Promise.all([
    getArtistTimeline({
      artist: normalizedAddress,
      limit: 100,
      page: 1,
      chainId: chainIdNum,
    }),
    getArtistProfile(normalizedAddress),
  ]);

  const moments = timelineData?.moments ?? [];

  const imageMoments = moments
    .filter((m) => m.metadata?.mime.startsWith('image/') && m.metadata?.uri)
    .slice(0, MAX_IMAGES);

  const imageResults = await Promise.allSettled(
    imageMoments.map((m) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);
      return getCollageImageData(m.metadata!.uri, controller.signal).finally(
        () => clearTimeout(timer)
      );
    })
  );

  const imageDataUrls = imageResults
    .map((r) => (r.status === 'fulfilled' ? r.value : null))
    .filter((url): url is string => url !== null)
    .reverse();

  const { ImageResponse } = await import('next/og');
  const archivoFontData = await getArchivoFont();
  const artistName = username || truncateAddress(normalizedAddress);

  return new ImageResponse(
    <CollageGrid
      imageDataUrls={imageDataUrls}
      artistName={artistName}
      backgroundUrl={`${SITE_ORIGINAL_URL}/bg-gray.png`}
      size={COLLAGE_SIZE}
    />,
    {
      width: COLLAGE_SIZE,
      height: COLLAGE_SIZE,
      fonts: [{ name: 'Archivo', data: archivoFontData, weight: 400 }],
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
