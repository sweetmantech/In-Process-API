import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/schema/validate';
import connectArtistWalletSchema from '@/lib/schema/connectArtistWalletSchema';

const validateConnectArtistWalletBody = async (req: NextRequest) => {
  const body = await req.json();
  const result = validate(connectArtistWalletSchema, body);
  if (!result.success) return result.response as NextResponse;
  return result.data;
};

export default validateConnectArtistWalletBody;
