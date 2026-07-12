import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/telegram/chat/auth/getPendingCode', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/telegram/chat/auth/getPendingEmail', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/telegram/chat/auth/promptTelegramEmail', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/telegram/chat/auth/connectTelegramToAccount', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/telegram/chat/auth/verifyTelegramCode', () => ({
  default: vi.fn(),
}));

import getPendingCode from '@/lib/telegram/chat/auth/getPendingCode';
import getPendingEmail from '@/lib/telegram/chat/auth/getPendingEmail';
import promptTelegramEmail from '@/lib/telegram/chat/auth/promptTelegramEmail';
import connectTelegramToAccount from '@/lib/telegram/chat/auth/connectTelegramToAccount';
import verifyTelegramCode from '@/lib/telegram/chat/auth/verifyTelegramCode';
import connectHandler from '../connectHandler';

const TG_USERNAME = 'testuser';
const PENDING_CODE = {
  email: 'user@example.com',
  artistId: 'uuid-artist-1234',
  username: 'alice',
};

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPendingCode).mockResolvedValue(null);
  vi.mocked(promptTelegramEmail).mockResolvedValue(undefined);
  vi.mocked(connectTelegramToAccount).mockResolvedValue(undefined);
  vi.mocked(verifyTelegramCode).mockResolvedValue(undefined);
});

describe('connectHandler', () => {
  it('prompts for email when no email or code reply is pending', async () => {
    vi.mocked(getPendingEmail).mockResolvedValue(false);
    const thread = makeThread();

    await connectHandler('hello', thread as never, TG_USERNAME);

    expect(promptTelegramEmail).toHaveBeenCalledWith(thread);
    expect(connectTelegramToAccount).not.toHaveBeenCalled();
    expect(verifyTelegramCode).not.toHaveBeenCalled();
  });

  it('delegates to connectTelegramToAccount when an email reply is pending', async () => {
    vi.mocked(getPendingEmail).mockResolvedValue(true);
    const thread = makeThread();

    await connectHandler('me@example.com', thread as never, TG_USERNAME);

    expect(connectTelegramToAccount).toHaveBeenCalledWith(
      thread,
      'me@example.com'
    );
    expect(promptTelegramEmail).not.toHaveBeenCalled();
    expect(verifyTelegramCode).not.toHaveBeenCalled();
  });

  it('delegates to verifyTelegramCode when a verification code reply is pending, regardless of email state', async () => {
    vi.mocked(getPendingCode).mockResolvedValue(PENDING_CODE);
    const thread = makeThread();

    await connectHandler('123456', thread as never, TG_USERNAME);

    expect(verifyTelegramCode).toHaveBeenCalledWith(
      thread,
      '123456',
      TG_USERNAME,
      PENDING_CODE
    );
    expect(connectTelegramToAccount).not.toHaveBeenCalled();
    expect(promptTelegramEmail).not.toHaveBeenCalled();
  });
});
