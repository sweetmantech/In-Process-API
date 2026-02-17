import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/schema/validate';
import disconnectArtistWalletSchema from '@/lib/schema/disconnectArtistWalletSchema';

const validateDisconnectArtistWalletBody = async (req: NextRequest) => {
  const body = await req.json();
  const result = validate(disconnectArtistWalletSchema, body);
  if (!result.success) return result.response as NextResponse;
  return result.data;
};

export default validateDisconnectArtistWalletBody;
