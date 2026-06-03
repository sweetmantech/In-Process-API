import { Address } from 'viem';
import { verifyJwt } from '@/lib/jwt/verifyJwt';
import verifyFarcasterAuth from '@/lib/farcaster/verifyFarcasterAuth';
import { farcasterAuthSchema } from '@/lib/schema/farcasterAuthSchema';
import { AuthErrorMessages } from '@/errors';
import getOrCreateArtist from '@/lib/artists/getOrCreateArtist';
import type { ArtistContext } from '@/types/artist';

export async function getWalletsByFarcasterToken(
  token: string
): Promise<ArtistContext> {
  const raw = verifyJwt(token, process.env.FARCASTER_JWT_SECRET!);

  const parsed = farcasterAuthSchema.safeParse(raw);
  if (!parsed.success) throw new Error(AuthErrorMessages.INVALID_AUTH_TOKEN);

  const { verifiedAddress, artistName } = await verifyFarcasterAuth(
    parsed.data.message,
    parsed.data.signature
  );

  return getOrCreateArtist({
    address: verifiedAddress.toLowerCase() as Address,
    type: 'farcaster',
    artistName,
  });
}
