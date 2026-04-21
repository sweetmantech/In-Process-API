import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
  supabase: { rpc: vi.fn() },
}));
vi.mock('../sendNudge', () => ({
  default: vi.fn(),
}));

import { supabase } from '@/lib/supabase/client';
import sendNudge from '../sendNudge';
import nudgesHandler from '../nudgesHandler';

const TARGETS = [
  {
    artist_address: '0xAlice',
    room_id: 'telegram:1',
    days_since_last_moment: 3,
  },
  { artist_address: '0xBob', room_id: 'telegram:2', days_since_last_moment: 7 },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('dailyNotificationsHandler', () => {
  it('returns 500 when the RPC returns an error', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: { message: 'rpc failure' },
    } as never);

    const res = await nudgesHandler();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.message).toBe('rpc failure');
  });

  it('returns success with total 0 when there are no nudge targets', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [],
      error: null,
    } as never);

    const res = await nudgesHandler();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('success');
    expect(json.total).toBe(0);
    expect(json.sent).toBe(0);
    expect(json.results).toEqual([]);
  });

  it('calls sendNudge for each target', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: TARGETS,
      error: null,
    } as never);
    vi.mocked(sendNudge).mockResolvedValue(undefined);

    await nudgesHandler();

    expect(sendNudge).toHaveBeenCalledTimes(2);
    expect(sendNudge).toHaveBeenCalledWith({
      roomId: 'telegram:1',
      artistAddress: '0xAlice',
      daysSinceLastMoment: 3,
    });
    expect(sendNudge).toHaveBeenCalledWith({
      roomId: 'telegram:2',
      artistAddress: '0xBob',
      daysSinceLastMoment: 7,
    });
  });

  it('returns sent count equal to the number of successful nudges', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: TARGETS,
      error: null,
    } as never);
    vi.mocked(sendNudge).mockResolvedValue(undefined);

    const res = await nudgesHandler();
    const json = await res.json();

    expect(json.total).toBe(2);
    expect(json.sent).toBe(2);
    expect(json.results.every((r: { sent: boolean }) => r.sent)).toBe(true);
  });

  it('captures errors per-target without aborting the rest', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: TARGETS,
      error: null,
    } as never);
    vi.mocked(sendNudge)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('telegram error'));

    const res = await nudgesHandler();
    const json = await res.json();

    expect(json.total).toBe(2);
    expect(json.sent).toBe(1);

    const failed = json.results.find((r: { sent: boolean }) => !r.sent);
    expect(failed.error).toBe('telegram error');
    expect(failed.artist).toBe('0xBob');
  });
});
