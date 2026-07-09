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
import clearPendingEmail from '../clearPendingEmail';
import setPendingCode from '../setPendingCode';
import connectTelegramToAccount from '../connectTelegramToAccount';

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

  it('replies with a not-found message when no wallet matches the email', async () => {
    vi.mocked(getPrivyWalletAddressesByEmail).mockResolvedValue([]);
    const thread = makeThread();

    await connectTelegramToAccount(thread as never, 'user@example.com');

    expect(selectWallets).not.toHaveBeenCalled();
    expect(sendCodeHandler).not.toHaveBeenCalled();
    expect(thread.post).toHaveBeenCalledWith(
      expect.stringContaining("couldn't find")
    );
  });

  it('replies with a not-found message when the wallet has no linked artist', async () => {
    vi.mocked(getPrivyWalletAddressesByEmail).mockResolvedValue([
      WALLET_ADDRESS,
    ]);
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ artist: null }],
    } as never);
    const thread = makeThread();

    await connectTelegramToAccount(thread as never, 'user@example.com');

    expect(sendCodeHandler).not.toHaveBeenCalled();
    expect(thread.post).toHaveBeenCalledWith(
      expect.stringContaining("couldn't find")
    );
  });

  it('sends a verification code and does not link the artist yet when a match is found', async () => {
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
});
