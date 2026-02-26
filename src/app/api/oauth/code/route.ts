import { NextRequest } from 'next/server';
import validateOAuth from '@/lib/oauth/validateOAuth';
import sendCodeHandler from '@/lib/oauth/sendCodeHandler';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateOAuth(req);
    if (validated instanceof Response) return validated;
    const { email } = validated;
    return sendCodeHandler(email);
  } catch (e: any) {
    return Response.json(
      { message: e?.message ?? 'Failed to send code' },
      { status: 500 }
    );
  }
}
