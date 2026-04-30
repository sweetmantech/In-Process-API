import type { z } from 'zod';
import { ImageResponse } from 'next/og';
import {
  OG_HEIGHT,
  OG_WIDTH,
  WRITING_MAX_LINES,
  WRITING_SHORT_LINES,
} from '@/lib/og/consts';
import { resolveMomentInfo } from '@/lib/moment/resolveMomentInfo';
import { fetchTokenMetadata } from '@/lib/protocolSdk/ipfs/token-metadata';
import getOgFonts from '@/lib/og/getOgFonts';
import getWritingData from '@/lib/og/getWritingData';
import getMomentPreview from '@/lib/og/getMomentPreview';
import { ImageMetadata } from '@/types/og';
import WritingPreview from '@/components/Og/WritingPreview';
import ImagePreview from '@/components/Og/ImagePreview';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import normalizeMetadata from '@/lib/metadata/normalizeMetadata';
import { momentSchema } from '@/lib/schema/momentSchema';

const getOgMomentHandler = async ({
  collectionAddress,
  tokenId,
  chainId,
}: z.infer<typeof momentSchema>) => {
  const moment = {
    collectionAddress,
    tokenId,
    chainId,
  };

  let uri: string | null = null;
  let customGateway: string | undefined;

  const { data: collections } = await selectCollections({
    collections: [
      { address: moment.collectionAddress, chainId: moment.chainId },
    ],
  });
  const collection = collections?.[0];
  const isCatalog = collection && collection.protocol === 'catalog';

  if (collection)
    customGateway = isCatalog ? 'https://gateway.irys.xyz/mutable/' : undefined;

  if (moment.tokenId === '0') {
    if (!collection) throw Error('no collection');
    uri = collection.uri;
  } else {
    const { uri: momentUri } = await resolveMomentInfo(moment);
    uri = momentUri;
  }

  if (!uri) throw Error('failed to get moment uri');

  const rawMetadata = await fetchTokenMetadata(uri, customGateway);
  if (!rawMetadata) throw Error('failed to get token metadata');
  const metadata = await normalizeMetadata(rawMetadata);

  const isWriting = metadata.content?.mime === 'text/plain';

  let writingText = '';
  let totalLines = 0;
  let imageMetadata: ImageMetadata | null = null;

  if (isWriting && metadata.content?.uri) {
    ({ writingText, totalLines } = await getWritingData(metadata.content.uri));
  } else if (metadata.image) {
    imageMetadata = await getMomentPreview(
      isCatalog
        ? metadata.image.replace(
            /^ar:\/\//,
            'https://gateway.irys.xyz/mutable/'
          )
        : metadata.image
    );
  }

  const { archivo, spectral } = await getOgFonts();

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'relative',
        alignItems: 'center',
        backgroundColor: '#E0DDD8',
      }}
    >
      {isWriting ? (
        <WritingPreview
          writingText={writingText}
          totalLines={totalLines}
          maxLines={WRITING_MAX_LINES}
          shortLines={WRITING_SHORT_LINES}
          padding={32}
        />
      ) : (
        <ImagePreview imageMetadata={imageMetadata} containerWidth={OG_WIDTH} />
      )}
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

export default getOgMomentHandler;
