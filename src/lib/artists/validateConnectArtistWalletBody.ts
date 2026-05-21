import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import connectArtistWalletSchema from '@/lib/schema/connectArtistWalletSchema';
import { AuthMethod } from '@/types/auth';
import { Address } from 'viem';

const validateConnectArtistWalletBody = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;
  const authMethod = authResult.authMethod;
  if (authMethod !== AuthMethod.Privy)
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const socialWallet = authResult.socialWallet;
  if (!socialWallet)
    return NextResponse.json(
      { message: 'Privy social wallet not found' },
      { status: 403 }
    );

  const body = await req.json();
  const result = validate(connectArtistWalletSchema, body);
  if (!result.success) return result.response;

  const { artist_wallet } = result.data;

  if (socialWallet === artist_wallet)
    return NextResponse.json(
      { message: 'An artist wallet same as social wallet' },
      { status: 403 }
    );

  if (authResult.artistAddress === artist_wallet)
    return NextResponse.json(
      { message: 'An artist wallet is already connected' },
      { status: 403 }
    );

  return {
    ...result.data,
    social_wallet: socialWallet as Address,
  };
};

export default validateConnectArtistWalletBody;
