import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/account_notifications/getWeeklyWrapUpStats', () => ({
  default: vi.fn(),
}));
vi.mock('../sendWrapUp', () => ({
  default: vi.fn(),
}));

import getWeeklyWrapUpStats from '@/lib/supabase/account_notifications/getWeeklyWrapUpStats';
import sendWrapUp from '../sendWrapUp';
import wrapUpHandler from '../wrapUpHandler';

const TARGETS = [
  {
    username: 'cxy',
    chat_id: '849865010',
    telegram_count: 7,
    web_count: 0,
    api_count: 0,
    sms_count: 0,
  },
  {
    username: 'sweetman',
    chat_id: '1966150009',
    telegram_count: 4,
    web_count: 1,
    api_count: 0,
    sms_count: 0,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('wrapUpHandler', () => {
  it('returns 500 when the RPC returns an error', async () => {
    vi.mocked(getWeeklyWrapUpStats).mockResolvedValue({
      data: null,
      error: { message: 'rpc failure' },
    } as never);

    const res = await wrapUpHandler();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.message).toBe('rpc failure');
  });

  it('returns success with total 0 when there are no targets', async () => {
    vi.mocked(getWeeklyWrapUpStats).mockResolvedValue({
      data: [],
      error: null,
    } as never);

    const res = await wrapUpHandler();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('success');
    expect(json.total).toBe(0);
    expect(json.sent).toBe(0);
    expect(json.results).toEqual([]);
  });

  it('calls sendWrapUp for each target with mapped fields', async () => {
    vi.mocked(getWeeklyWrapUpStats).mockResolvedValue({
      data: TARGETS,
      error: null,
    } as never);
    vi.mocked(sendWrapUp).mockResolvedValue(undefined);

    await wrapUpHandler();

    expect(sendWrapUp).toHaveBeenCalledTimes(2);
    expect(sendWrapUp).toHaveBeenCalledWith({
      chatId: '849865010',
      username: 'cxy',
      telegramCount: 7,
      webCount: 0,
      apiCount: 0,
      smsCount: 0,
    });
    expect(sendWrapUp).toHaveBeenCalledWith({
      chatId: '1966150009',
      username: 'sweetman',
      telegramCount: 4,
      webCount: 1,
      apiCount: 0,
      smsCount: 0,
    });
  });

  it('returns sent count equal to the number of successful wrap-ups', async () => {
    vi.mocked(getWeeklyWrapUpStats).mockResolvedValue({
      data: TARGETS,
      error: null,
    } as never);
    vi.mocked(sendWrapUp).mockResolvedValue(undefined);

    const res = await wrapUpHandler();
    const json = await res.json();

    expect(json.total).toBe(2);
    expect(json.sent).toBe(2);
    expect(json.results.every((r: { sent: boolean }) => r.sent)).toBe(true);
  });

  it('captures errors per-target without aborting the rest', async () => {
    vi.mocked(getWeeklyWrapUpStats).mockResolvedValue({
      data: TARGETS,
      error: null,
    } as never);
    vi.mocked(sendWrapUp)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('telegram error'));

    const res = await wrapUpHandler();
    const json = await res.json();

    expect(json.total).toBe(2);
    expect(json.sent).toBe(1);

    const failed = json.results.find((r: { sent: boolean }) => !r.sent);
    expect(failed.error).toBe('telegram error');
    expect(failed.username).toBe('sweetman');
  });
});
