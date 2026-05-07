import { verifyJwt } from '@/lib/jwt/verifyJwt';
import verifyFarcasterAuth from '@/lib/farcaster/verifyFarcasterAuth';
import { farcasterAuthSchema } from '@/lib/schema/farcasterAuthSchema';
import { AuthErrorMessages } from '@/errors';
import { AuthMethod } from '@/types/auth';

const authenticateWithFarcasterToken = async (token: string) => {
  const secret = process.env.FARCASTER_JWT_SECRET;
  if (!secret) throw new Error('FARCASTER_JWT_SECRET is not configured');
  const raw = verifyJwt(token, secret);
  const parsed = farcasterAuthSchema.safeParse(raw);
  if (!parsed.success) throw new Error(AuthErrorMessages.INVALID_AUTH_TOKEN);
  const artistAddress = await verifyFarcasterAuth(
    parsed.data.message,
    parsed.data.signature
  );
  return { artistAddress, authMethod: AuthMethod.FARCaster };
};

export default authenticateWithFarcasterToken;
