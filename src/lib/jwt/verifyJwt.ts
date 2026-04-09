import { createHmac } from 'crypto';

export function verifyJwt<T = Record<string, unknown>>(
  token: string,
  secret: string
): T {
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) throw new Error('Invalid JWT format');
  const expected = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  if (signature !== expected) throw new Error('Invalid JWT signature');
  return JSON.parse(Buffer.from(body, 'base64url').toString()) as T;
}
