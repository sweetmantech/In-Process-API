import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_notifications/selectNotifications', () => ({
  selectNotifications: vi.fn(),
}));

import { selectNotifications } from '@/lib/supabase/in_process_notifications/selectNotifications';
import getNotificationsHandler from '@/lib/notifications/getNotificationsHandler';

const BASE_PARAMS = {
  limit: 20,
  page: 1,
  artist: undefined as string | undefined,
  viewed: undefined as boolean | undefined,
};

const MOCK_NOTIFICATION_TRANSFER = {
  value: 100,
  currency: 'USDC',
  transaction_hash: '0xabc',
  transferred_at: '2024-01-01T00:00:00Z',
  moment: {
    token_id: 1,
    collection: { address: '0xcollection' },
    metadata: { image: null, name: 'Test' },
  },
  collector: { artist: { username: 'collector_user' } },
};

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    viewed: false,
    transfer: MOCK_NOTIFICATION_TRANSFER,
    artist: { username: 'artist_user' },
  },
  {
    id: '2',
    viewed: true,
    transfer: MOCK_NOTIFICATION_TRANSFER,
    artist: { username: 'artist_user' },
  },
];

const MOCK_NOTIFICATIONS_FLATTENED = MOCK_NOTIFICATIONS.map((n) => ({
  ...n,
  transfer: {
    ...n.transfer,
    collector: { username: n.transfer.collector.artist?.username ?? null },
  },
}));

describe('getNotificationsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns notifications and pagination on success', async () => {
    vi.mocked(selectNotifications).mockResolvedValue({
      data: MOCK_NOTIFICATIONS as any,
      count: 2,
      error: null,
    });

    const res = await getNotificationsHandler(BASE_PARAMS);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('success');
    expect(json.notifications).toEqual(MOCK_NOTIFICATIONS_FLATTENED);
    expect(json.pagination).toEqual({
      page: 1,
      limit: 20,
      total_count: 2,
      total_pages: 1,
    });
  });

  it('returns empty array and zero pagination when there are no results', async () => {
    vi.mocked(selectNotifications).mockResolvedValue({
      data: [] as any,
      count: 0,
      error: null,
    });

    const res = await getNotificationsHandler(BASE_PARAMS);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.notifications).toEqual([]);
    expect(json.pagination).toEqual({
      page: 1,
      limit: 20,
      total_count: 0,
      total_pages: 0,
    });
  });

  it('computes total_pages correctly', async () => {
    vi.mocked(selectNotifications).mockResolvedValue({
      data: MOCK_NOTIFICATIONS as any,
      count: 100,
      error: null,
    });

    const res = await getNotificationsHandler({ limit: 10, page: 3 });
    const json = await res.json();

    expect(json.pagination).toEqual({
      page: 3,
      limit: 10,
      total_count: 100,
      total_pages: 10,
    });
  });

  it('returns zero counts when count is null', async () => {
    vi.mocked(selectNotifications).mockResolvedValue({
      data: [] as any,
      count: null,
      error: null,
    });

    const res = await getNotificationsHandler(BASE_PARAMS);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.pagination.total_count).toBe(0);
    expect(json.pagination.total_pages).toBe(0);
  });

  it('calls selectNotifications with all provided params', async () => {
    vi.mocked(selectNotifications).mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    });

    await getNotificationsHandler({
      limit: 10,
      page: 3,
      artist_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      viewed: false,
    });

    expect(selectNotifications).toHaveBeenCalledWith({
      limit: 10,
      page: 3,
      artist_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      viewed: false,
    });
  });

  it('returns 500 when DB error occurs', async () => {
    vi.mocked(selectNotifications).mockResolvedValue({
      data: null,
      count: null,
      error: { message: 'DB connection failed' } as any,
    });

    const res = await getNotificationsHandler(BASE_PARAMS);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.message).toBe('DB connection failed');
  });
});
