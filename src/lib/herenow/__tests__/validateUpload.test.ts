import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));

import { authMiddleware } from '@/authMiddleware';
import validateUpload from '@/lib/herenow/validateUpload';

const ARTIST = '0xartist';

const makeRequest = (
  body: unknown = {
    fileName: 'img.png',
    fileSize: 1024,
    contentType: 'image/png',
    hash: 'abc',
  }
) =>
  new NextRequest('http://localhost/api/herenow', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('validateUpload (herenow)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: ARTIST,
    } as any);
  });

  it('returns 401 when auth fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateUpload(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 400 on invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/herenow', {
      method: 'POST',
      body: 'not json',
    });

    const result = await validateUpload(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when required fields are missing', async () => {
    const result = await validateUpload(makeRequest({}));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when fileSize is zero', async () => {
    const result = await validateUpload(
      makeRequest({
        fileName: 'img.png',
        fileSize: 0,
        contentType: 'image/png',
        hash: 'abc',
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns validated data on success', async () => {
    const result = await validateUpload(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toMatchObject({
      fileName: 'img.png',
      fileSize: 1024,
      contentType: 'image/png',
      hash: 'abc',
    });
  });
});
