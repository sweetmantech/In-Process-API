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
const MAX_IMAGES = 30;
const IMAGE_TIMEOUT_MS = 10000;

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
  const totalMoments = (timelineData?.pagination.total_pages ?? 1) * 100;

  // moments is newest-first; filter without slicing so all candidates are tried
  const imageMoments = moments.filter((m) => m.metadata?.image);

  // Race: collect first MAX_IMAGES successful fetches, then cancel the rest.
  // Sort by original index descending so oldest (highest index) comes first.
  const imageDataUrls = await new Promise<string[]>((resolve) => {
    if (imageMoments.length === 0) {
      resolve([]);
      return;
    }

    const collected: { index: number; url: string }[] = [];
    let settled = 0;
    let done = false;
    const total = imageMoments.length;
    const controllers = imageMoments.map(() => new AbortController());

    const finish = () => {
      if (done) return;
      done = true;
      controllers.forEach((c) => c.abort());
      collected.sort((a, b) => b.index - a.index);
      resolve(collected.slice(0, MAX_IMAGES).map((r) => r.url));
    };

    imageMoments.forEach((m, i) => {
      const timer = setTimeout(() => controllers[i].abort(), IMAGE_TIMEOUT_MS);
      getCollageImageData(m.metadata!.image, controllers[i].signal)
        .then((url) => {
          if (done || url === null) return;
          collected.push({ index: i, url });
          if (collected.length >= MAX_IMAGES) finish();
        })
        .catch(() => {})
        .finally(() => {
          clearTimeout(timer);
          settled++;
          if (settled === total) finish();
        });
    });
  });

  const { ImageResponse } = await import('next/og');
  const archivoFontData = await getArchivoFont();
  const artistName = username || truncateAddress(normalizedAddress);

  return new ImageResponse(
    <CollageGrid
      imageDataUrls={imageDataUrls}
      artistName={artistName}
      totalMoments={totalMoments}
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
