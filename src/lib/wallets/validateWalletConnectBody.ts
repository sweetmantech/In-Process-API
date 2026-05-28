import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/schema/validate';
import walletConnectBodySchema from '@/lib/schema/walletConnectBodySchema';
import verifyWalletConnectAuth from '@/lib/wallets/verifyWalletConnectAuth';
import { authMiddleware } from '@/authMiddleware';

const validateWalletConnectBody = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const { wallets, artistId } = authResult;
  const body = await req.json();
  const result = validate(walletConnectBodySchema, body);
  if (!result.success) return result.response;

  const { address, clientType } = await verifyWalletConnectAuth(
    result.data.message,
    result.data.signature
  );

  if (wallets.some((w) => w.toLowerCase() === address.toLowerCase())) {
    return NextResponse.json(
      { message: 'Wallet already connected' },
      { status: 400 }
    );
  }

  return {
    artistId,
    address,
    clientType,
  };
};

export default validateWalletConnectBody;
