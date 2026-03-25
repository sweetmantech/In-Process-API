import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleMomentSuccess from '../handleMomentSuccess';

vi.mock('@/lib/consts', () => ({
  IS_TESTNET: false,
  SITE_ORIGINAL_URL: 'https://inprocess.world',
}));

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('handleMomentSuccess', () => {
  it('posts the success message with the collect URL', async () => {
    const thread = makeThread();

    await handleMomentSuccess(thread as never, '0xContract', '42');

    expect(thread.post).toHaveBeenCalledWith(
      '✅ Moment created! https://inprocess.world/collect/base:0xContract/42'
    );
  });

  it('still posts the success message even when thread.post is called once', async () => {
    const thread = makeThread();

    await handleMomentSuccess(thread as never, '0xContract', '42');

    expect(thread.post).toHaveBeenCalledOnce();
  });
});
