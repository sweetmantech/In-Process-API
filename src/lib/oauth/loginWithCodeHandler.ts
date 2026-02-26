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
      body: JSON.stringify({ email, code, mode: 'login' }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message ?? 'Failed to authenticate');
  }

  return NextResponse.json(data);
};

export default loginWithCodeHandler;
