import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_notifications/updateNotifications', () => ({
  updateNotifications: vi.fn(),
}));

import { updateNotifications } from '@/lib/supabase/in_process_notifications/updateNotifications';
import putNotificationsHandler from '@/lib/notifications/putNotificationsHandler';

describe('putNotificationsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks notifications as viewed and returns updated count', async () => {
    vi.mocked(updateNotifications).mockResolvedValue({
      data: [{ id: '1' }, { id: '2' }, { id: '3' }] as any,
      error: null,
    });

    const res = await putNotificationsHandler();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('success');
    expect(json.updated).toBe(3);
    expect(json.message).toBe('Marked 3 notifications as viewed');
  });

  it('returns 0 when data is empty', async () => {
    vi.mocked(updateNotifications).mockResolvedValue({
      data: [] as any,
      error: null,
    });

    const res = await putNotificationsHandler();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.updated).toBe(0);
    expect(json.message).toBe('Marked 0 notifications as viewed');
  });

  it('calls updateNotifications with artist when provided', async () => {
    vi.mocked(updateNotifications).mockResolvedValue({
      data: [{ id: '1' }] as any,
      error: null,
    });

    await putNotificationsHandler('0xartist');

    expect(updateNotifications).toHaveBeenCalledWith({
      artist: '0xartist',
      viewed: true,
    });
  });

  it('returns 500 when DB error occurs', async () => {
    vi.mocked(updateNotifications).mockResolvedValue({
      data: null,
      error: { message: 'Update failed' } as any,
    });

    const res = await putNotificationsHandler();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.message).toBe('Update failed');
  });
});
