import { NextRequest, NextResponse } from 'next/server';
import validateCreateSplitsBody from '@/lib/splits/validateCreateSplitsBody';
import createSplitsHandler from '@/lib/splits/createSplitsHandler';
import validateDistributeQuery from '@/lib/splits/validateDistributeQuery';
import { distribute } from '@/lib/splits/distribute';

export async function GET(req: NextRequest) {
  try {
    const validated = validateDistributeQuery(req);
    if (validated instanceof NextResponse) return validated;
    const hash = await distribute(validated);
    return Response.json({
      status: 'success',
      hash,
    });
  } catch (e: any) {
    console.error('Error in distribute API:', e);
    return Response.json(
      {
        status: 'error',
        message: 'An error occurred while distributing.',
        error: e instanceof Error ? e.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCreateSplitsBody(req);
    if (validated instanceof NextResponse) return validated;
    return await createSplitsHandler(validated);
  } catch (e: any) {
    console.error('Error in create splits API:', e);
    const message = e?.message ?? 'Failed to create split';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
