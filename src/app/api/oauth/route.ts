import { NextRequest, NextResponse } from 'next/server';
import validateOAuthGet from '@/lib/oauth/validateOAuthGet';
import oauthHandler from '@/lib/oauth/oauthHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = await validateOAuthGet(req);
    if (validated instanceof NextResponse) return validated;
    return oauthHandler(validated.primaryWallet);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
