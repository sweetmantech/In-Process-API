import { NextRequest, NextResponse } from 'next/server';
import validateCreateMuxUpload from '@/lib/mux/validateCreateMuxUpload';
import createMuxUploadHandler from '@/lib/mux/createMuxUploadHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCreateMuxUpload(req);
    if (validated instanceof NextResponse) return validated;
    return createMuxUploadHandler();
  } catch (e: any) {
    const message = e?.message ?? 'Failed to create upload';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
