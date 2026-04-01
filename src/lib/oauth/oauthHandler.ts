import { NextResponse } from 'next/server';
import getArtistProfile from '@/lib/getArtistProfile';

const oauthHandler = async (artistAddress: string): Promise<NextResponse> => {
  const profile = await getArtistProfile(artistAddress.toLowerCase());
  return NextResponse.json({ artistAddress, profile });
};

export default oauthHandler;
