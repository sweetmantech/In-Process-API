import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/schema/validate';
import walletConnectBodySchema from '@/lib/schema/walletConnectBodySchema';
import verifyWalletConnectAuth from '@/lib/wallets/verifyWalletConnectAuth';
import { authMiddleware } from '@/authMiddleware';

const validateWalletConnectBody = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const body = await req.json();
  const result = validate(walletConnectBodySchema, body);
  if (!result.success) return result.response;

  const { wallets } = authResult;
  const { address, clientType } = await verifyWalletConnectAuth(
    result.data.walletProof.message,
    result.data.walletProof.signature
  );

  if (wallets.some((w) => w.address.toLowerCase() === address.toLowerCase())) {
    return NextResponse.json(
      { message: 'Wallet already connected' },
      { status: 400 }

  }

  if (wallets.some((w) => w.type === clientType)) {
    return NextResponse.json(
      { message: `Artist already has a ${clientType} wallet` },
      { status: 400 }
    );
  }

  return {
    artist: authResult,
    address,
    clientType,
  };
};

export default validateWalletConnectBody;
