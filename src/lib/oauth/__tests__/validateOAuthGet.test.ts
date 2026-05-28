import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({
  authMiddleware: vi.fn(),
}));

import validateOAuthGet from '@/lib/oauth/validateOAuthGet';
import { authMiddleware } from '@/authMiddleware';

const mockAuthMiddleware = vi.mocked(authMiddleware);

const makeRequest = () =>
  new NextRequest('http://localhost/api/oauth', { method: 'GET' });

describe('validateOAuthGet', () => {
  it('returns artistAddress when auth succeeds', async () => {
    mockAuthMiddleware.mockResolvedValue({ primaryWallet: '0xabc' } as any);

    const result = await validateOAuthGet(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual(expect.objectContaining({ primaryWallet: '0xabc' }));
  });

  it('returns 403 when auth fails', async () => {
    const authError = NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
    mockAuthMiddleware.mockResolvedValue(authError as any);

    const result = await validateOAuthGet(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
  });
});
