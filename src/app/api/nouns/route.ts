import { NextRequest, NextResponse } from 'next/server';
import validateCreateNounsProposalBody from '@/lib/nouns/validateCreateNounsProposalBody';
import createNounsProposalHandler from '@/lib/nouns/createNounsProposalHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCreateNounsProposalBody(req);
    if (validated instanceof NextResponse) return validated;
    return createNounsProposalHandler(validated);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Failed to create Nouns proposal' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
