import { NextRequest } from 'next/server';
import { Address } from 'viem';
import getArtistTimeline from '@/lib/supabase/in_process_moments/getArtistTimeline';
import getArtistProfile from '@/lib/getArtistProfile';
import truncateAddress from '@/lib/truncateAddress';
import getArchivoFont from '@/lib/og/getArchivoFont';
import getImageMetadata from '@/lib/og/getImageMetadata';
import CollageGrid from '@/components/Og/CollageGrid';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const COLLAGE_SIZE = 500;
const MAX_IMAGES = 15;
const IMAGE_TIMEOUT_MS = 5000;

export async function GET(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams;
  const artistAddress = queryParams.get('artistAddress');
  const chainId = queryParams.get('chainId');

  if (!artistAddress) {
    return Response.json(
      { message: 'artistAddress is required' },
      { status: 400 }
    );
  }

  const chainIdNum = chainId ? parseInt(chainId, 10) : undefined;
  const normalizedAddress = artistAddress.toLowerCase() as Address;

  const [{ data: timelineData }, { username }] = await Promise.all([
    getArtistTimeline({
      artist: normalizedAddress,
      limit: 100,
      page: 1,
      chainId: chainIdNum,
      mime: 'image/%',
    }),
    getArtistProfile(normalizedAddress),
  ]);

  const moments = timelineData?.moments ?? [];

  const imageMoments = moments
    .filter((m) => (m.metadata as any)?.image)
    .slice(0, MAX_IMAGES);

  const timeout = (ms: number) =>
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));

  const imageResults = await Promise.allSettled(
    imageMoments.map((m) =>
      Promise.race([
        getImageMetadata((m.metadata as any).image),
        timeout(IMAGE_TIMEOUT_MS),
      ])
    )
  );

  const imageDataUrls = imageResults
    .map((r) =>
      r.status === 'fulfilled' ? (r.value?.previewUrl ?? null) : null
    )
    .filter((url): url is string => url !== null);

  const { ImageResponse } = await import('next/og');
  const archivoFontData = await getArchivoFont();
  const artistName = username || truncateAddress(normalizedAddress);

  return new ImageResponse(
    <CollageGrid
      imageDataUrls={imageDataUrls}
      artistName={artistName}
      size={COLLAGE_SIZE}
    />,
    {
      width: COLLAGE_SIZE,
      height: COLLAGE_SIZE,
      fonts: [{ name: 'Archivo', data: archivoFontData, weight: 400 }],
    }
  );
}
