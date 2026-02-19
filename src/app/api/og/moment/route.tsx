import { NextRequest } from 'next/server';
import { getFetchableUrl } from '@/lib/protocolSdk/ipfs/gateway';
import { OG_HEIGHT, OG_WIDTH } from '@/lib/og/consts';
import { getMomentAdvancedInfo } from '@/lib/moment/getMomentAdvancedInfo';
import { CHAIN_ID } from '@/lib/consts';
import { fetchTokenMetadata } from '@/lib/protocolSdk/ipfs/token-metadata';
import { archivoFont, spectralFont } from '@/lib/og/fonts';
import getWritingData from '@/lib/og/getWritingData';
import getMomentImageData from '@/lib/og/getMomentImageData';
import WritingPreview from '@/components/Og/WritingPreview';
import ImagePreview from '@/components/Og/ImagePreview';
import { WRITING_MAX_LINES, WRITING_SHORT_LINES } from '@/lib/og/consts';

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

  const { uri } = await getMomentAdvancedInfo(moment);
  if (!uri) throw Error('failed to get moment uri');

  const metadataUrl = getFetchableUrl(uri);
  if (!metadataUrl) throw Error('failed to convert uri to fetchable url');
  const metadata = await fetchTokenMetadata(metadataUrl);
  if (!metadata) throw Error('failed to get token metadata');

  const isWriting = metadata.content?.mime === 'text/plain';
  const previewBackgroundUrl = getFetchableUrl(metadata.image);

  let writingText = '';
  let totalLines = 0;
  let imageMetadata = null;

  if (isWriting) {
    ({ writingText, totalLines } = await getWritingData(metadata.content?.uri));
  } else if (previewBackgroundUrl) {
    imageMetadata = await getMomentImageData(previewBackgroundUrl);
  }

  const { ImageResponse } = await import('@vercel/og');
  const [archivoFontData, spectralFontData] = await Promise.all([
    archivoFont,
    spectralFont,
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
