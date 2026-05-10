import { NextRequest, NextResponse } from 'next/server';
import validateUpload from '@/lib/herenow/validateUpload';
import uploadHandler from '@/lib/herenow/uploadHandler';
import validateFinalize from '@/lib/herenow/validateFinalize';
import finalizeHandler from '@/lib/herenow/finalizeHandler';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const validated = await validateUpload(request);
    if (validated instanceof NextResponse) return validated;
    const { fileName, fileSize, contentType, hash } = validated;
    return uploadHandler(fileName, fileSize, contentType, hash);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const validated = await validateFinalize(request);
    if (validated instanceof NextResponse) return validated;
    const { slug, versionId, filePath } = validated;
    return finalizeHandler(slug, versionId, filePath);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}
