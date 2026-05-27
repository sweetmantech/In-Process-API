import { NextResponse } from 'next/server';
import { AuthMethod } from '@/types/auth';
import authenticateWithFarcasterToken from '@/lib/auth/authenticateWithFarcasterToken';
import authenticateWithBearerToken from '@/lib/auth/authenticateWithBearerToken';
import authenticateWithApiKey from '@/lib/auth/authenticateWithApiKey';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';

const createProfileHandler = async ({
  method,
  token,
  username,
  bio,
  instagram,
  x,
  telegram,
}: {
  method: AuthMethod;
  token: string;
  username?: string;
  bio?: string;
  instagram?: string;
  x?: string;
  telegram?: string;
}) => {
  const auth =
    method === AuthMethod.Farcaster
      ? await authenticateWithFarcasterToken(token)
      : method === AuthMethod.Privy
        ? await authenticateWithBearerToken(token)
        : await authenticateWithApiKey(token);

  await upsertArtists({
    address: auth.artistAddress.toLowerCase(),
    username,
    bio,
    instagram,
    x,
    telegram,
  });

  return NextResponse.json({ success: true });
};

export default createProfileHandler;
