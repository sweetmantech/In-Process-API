import { NextResponse } from 'next/server';
import type { Address } from 'viem';
import { AuthMethod } from '@/types/auth';
import authenticateWithFarcasterToken from '@/lib/auth/authenticateWithFarcasterToken';
import authenticateWithBearerToken from '@/lib/auth/authenticateWithBearerToken';
import authenticateWithApiKey from '@/lib/auth/authenticateWithApiKey';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';

const createProfileHandler = async ({
  method,
  token,
  address,
  username,
  bio,
  instagram,
  x,
  telegram,
}: {
  method: AuthMethod;
  token: string;
  address: Address;
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

  if (auth.artistAddress.toLowerCase() !== address) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await upsertArtists({
    address,
    username,
    bio,
    instagram,
    x,
    telegram,
  });

  return NextResponse.json({ success: true });
};

export default createProfileHandler;
