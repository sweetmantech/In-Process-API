import { mediaStreamSchema } from '@/lib/schema/mediaStreamSchema';
import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/schema/validate';
import { getFetchableUrl } from '@/lib/protocolSdk/ipfs/gateway';
import getContentInfo from './getContentInfo';

export const validateMediaStream = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const queryParams = {
    url: searchParams.get('url') ?? undefined,
  };

  const validationResult = validate(mediaStreamSchema, queryParams);
  if (!validationResult.success) {
    return validationResult.response;
  }

  const { url } = validationResult.data;

  const fetchableUrl = getFetchableUrl(url);
  if (!fetchableUrl) {
    return NextResponse.json(
      { error: 'Invalid or unsupported URL format' },
      { status: 400 }
    );
  }

  const contentInfo = await getContentInfo(fetchableUrl);

  if (!contentInfo.ok) {
    return NextResponse.json(
      {
        error: `Origin returned ${contentInfo.status}: ${contentInfo.statusText}`,
      },
      { status: contentInfo.status }
    );
  }

  const { totalSize, supportsRange, contentType, finalUrl } = contentInfo;

  if (!totalSize) {
    return NextResponse.json(
      { error: 'Unable to determine content length' },
      { status: 502 }
    );
  }

  const rangeHeader = request.headers.get('range');

  return {
    fetchableUrl: finalUrl,
    totalSize,
    supportsRange,
    contentType,
    rangeHeader,
  };
};
