import { NextResponse } from 'next/server';
import authenticatePrivyPasswordless from '@/lib/privy/authenticatePrivyPasswordless';
import ensurePrivySocialWallet from '@/lib/privy/ensurePrivySocialWallet';

const loginWithCodeHandler = async (
  email: string,
  code: string
): Promise<NextResponse> => {
  const data = await authenticatePrivyPasswordless(email, code);
  const socialWallet = await ensurePrivySocialWallet(data);

  return NextResponse.json({ token: data.token, social_wallet: socialWallet });
};

export default loginWithCodeHandler;
