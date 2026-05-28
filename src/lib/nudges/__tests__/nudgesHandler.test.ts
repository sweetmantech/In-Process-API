import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/account_notifications/getNudges', () => ({
  default: vi.fn(),
}));
vi.mock('../sendNudge', () => ({
  default: vi.fn(),
}));

import getNudges from '@/lib/supabase/account_notifications/getNudges';
import sendNudge from '../sendNudge';
import nudgesHandler from '../nudgesHandler';

const TARGETS = [
  {
    artist_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    chat_id: 'telegram:1',
    days_since_last_moment: 3,
  },
  {
    artist_id: 'ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj',
    chat_id: 'telegram:2',
    days_since_last_moment: 7,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('nudgesHandler', () => {
  it('propagates errors from getNudges', async () => {
    vi.mocked(getNudges).mockRejectedValue(new Error('rpc failure'));

    await expect(nudgesHandler()).rejects.toThrow('rpc failure');
  });

  it('returns success with total 0 when there are no nudge targets', async () => {
    vi.mocked(getNudges).mockResolvedValue([]);

    const res = await nudgesHandler();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('success');
    expect(json.total).toBe(0);
    expect(json.sent).toBe(0);
    expect(json.results).toEqual([]);
  });

  it('calls sendNudge for each target', async () => {
    vi.mocked(getNudges).mockResolvedValue(TARGETS as any);
    vi.mocked(sendNudge).mockResolvedValue(undefined);

    await nudgesHandler();

    expect(sendNudge).toHaveBeenCalledTimes(2);
    expect(sendNudge).toHaveBeenCalledWith({
      chatId: 'telegram:1',
      artistId: TARGETS[0].artist_id,
      daysSinceLastMoment: 3,
    });
    expect(sendNudge).toHaveBeenCalledWith({
      chatId: 'telegram:2',
      artistId: TARGETS[1].artist_id,
      daysSinceLastMoment: 7,
    });
  });

  it('returns sent count equal to the number of successful nudges', async () => {
    vi.mocked(getNudges).mockResolvedValue(TARGETS as any);
    vi.mocked(sendNudge).mockResolvedValue(undefined);

    const res = await nudgesHandler();
    const json = await res.json();

    expect(json.total).toBe(2);
    expect(json.sent).toBe(2);
    expect(json.results.every((r: { sent: boolean }) => r.sent)).toBe(true);
  });

  it('captures errors per-target without aborting the rest', async () => {
    vi.mocked(getNudges).mockResolvedValue(TARGETS as any);
    vi.mocked(sendNudge)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('telegram error'));

    const res = await nudgesHandler();
    const json = await res.json();

    expect(json.total).toBe(2);
    expect(json.sent).toBe(1);

    const failed = json.results.find((r: { sent: boolean }) => !r.sent);
    expect(failed.error).toBe('telegram error');
    expect(failed.artist).toBe(TARGETS[1].artist_id);
  });
});
