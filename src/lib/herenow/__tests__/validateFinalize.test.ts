import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));

import { authMiddleware } from '@/authMiddleware';
import validateFinalize from '@/lib/herenow/validateFinalize';

const ARTIST = '0xartist';

const makeRequest = (body: unknown = { slug: 'abc123', versionId: 'v1' }) =>
  new NextRequest('http://localhost/api/herenow', {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('validateFinalize (herenow)', () => {
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

    const result = await validateFinalize(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 400 on invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/herenow', {
      method: 'PUT',
      body: 'not json',
    });

    const result = await validateFinalize(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when slug is missing', async () => {
    const result = await validateFinalize(makeRequest({ versionId: 'v1' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when versionId is missing', async () => {
    const result = await validateFinalize(makeRequest({ slug: 'abc123' }));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns validated data without filePath when not provided', async () => {
    const result = await validateFinalize(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toMatchObject({ slug: 'abc123', versionId: 'v1' });
    expect((result as any).filePath).toBeUndefined();
  });

  it('returns validated data with filePath when provided', async () => {
    const result = await validateFinalize(
      makeRequest({ slug: 'abc123', versionId: 'v1', filePath: 'image.png' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).filePath).toBe('image.png');
  });
});
