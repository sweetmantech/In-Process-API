import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateFarcasterAuthBody from '@/lib/farcaster/validateFarcasterAuthBody';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/farcaster/auth', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('validateFarcasterAuthBody', () => {
  it('returns validated data for valid input', async () => {
    const result = await validateFarcasterAuthBody(
      makeRequest({ message: 'siwe message', signature: '0xabc' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({ message: 'siwe message', signature: '0xabc' });
  });

  it('returns 400 when message is missing', async () => {
    const result = await validateFarcasterAuthBody(
      makeRequest({ signature: '0xabc' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when message is empty', async () => {
    const result = await validateFarcasterAuthBody(
      makeRequest({ message: '', signature: '0xabc' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when signature is missing', async () => {
    const result = await validateFarcasterAuthBody(
      makeRequest({ message: 'siwe message' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when signature is empty', async () => {
    const result = await validateFarcasterAuthBody(
      makeRequest({ message: 'siwe message', signature: '' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when body is empty', async () => {
    const result = await validateFarcasterAuthBody(makeRequest({}));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when body is malformed JSON', async () => {
    const req = new NextRequest('http://localhost/api/farcaster/auth', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await validateFarcasterAuthBody(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
    const json = await (result as NextResponse).json();
    expect(json.errors[0].message).toBe('Malformed JSON body');
  });
});
