import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import chunkUploadSessionBodySchema from '@/lib/schema/chunkUploadSessionBodySchema';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';

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

  return { artistAddress: authResult.artistAddress, ...parsed.data };
};

export default validateCreateChunkUploadSession;
