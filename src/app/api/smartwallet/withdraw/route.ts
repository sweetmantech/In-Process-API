import { NextRequest } from 'next/server';
import { Address } from 'viem';
import { validate } from '@/lib/schema/validate';
import { withdrawSchema } from '@/lib/schema/withdrawSchema';
import { withdraw } from '@/lib/smartwallets/withdraw';
import { authMiddleware } from '@/authMiddleware';

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { primaryWallet } = authResult;

    const body = await req.json();
    const validationResult = validate(withdrawSchema, body);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const result = await withdraw({
      ...validationResult.data,
      artistAddress: primaryWallet as Address,
    });

    return Response.json(result);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'Failed to withdraw from smart wallet';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
