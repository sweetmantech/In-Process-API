import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import walletDisconnectBodySchema from '@/lib/schema/walletDisconnectBodySchema';

const validateWalletDisconnect = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const { wallets } = authResult;
  const result = walletDisconnectBodySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success)
    return NextResponse.json({ message: 'Invalid address' }, { status: 400 });

  const wallet = wallets.find(
    (w) => w.address.toLowerCase() === result.data.address.toLowerCase()
  );
  if (!wallet)
    return NextResponse.json({ message: 'Wallet not found' }, { status: 400 });

  return { artist: authResult, address: result.data.address };
};

export default validateWalletDisconnect;
