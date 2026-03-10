import { NextRequest } from 'next/server';
import { OG_HEIGHT, OG_WIDTH } from '@/lib/og/consts';
import { getMomentAdvancedInfo } from '@/lib/moment/getMomentAdvancedInfo';
import { CHAIN_ID } from '@/lib/consts';
import { fetchTokenMetadata } from '@/lib/protocolSdk/ipfs/token-metadata';
import getArchivoFont from '@/lib/og/getArchivoFont';
import getSpectralFont from '@/lib/og/getSpectralFont';
import getWritingData from '@/lib/og/getWritingData';
import getMomentImageData from '@/lib/og/getMomentImageData';
import { ImageMetadata } from '@/types/og';
import WritingPreview from '@/components/Og/WritingPreview';
import ImagePreview from '@/components/Og/ImagePreview';
import { WRITING_MAX_LINES, WRITING_SHORT_LINES } from '@/lib/og/consts';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import normalizeMetadata from '@/lib/metadata/normalizeMetadata';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams;
  const collectionAddress = queryParams.get('collectionAddress');
  const tokenId = queryParams.get('tokenId');
  const chainId = queryParams.get('chainId');

  if (!tokenId || !collectionAddress)
    throw Error('collectionAddress or tokenId should be provided.');

  const moment = {
    collectionAddress: collectionAddress.toLowerCase() as `0x${string}`,
    tokenId,
    chainId: Number(chainId || CHAIN_ID),
  };

  let uri: string | null = null;
  let customGateway: string | undefined;

  const { data: collections } = await selectCollections({
    collectionAddress: moment.collectionAddress,
    chainId: moment.chainId,
  });
  const collection = collections?.[0];

  if (collection)
    customGateway =
      collection.protocol === 'catalog'
        ? 'https://gateway.irys.xyz/mutable/'
        : undefined;

  if (moment.tokenId === '0') {
    if (!collection) throw Error('no collection');
    uri = collection.uri;
  } else {
    const { uri: momentUri } = await getMomentAdvancedInfo(moment);
    uri = momentUri;
  }

  if (!uri) throw Error('failed to get moment uri');

  const rawMetadata = await fetchTokenMetadata(uri, customGateway);
  if (!rawMetadata) throw Error('failed to get token metadata');
  const metadata = normalizeMetadata(rawMetadata);

  const isWriting = metadata.content?.mime === 'text/plain';

  let writingText = '';
  let totalLines = 0;
  let imageMetadata: ImageMetadata | null = null;

  if (isWriting && metadata.content?.uri) {
    ({ writingText, totalLines } = await getWritingData(metadata.content.uri));
  } else if (metadata.image) {
    imageMetadata = await getMomentImageData(metadata.image);
  }

  const { ImageResponse } = await import('next/og');
  const [archivoFontData, spectralFontData] = await Promise.all([
    getArchivoFont(),
    getSpectralFont(),
  ]);

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
        { name: 'Archivo', data: archivoFontData, weight: 400 },
        { name: 'Spectral', data: spectralFontData, weight: 400 },
      ],
    }
  );
}
