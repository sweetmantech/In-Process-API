import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/privy/getPrivyWalletAddressesByEmail', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/oauth/sendCodeHandler', () => ({ default: vi.fn() }));
vi.mock('../clearPendingEmail', () => ({ default: vi.fn() }));
vi.mock('../setPendingCode', () => ({ default: vi.fn() }));

import getPrivyWalletAddressesByEmail from '@/lib/privy/getPrivyWalletAddressesByEmail';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import sendCodeHandler from '@/lib/oauth/sendCodeHandler';
import clearPendingEmail from '@/lib/telegram/chat/auth/clearPendingEmail';
import setPendingCode from '@/lib/telegram/chat/auth/setPendingCode';
import connectTelegramToAccount from '@/lib/telegram/chat/auth/connectTelegramToAccount';

const WALLET_ADDRESS = '0xArtist';
const ARTIST = { id: 'uuid-artist-1234', username: 'alice' };

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(sendCodeHandler).mockResolvedValue(undefined as never);
  vi.mocked(clearPendingEmail).mockResolvedValue(undefined);
  vi.mocked(setPendingCode).mockResolvedValue(undefined);
});

describe('connectTelegramToAccount', () => {
  it('replies with an invalid-email message and does not look up Privy', async () => {
    const thread = makeThread();

    await connectTelegramToAccount(thread as never, 'not-an-email');

    expect(getPrivyWalletAddressesByEmail).not.toHaveBeenCalled();
    expect(thread.post).toHaveBeenCalledWith(
      expect.stringContaining('valid email')
    );
  });

  it('sends a verification code with a null artistId when no wallet matches the email', async () => {
    vi.mocked(getPrivyWalletAddressesByEmail).mockResolvedValue([]);
    const thread = makeThread();

    await connectTelegramToAccount(thread as never, 'user@example.com');

    expect(selectWallets).not.toHaveBeenCalled();
    expect(sendCodeHandler).toHaveBeenCalledWith('user@example.com');
    expect(setPendingCode).toHaveBeenCalledWith(thread, {
      email: 'user@example.com',
      artistId: null,
      username: null,
    });
    expect(thread.post).toHaveBeenCalledWith(
      expect.stringContaining('verification code')
    );
  });

  it('sends a verification code with a null artistId when the wallet has no linked artist', async () => {
    vi.mocked(getPrivyWalletAddressesByEmail).mockResolvedValue([
      WALLET_ADDRESS,
    ]);
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ artist: null }],
    } as never);
    const thread = makeThread();

    await connectTelegramToAccount(thread as never, 'user@example.com');

    expect(sendCodeHandler).toHaveBeenCalledWith('user@example.com');
    expect(setPendingCode).toHaveBeenCalledWith(thread, {
      email: 'user@example.com',
      artistId: null,
      username: null,
    });
    expect(thread.post).toHaveBeenCalledWith(
      expect.stringContaining('verification code')
    );
  });

  it('sends a verification code with the matched artistId when a match is found', async () => {
    vi.mocked(getPrivyWalletAddressesByEmail).mockResolvedValue([
      WALLET_ADDRESS,
    ]);
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ artist: ARTIST }],
    } as never);
    const thread = makeThread();

    await connectTelegramToAccount(thread as never, 'user@example.com');

    expect(sendCodeHandler).toHaveBeenCalledWith('user@example.com');
    expect(setPendingCode).toHaveBeenCalledWith(thread, {
      email: 'user@example.com',
      artistId: ARTIST.id,
      username: ARTIST.username,
    });
    expect(clearPendingEmail).toHaveBeenCalledWith(thread);
    expect(thread.post).toHaveBeenCalledWith(
      expect.stringContaining('verification code')
    );
  });

  it('replies with the same verification-code message regardless of whether a match was found', async () => {
    vi.mocked(getPrivyWalletAddressesByEmail).mockResolvedValue([]);
    const unmatchedThread = makeThread();
    await connectTelegramToAccount(
      unmatchedThread as never,
      'user@example.com'
    );

    vi.mocked(getPrivyWalletAddressesByEmail).mockResolvedValue([
      WALLET_ADDRESS,
    ]);
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ artist: ARTIST }],
    } as never);
    const matchedThread = makeThread();
    await connectTelegramToAccount(matchedThread as never, 'user@example.com');

    expect(unmatchedThread.post.mock.calls[0]).toEqual(
      matchedThread.post.mock.calls[0]
    );
  });
});
