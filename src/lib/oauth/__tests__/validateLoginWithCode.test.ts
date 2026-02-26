import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateLoginWithCode from '@/lib/oauth/validateLoginWithCode';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/oauth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('validateLoginWithCode', () => {
  it('returns validated data for valid input', async () => {
    const result = await validateLoginWithCode(
      makeRequest({ email: 'user@example.com', code: '123456' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({ email: 'user@example.com', code: '123456' });
  });

  it('returns 400 when email is missing', async () => {
    const result = await validateLoginWithCode(makeRequest({ code: '123456' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when email is invalid', async () => {
    const result = await validateLoginWithCode(
      makeRequest({ email: 'not-an-email', code: '123456' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when code is missing', async () => {
    const result = await validateLoginWithCode(
      makeRequest({ email: 'user@example.com' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when code is not 6 digits', async () => {
    const result = await validateLoginWithCode(
      makeRequest({ email: 'user@example.com', code: '12345' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when code contains non-numeric characters', async () => {
    const result = await validateLoginWithCode(
      makeRequest({ email: 'user@example.com', code: '12345a' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when code is 7 digits', async () => {
    const result = await validateLoginWithCode(
      makeRequest({ email: 'user@example.com', code: '1234567' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
