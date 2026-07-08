import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../getPendingEmail', () => ({ default: vi.fn() }));
vi.mock('../promptTelegramEmail', () => ({ default: vi.fn() }));
vi.mock('../connectTelegramToAccount', () => ({ default: vi.fn() }));

import getPendingEmail from '../getPendingEmail';
import promptTelegramEmail from '../promptTelegramEmail';
import connectTelegramToAccount from '../connectTelegramToAccount';
import connectHandler from '../connectHandler';

const TG_USERNAME = 'testuser';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(promptTelegramEmail).mockResolvedValue(undefined);
  vi.mocked(connectTelegramToAccount).mockResolvedValue(undefined);
});

describe('connectHandler', () => {
  it('prompts for email when no email reply is pending', async () => {
    vi.mocked(getPendingEmail).mockResolvedValue(false);
    const thread = makeThread();

    await connectHandler('hello', thread as never, TG_USERNAME);

    expect(promptTelegramEmail).toHaveBeenCalledWith(thread);
    expect(connectTelegramToAccount).not.toHaveBeenCalled();
  });

  it('delegates to connectTelegramToAccount when an email reply is pending', async () => {
    vi.mocked(getPendingEmail).mockResolvedValue(true);
    const thread = makeThread();

    await connectHandler('me@example.com', thread as never, TG_USERNAME);

    expect(connectTelegramToAccount).toHaveBeenCalledWith(
      thread,
      'me@example.com',
      TG_USERNAME
    );
    expect(promptTelegramEmail).not.toHaveBeenCalled();
  });
});
