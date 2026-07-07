import { describe, it, expect, vi, beforeEach } from 'vitest';
import getOrCreateUngroupedBurstId from '../getOrCreateUngroupedBurstId';

const makeThread = (stateAdapter: {
  setIfNotExists: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
}) => ({
  channelId: 'telegram:chat-abc',
  _stateAdapter: stateAdapter,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getOrCreateUngroupedBurstId', () => {
  it('returns a fresh burst id when no burst is active', async () => {
    const setIfNotExists = vi.fn().mockResolvedValue(true);
    const get = vi.fn();
    const thread = makeThread({ setIfNotExists, get });

    const burstId = await getOrCreateUngroupedBurstId(thread as never);

    expect(burstId).toContain('telegram:chat-abc');
    expect(setIfNotExists).toHaveBeenCalledWith(
      'ungrouped_burst:telegram:chat-abc',
      burstId,
      5_000
    );
    expect(get).not.toHaveBeenCalled();
  });

  it('reuses the active burst id when one already exists', async () => {
    const setIfNotExists = vi.fn().mockResolvedValue(false);
    const get = vi.fn().mockResolvedValue('telegram:chat-abc:existing-burst');
    const thread = makeThread({ setIfNotExists, get });

    const burstId = await getOrCreateUngroupedBurstId(thread as never);

    expect(burstId).toBe('telegram:chat-abc:existing-burst');
    expect(get).toHaveBeenCalledWith('ungrouped_burst:telegram:chat-abc');
  });

  it('falls back to the candidate id if the existing value is missing/invalid', async () => {
    const setIfNotExists = vi.fn().mockResolvedValue(false);
    const get = vi.fn().mockResolvedValue(null);
    const thread = makeThread({ setIfNotExists, get });

    const burstId = await getOrCreateUngroupedBurstId(thread as never);

    expect(burstId).toContain('telegram:chat-abc');
  });
});
