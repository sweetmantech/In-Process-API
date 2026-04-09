import { describe, it, expect } from 'vitest';
import { signJwt } from '@/lib/jwt/signJwt';
import { verifyJwt } from '@/lib/jwt/verifyJwt';

describe('verifyJwt', () => {
  const secret = 'test-secret';

  it('returns decoded payload for a valid token', () => {
    const payload = { artistAddress: '0xabc123' };
    const token = signJwt(payload, secret);
    const result = verifyJwt<typeof payload>(token, secret);
    expect(result).toEqual(payload);
  });

  it('throws on tampered signature', () => {
    const token = signJwt({ artistAddress: '0xabc' }, secret);
    const [header, body] = token.split('.');
    const tampered = `${header}.${body}.invalidsignature`;
    expect(() => verifyJwt(tampered, secret)).toThrow('Invalid JWT signature');
  });

  it('throws on wrong secret', () => {
    const token = signJwt({ artistAddress: '0xabc' }, secret);
    expect(() => verifyJwt(token, 'wrong-secret')).toThrow(
      'Invalid JWT signature'
    );
  });

  it('throws on malformed token with missing parts', () => {
    expect(() => verifyJwt('onlyone', secret)).toThrow('Invalid JWT format');
    expect(() => verifyJwt('only.two', secret)).toThrow('Invalid JWT format');
  });

  it('throws on empty string', () => {
    expect(() => verifyJwt('', secret)).toThrow('Invalid JWT format');
  });

  it('throws on tampered payload', () => {
    const token = signJwt({ artistAddress: '0xabc' }, secret);
    const [header, , sig] = token.split('.');
    const tamperedBody = Buffer.from(
      JSON.stringify({ artistAddress: '0xevil' })
    ).toString('base64url');
    expect(() => verifyJwt(`${header}.${tamperedBody}.${sig}`, secret)).toThrow(
      'Invalid JWT signature'
    );
  });
});
