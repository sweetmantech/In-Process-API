import type { z } from 'zod';
import { ImageResponse } from 'next/og';
import type artistCollageQuerySchema from '@/lib/schema/artistCollageQuerySchema';
import getArtistTimeline from '@/lib/supabase/in_process_moments/getArtistTimeline';
import getArtistProfile from '@/lib/getArtistProfile';
import truncateAddress from '@/lib/truncateAddress';
import { SITE_ORIGINAL_URL } from '@/lib/consts';
import getArchivoFont from '@/lib/og/getArchivoFont';
import collectCollageImages from '@/lib/og/collectCollageImages';
import CollageGrid from '@/components/Og/CollageGrid';

const COLLAGE_WIDTH = 700;
const COLLAGE_HEIGHT = 350;
const MAX_COLLAGE_IMAGES = 5;

const getArtistCollageHandler = async ({
  artistAddress,
  chainId,
}: z.infer<typeof artistCollageQuerySchema>) => {
  const [{ data: timelineData }, { username }] = await Promise.all([
    getArtistTimeline({
      artist: artistAddress,
      limit: 100,
      page: 1,
      chainId,
    }),
    getArtistProfile(artistAddress),
  ]);

  const moments = timelineData?.moments ?? [];
  const totalMoments = (timelineData?.pagination.total_pages ?? 1) * 100;

  const imageInputs = moments
    .filter((m) => m.metadata?.image)
    .map((m) => ({ imageUrl: m.metadata!.image, createdAt: m.created_at }));

  const collageImages = await collectCollageImages(
    imageInputs.slice(0, MAX_COLLAGE_IMAGES)
  );

  const archivoFontData = await getArchivoFont();
  const artistName = username || truncateAddress(artistAddress);

  return new ImageResponse(
    <CollageGrid
      images={collageImages}
      artistName={artistName}
      totalMoments={totalMoments}
      backgroundUrl={`${SITE_ORIGINAL_URL}/bg-gray.png`}
      width={COLLAGE_WIDTH}
      height={COLLAGE_HEIGHT}
    />,
    {
      width: COLLAGE_WIDTH,
      height: COLLAGE_HEIGHT,
      fonts: [{ name: 'Archivo', data: archivoFontData, weight: 400 }],
      headers: { 'Cache-Control': 'no-store' },
    }
  );
};

export default getArtistCollageHandler;
