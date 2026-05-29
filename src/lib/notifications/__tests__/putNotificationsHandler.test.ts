import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_notifications/updateNotifications', () => ({
  updateNotifications: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));

import { updateNotifications } from '@/lib/supabase/in_process_notifications/updateNotifications';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
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

  it('calls updateNotifications with wallets resolved from artist_id', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ address: '0xwallet1' } as any],
      error: null,
    });
    vi.mocked(updateNotifications).mockResolvedValue({
      data: [{ id: '1' }] as any,
      error: null,
    });

    const artistId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    await putNotificationsHandler(artistId);

    expect(selectWallets).toHaveBeenCalledWith({ artistIds: [artistId] });
    expect(updateNotifications).toHaveBeenCalledWith({
      wallets: ['0xwallet1'],
      viewed: true,
    });
  });

  it('returns 0 updated when artist has no wallets', async () => {
    vi.mocked(selectWallets).mockResolvedValue({ data: [], error: null });

    const res = await putNotificationsHandler(
      'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    );
    const json = await res.json();

    expect(updateNotifications).not.toHaveBeenCalled();
    expect(json.updated).toBe(0);
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
