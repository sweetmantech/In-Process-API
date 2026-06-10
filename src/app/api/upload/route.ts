import { NextRequest } from 'next/server';
import validateUpload from '@/lib/upload/validateUpload';
import uploadHandler from '@/lib/upload/uploadHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateUpload(req);
    if (validated instanceof Response) return validated;
    const { artist, blob, type, uploadType, usdcAmountMicros } = validated;
    return uploadHandler(artist, blob, type, uploadType, usdcAmountMicros);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
