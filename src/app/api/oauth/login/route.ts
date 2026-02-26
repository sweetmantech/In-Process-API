import { NextRequest } from 'next/server';
import validateLoginWithCode from '@/lib/oauth/validateLoginWithCode';
import loginWithCodeHandler from '@/lib/oauth/loginWithCodeHandler';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateLoginWithCode(req);
    if (validated instanceof Response) return validated;
    const { email, code } = validated;
    return loginWithCodeHandler(email, code);
  } catch (e: any) {
    return Response.json(
      { message: e?.message ?? 'Failed to login' },
      { status: 500 }
    );
  }
}
