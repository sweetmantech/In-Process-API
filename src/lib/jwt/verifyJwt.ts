import { createHmac, timingSafeEqual } from 'crypto';

export function verifyJwt<T = Record<string, unknown>>(
  token: string,
  secret: string
): T {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');
  const [header, body, signature] = parts;
  const expected = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    throw new Error('Invalid JWT signature');
  }
  return JSON.parse(Buffer.from(body, 'base64url').toString()) as T;
}
