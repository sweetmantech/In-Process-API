import { NextRequest, NextResponse } from 'next/server';
import validateGetNounsProposalActionBody from '@/lib/nouns/validateGetNounsProposalActionBody';
import getNounsProposalActionHandler from '@/lib/nouns/getNounsProposalActionHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateGetNounsProposalActionBody(req);
    if (validated instanceof NextResponse) return validated;
    return getNounsProposalActionHandler(validated);
  } catch (e: any) {
    return NextResponse.json(
      {
        message: e?.message ?? 'Failed to get Nouns proposal action',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
