import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import chunkUploadSessionBodySchema from '@/lib/schema/chunkUploadSessionBodySchema';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import getCompletedFreeUploads from '@/lib/supabase/in_process_chunk_upload_sessions/getCompletedFreeUploads';
import { FREE_TIER_MAX_BYTES, FREE_UPLOADS_PER_MONTH } from '@/lib/consts';

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

  if (
    parsed.data.total_size_bytes !== undefined &&
    parsed.data.total_size_bytes > FREE_TIER_MAX_BYTES
  ) {
    return NextResponse.json(
      { message: 'File size exceeds the free tier limit' },
      { status: 413 }
    );
  }

  const { data: artistRows, error: artistError } = await selectArtists({
    address: authResult.artistAddress,
  });

  if (artistError) {
    console.error('selectArtists', artistError);
    return NextResponse.json(
      { message: 'Failed to verify artist profile' },
      { status: 500 }
    );
  }

  const artist = artistRows?.[0];
  if (!artist?.username?.trim()) {
    return NextResponse.json(
      {
        message:
          'Artist username must be set before creating a chunk upload session',
      },
      { status: 403 }
    );
  }

  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();
  const monthEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  ).toISOString();

  const { count, error: countError } = await getCompletedFreeUploads(
    authResult.artistAddress,
    monthStart,
    monthEnd
  );
  if (countError) {
    console.error('getCompletedFreeUploads', countError);
    return NextResponse.json(
      { message: 'Failed to check upload quota' },
      { status: 500 }
    );
  }
  if ((count ?? 0) >= FREE_UPLOADS_PER_MONTH) {
    return NextResponse.json(
      { message: 'Monthly free upload limit reached' },
      { status: 403 }
    );
  }

  return { artistAddress: authResult.artistAddress, ...parsed.data };
};

export default validateCreateChunkUploadSession;
