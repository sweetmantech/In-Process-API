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

const MOCK_NOTIFICATIONS = [
  { id: '1', viewed: false },
  { id: '2', viewed: true },
];

describe('getNotificationsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns notifications on success', async () => {
    vi.mocked(selectNotifications).mockResolvedValue({
      data: MOCK_NOTIFICATIONS as any,
      count: 2,
      error: null,
    });

    const res = await getNotificationsHandler(BASE_PARAMS);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('success');
    expect(json.notifications).toEqual(MOCK_NOTIFICATIONS);
  });

  it('returns empty array when there are no results', async () => {
    vi.mocked(selectNotifications).mockResolvedValue({
      data: [] as any,
      count: 0,
      error: null,
    });

    const res = await getNotificationsHandler(BASE_PARAMS);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.notifications).toEqual([]);
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
      artist: '0xartist',
      viewed: false,
    });

    expect(selectNotifications).toHaveBeenCalledWith({
      limit: 10,
      page: 3,
      artist: '0xartist',
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
