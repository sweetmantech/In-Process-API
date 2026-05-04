import { NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase/types';

type ChunkUploadSessionRow =
  Database['public']['Tables']['in_process_chunk_upload_sessions']['Row'];

/** Columns returned by `getChunkUploadSession` — all fields checked by this gate. */
type ChunkUploadSessionGateRow = Pick<
  ChunkUploadSessionRow,
  'id' | 'status' | 'expires_at' | 'artist_address' | 'total_chunks'
>;

type GateResult =
  | { ok: false; response: NextResponse }
  | { ok: true; session: ChunkUploadSessionGateRow };

const rejectUnlessUsableChunkUploadSession = (
  session: ChunkUploadSessionGateRow | null | undefined,
  fetchError: unknown,
  artistAddress: string
): GateResult => {
  if (fetchError || !session) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: 'Upload session not found' },
        { status: 404 }
      ),
    };
  }

  if (session.status !== 'open') {
    return {
      ok: false,
      response: NextResponse.json(
        { message: 'Upload session is not open' },
        { status: 400 }
      ),
    };
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: 'Upload session expired' },
        { status: 410 }
      ),
    };
  }

  if (session.artist_address.toLowerCase() !== artistAddress.toLowerCase()) {
    return {
      ok: false,
      response: NextResponse.json({ message: 'Forbidden' }, { status: 403 }),
    };
  }

  return { ok: true, session };
};

export default rejectUnlessUsableChunkUploadSession;
