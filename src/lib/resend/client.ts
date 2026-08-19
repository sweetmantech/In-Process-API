import { Resend } from 'resend';
import { validateResendEnv } from '@/lib/resend/validateResendEnv';

let cachedClient: Resend | null = null;

export function getResendClient(): Resend | null {
  if (cachedClient) return cachedClient;

  try {
    const { apiKey } = validateResendEnv();
    cachedClient = new Resend(apiKey);
    return cachedClient;
  } catch (e) {
    console.error('[resend] client init failed:', e);
    return null;
  }
}
