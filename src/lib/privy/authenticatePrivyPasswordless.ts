import { SITE_ORIGINAL_URL } from '@/lib/consts';
import type { PrivyPasswordlessAuthenticateResult } from '@/types/auth';

const authenticatePrivyPasswordless = async (
  email: string,
  code: string
): Promise<PrivyPasswordlessAuthenticateResult> => {
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

  const data = (await response
    .json()
    .catch(() => ({}))) as PrivyPasswordlessAuthenticateResult;

  if (!response.ok) {
    console.error('[authenticatePrivyPasswordless] Privy error:', {
      status: response.status,
      data,
    });
    throw new Error(data?.error ?? data?.message ?? 'Failed to authenticate');
  }

  return data;
};

export default authenticatePrivyPasswordless;
