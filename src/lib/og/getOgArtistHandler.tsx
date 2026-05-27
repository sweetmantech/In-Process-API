import type { z } from 'zod';
import { ImageResponse } from 'next/og';
import { OG_HEIGHT, OG_WIDTH } from '@/lib/og/consts';
import { Address } from 'viem';
import getImageMetadata from '@/lib/og/getImageMetadata';
import ArtistInfo from '@/components/Og/ArtistInfo';
import ImagePreview from '@/components/Og/ImagePreview';
import WritingPreview from '@/components/Og/WritingPreview';
import NoMoments from '@/components/Og/NoMoments';
import fetchUri from '@/lib/arweave/fetchUri';
import getArtistProfile from '@/lib/artists/getArtistProfile';
import truncateAddress from '@/lib/truncateAddress';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';
import { fetchTokenMetadata } from '@/lib/protocolSdk/ipfs/token-metadata';
import { TokenMetadataJson } from '@/lib/protocolSdk/ipfs/types';
import { SITE_ORIGINAL_URL } from '@/lib/consts';
import getOgFonts from '@/lib/og/getOgFonts';
import { ogArtistQuerySchema } from '@/lib/og/validateOgArtistQuery';

const getOgArtistHandler = async ({
  artistAddress,
  chainId,
}: z.infer<typeof ogArtistQuerySchema>) => {
  const { data: moments } = await selectMoments({
    artists: [artistAddress?.toLowerCase() as Address],
    chainId,
  });

  let metadata: TokenMetadataJson | null = null;
  const moment = moments?.[0];
  if (moment) {
    metadata = await fetchTokenMetadata(moment.uri);
  }

  const profile = await getArtistProfile(
    artistAddress?.toLowerCase() as Address
  );
  const username = profile?.username;

  const { archivo, spectral } = await getOgFonts();

  let writingText = '';
  let totalLines = 0;
  let imageMetadata = null;

  if (metadata) {
    if (metadata.content?.mime === 'text/plain') {
      const contentUri = metadata.content?.uri;
      let contentResponse: Response | null = null;
      if (contentUri)
        contentResponse = await fetchUri(contentUri).catch(() => null);
      if (contentResponse?.ok) {
        const data = await contentResponse.text();
        writingText = data;
        const paragraphs = writingText.split('\n');
        paragraphs.map(
          (paragraph) =>
            (totalLines =
              totalLines +
              parseInt(Number(paragraph.length / 32).toFixed()) +
              1)
        );
      }
    } else {
      imageMetadata = await getImageMetadata(metadata.image);
    }
  }

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        paddingTop: 48,
        paddingBottom: 48,
        paddingLeft: 32,
        paddingRight: 32,
        display: 'flex',
        justifyContent: 'space-between',
        background: `url('${SITE_ORIGINAL_URL}/bg-gray.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <ArtistInfo
        nickName={username || truncateAddress(artistAddress as Address)}
      />
      <div
        style={{
          display: 'flex',
          width: '65%',
          height: '100%',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#E0DDD8',
          overflow: 'hidden',
          borderRadius: 18,
        }}
      >
        {metadata ? (
          <>
            {metadata.content?.mime === 'text/plain' ? (
              <WritingPreview
                writingText={writingText}
                totalLines={totalLines}
              />
            ) : (
              <ImagePreview imageMetadata={imageMetadata} />
            )}
          </>
        ) : (
          <NoMoments />
        )}
      </div>
    </div>,
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts: [
        { name: 'Archivo', data: archivo, weight: 400 },
        { name: 'Spectral', data: spectral, weight: 400 },
      ],
    }
  );
};

export default getOgArtistHandler;
