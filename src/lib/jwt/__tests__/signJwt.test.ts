import { describe, it, expect } from 'vitest';
import { signJwt } from '@/lib/jwt/signJwt';
import { verifyJwt } from '@/lib/jwt/verifyJwt';

describe('signJwt', () => {
  const secret = 'test-secret';

  it('returns a three-part JWT string', () => {
    const token = signJwt({ userId: '123' }, secret);
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
  });

  it('encodes HS256 alg and JWT typ in header', () => {
    const token = signJwt({}, secret);
    const [header] = token.split('.');
    const decoded = JSON.parse(Buffer.from(header, 'base64url').toString());
    expect(decoded).toEqual({ alg: 'HS256', typ: 'JWT' });
  });

  it('encodes the payload in the body', () => {
    const payload = { artistAddress: '0xabc', role: 'user' };
    const token = signJwt(payload, secret);
    const [, body] = token.split('.');
    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString());
    expect(decoded).toEqual(payload);
  });

  it('produces a token that verifyJwt accepts with the same secret', () => {
    const payload = { artistAddress: '0xdeadbeef' };
    const token = signJwt(payload, secret);
    expect(() => verifyJwt(token, secret)).not.toThrow();
    expect(verifyJwt(token, secret)).toMatchObject(payload);
  });

  it('produces different signatures for different secrets', () => {
    const t1 = signJwt({ a: 1 }, 'secret-a');
    const t2 = signJwt({ a: 1 }, 'secret-b');
    const sig1 = t1.split('.')[2];
    const sig2 = t2.split('.')[2];
    expect(sig1).not.toBe(sig2);
  });
});
