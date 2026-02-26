import { NextResponse } from 'next/server';
import { SITE_ORIGINAL_URL } from '@/lib/consts';

const sendCodeHandler = async (email: string): Promise<NextResponse> => {
  const response = await fetch(
    'https://auth.privy.io/api/v1/passwordless/init',
    {
      method: 'POST',
      headers: {
        'privy-app-id': process.env.PRIVY_APP_ID!,
        'Content-Type': 'application/json',
        origin: SITE_ORIGINAL_URL,
      },
      body: JSON.stringify({ email }),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message ?? 'Failed to send verification code');
  }

  return NextResponse.json({ success: true });
};

export default sendCodeHandler;
