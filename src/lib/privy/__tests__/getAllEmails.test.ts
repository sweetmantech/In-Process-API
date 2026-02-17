import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/privy/client', () => ({
  default: {
    users: vi.fn(),
  },
}));

import privyClient from '@/lib/privy/client';
import getAllEmails from '@/lib/privy/getAllEmails';

const mockPage = (
  users: any[],
  hasNext = false,
  nextCursor: string | null = null
) => ({
  getPaginatedItems: () => users,
  hasNextPage: () => hasNext,
  next_cursor: nextCursor,
});

describe('getAllEmails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns emails for users with both wallet and email accounts', async () => {
    vi.mocked(privyClient.users).mockReturnValue({
      list: vi.fn().mockResolvedValue(
        mockPage([
          {
            linked_accounts: [
              { type: 'wallet', address: '0xabc' },
              { type: 'email', address: 'user@example.com' },
            ],
          },
        ])
      ),
    } as any);

    const result = await getAllEmails();

    expect(result.emails).toEqual([
      { address: '0xabc', email: 'user@example.com' },
    ]);
    expect(result.next_cursor).toBeNull();
  });

  it('skips users with no wallet account', async () => {
    vi.mocked(privyClient.users).mockReturnValue({
      list: vi.fn().mockResolvedValue(
        mockPage([
          {
            linked_accounts: [{ type: 'email', address: 'user@example.com' }],
          },
        ])
      ),
    } as any);

    const result = await getAllEmails();

    expect(result.emails).toHaveLength(0);
  });

  it('skips users with no email account', async () => {
    vi.mocked(privyClient.users).mockReturnValue({
      list: vi.fn().mockResolvedValue(
        mockPage([
          {
            linked_accounts: [{ type: 'wallet', address: '0xabc' }],
          },
        ])
      ),
    } as any);

    const result = await getAllEmails();

    expect(result.emails).toHaveLength(0);
  });

  it('returns next_cursor when there is a next page', async () => {
    vi.mocked(privyClient.users).mockReturnValue({
      list: vi.fn().mockResolvedValue(mockPage([], true, 'cursor-xyz')),
    } as any);

    const result = await getAllEmails();

    expect(result.next_cursor).toBe('cursor-xyz');
  });

  it('passes cursor and limit to privy list', async () => {
    const mockList = vi.fn().mockResolvedValue(mockPage([]));
    vi.mocked(privyClient.users).mockReturnValue({ list: mockList } as any);

    await getAllEmails('cursor-abc', 50);

    expect(mockList).toHaveBeenCalledWith({ cursor: 'cursor-abc', limit: 50 });
  });
});
