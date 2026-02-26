import { NextResponse } from 'next/server';
import { SITE_ORIGINAL_URL } from '@/lib/consts';

const loginWithCodeHandler = async (
  email: string,
  code: string
): Promise<NextResponse> => {
  const response = await fetch(
    'https://auth.privy.io/api/v1/passwordless/authenticate',
    {
      method: 'POST',
      headers: {
        'privy-app-id': process.env.PRIVY_APP_ID!,
        'Content-Type': 'application/json',
        origin: SITE_ORIGINAL_URL,
      },
      body: JSON.stringify({ email, code, mode: 'login-or-sign-up' }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('[loginWithCodeHandler] Privy error:', {
      status: response.status,
      data,
    });
    throw new Error(data?.message ?? 'Failed to authenticate');
  }

  return NextResponse.json({
    token: data.token,
    message: 'Token expires in 1 hour.',
  });
};

export default loginWithCodeHandler;
