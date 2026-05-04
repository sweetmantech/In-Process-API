import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import chunkUploadSessionBodySchema from '@/lib/schema/chunkUploadSessionBodySchema';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import getChunkUploadType from './getChunkUploadType';
import getUsdcForChunkUpload from './getUsdcForChunkUpload';

const validateCreateChunkUploadSession = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = validate(chunkUploadSessionBodySchema, body);
  if (!parsed.success) return parsed.response;

  const { data } = parsed;
  const artistAddress = authResult.artistAddress;

  const { data: artistRows, error: artistError } = await selectArtists({
    address: artistAddress,
  });
  if (artistError) {
    console.error('selectArtists', artistError);
    return NextResponse.json(
      { message: 'Failed to verify artist profile' },
      { status: 500 }
    );
  }
  if (!artistRows?.[0]?.username?.trim()) {
    return NextResponse.json(
      {
        message:
          'Artist username must be set before creating a chunk upload session',
      },
      { status: 403 }
    );
  }

  const uploadTypeResult = await getChunkUploadType(
    artistAddress,
    data.total_size_bytes
  );
  if ('error' in uploadTypeResult) {
    return NextResponse.json(
      { message: uploadTypeResult.error },
      { status: uploadTypeResult.status }
    );
  }
  const { uploadType } = uploadTypeResult;

  let usdcAmount: number | undefined;
  if (uploadType === 'paid') {
    const usdcResult = await getUsdcForChunkUpload(
      artistAddress,
      data.total_size_bytes!
    );
    if ('error' in usdcResult) {
      return NextResponse.json(
        {
          message: usdcResult.error,
          required: usdcResult.required,
          available: usdcResult.available,
          ...(usdcResult.smart_wallet !== undefined && {
            smart_wallet: usdcResult.smart_wallet,
          }),
        },
        { status: usdcResult.status }
      );
    }
    usdcAmount = usdcResult.usdcAmount;
  }

  return { artistAddress, ...data, uploadType, usdcAmount };
};

export default validateCreateChunkUploadSession;
