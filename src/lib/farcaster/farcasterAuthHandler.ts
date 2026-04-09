import verifyFarcasterAuth from '@/lib/farcaster/verifyFarcasterAuth';
import { signJwt } from '@/lib/jwt/signJwt';

const farcasterAuthHandler = async (
  message: string,
  signature: string
): Promise<{ token: string }> => {
  await verifyFarcasterAuth(message, signature);
  const token = signJwt(
    { message, signature },
    process.env.FARCASTER_JWT_SECRET!
  );
  return { token };
};

export default farcasterAuthHandler;
