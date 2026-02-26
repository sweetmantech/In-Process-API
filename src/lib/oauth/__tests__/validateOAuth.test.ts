import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateOAuth from '@/lib/oauth/validateOAuth';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/oauth/code', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('validateOAuth', () => {
  it('returns validated data for valid input', async () => {
    const result = await validateOAuth(
      makeRequest({ email: 'user@example.com' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({ email: 'user@example.com' });
  });

  it('returns 400 when email is missing', async () => {
    const result = await validateOAuth(makeRequest({}));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when email is invalid', async () => {
    const result = await validateOAuth(makeRequest({ email: 'not-an-email' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when body is empty', async () => {
    const result = await validateOAuth(makeRequest(null));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
