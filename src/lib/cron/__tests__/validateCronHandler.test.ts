import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import validateCronHandler from '../validateCronHandler';

const makeReq = (authHeader: string | null) =>
  ({ headers: { get: (_: string) => authHeader } }) as never;

describe('validateCronHandler', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret';
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
    vi.unstubAllEnvs();
  });

  it('returns null when the Authorization header matches the secret', async () => {
    const result = validateCronHandler(makeReq('Bearer test-secret'));
    expect(result).toBeNull();
  });

  it('returns a 401 response when the Authorization header is missing', async () => {
    const result = validateCronHandler(makeReq(null));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
    const json = await result!.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns a 401 response when the token is wrong', async () => {
    const result = validateCronHandler(makeReq('Bearer wrong-secret'));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it('returns a 401 response when the scheme is missing', async () => {
    const result = validateCronHandler(makeReq('test-secret'));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });
});
